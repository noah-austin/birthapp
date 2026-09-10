import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { getRoom, flushAll } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3000;
const PASSCODE = process.env.APP_PASSCODE || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function authOk(pass) {
  return !PASSCODE || pass === PASSCODE;
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req, limit = 4 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function serveStatic(req, res, urlPath) {
  // Normalise and refuse anything that climbs out of public/
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = decoded === '/' ? '/index.html' : decoded;
  const target = path.join(PUBLIC_DIR, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!target.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      // Single-page app: unknown paths fall back to the shell.
      const shell = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(shell, (err2, buf) => {
        if (err2) {
          res.writeHead(404).end('Not found');
          return;
        }
        res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-cache' });
        res.end(buf);
      });
      return;
    }

    const ext = path.extname(target).toLowerCase();
    const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(36)}"`;

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { etag, 'cache-control': 'no-cache' }).end();
      return;
    }

    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      // Always revalidate: the service worker owns offline, so a stale HTTP
      // cache would only ever mean a shipped fix does not reach the phones.
      'cache-control': 'no-cache',
      etag,
    });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/healthz') {
    sendJson(res, 200, { ok: true, uptime: process.uptime() });
    return;
  }

  // Lets the client know whether a passcode is required before it asks for one.
  if (url.pathname === '/api/config') {
    sendJson(res, 200, { requiresPasscode: Boolean(PASSCODE) });
    return;
  }

  // REST fallbacks, used when WebSockets are blocked by a hospital network.
  if (url.pathname === '/api/state' && req.method === 'GET') {
    if (!authOk(url.searchParams.get('pass'))) {
      sendJson(res, 401, { error: 'bad passcode' });
      return;
    }
    const room = getRoom(url.searchParams.get('room'));
    sendJson(res, 200, { records: room.all() });
    return;
  }

  if (url.pathname === '/api/patch' && req.method === 'POST') {
    try {
      const body = JSON.parse(await readBody(req));
      if (!authOk(body.pass)) {
        sendJson(res, 401, { error: 'bad passcode' });
        return;
      }
      const room = getRoom(body.room);
      const applied = room.merge(body.records || []);
      broadcast(room.name, applied, null);
      sendJson(res, 200, { records: room.all() });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  serveStatic(req, res, url.pathname);
});

const wss = new WebSocketServer({ server, path: '/sync' });
const clients = new Set();

function broadcast(roomName, records, except) {
  if (!records.length) return;
  const msg = JSON.stringify({ t: 'patch', records });
  for (const client of clients) {
    if (client === except) continue;
    if (client.roomName !== roomName) continue;
    if (client.readyState !== client.OPEN) continue;
    client.send(msg);
  }
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.roomName = null;
  clients.add(ws);

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.t === 'hello') {
      if (!authOk(msg.pass)) {
        ws.send(JSON.stringify({ t: 'error', code: 'auth', message: 'Wrong passcode' }));
        ws.close();
        return;
      }
      const room = getRoom(msg.room);
      ws.roomName = room.name;
      // The client hands us everything it has; we merge and hand back the union.
      const applied = room.merge(msg.records || []);
      ws.send(JSON.stringify({ t: 'state', records: room.all() }));
      broadcast(room.name, applied, ws);
      broadcastPresence(room.name);
      return;
    }

    if (msg.t === 'patch') {
      if (!ws.roomName) return;
      const room = getRoom(ws.roomName);
      const applied = room.merge(msg.records || []);
      broadcast(room.name, applied, ws);
      return;
    }

    if (msg.t === 'ping') {
      ws.send(JSON.stringify({ t: 'pong' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    if (ws.roomName) broadcastPresence(ws.roomName);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

/** Tells each phone how many devices are currently connected to the same room. */
function broadcastPresence(roomName) {
  let count = 0;
  for (const client of clients) {
    if (client.roomName === roomName && client.readyState === client.OPEN) count += 1;
  }
  const msg = JSON.stringify({ t: 'presence', count });
  for (const client of clients) {
    if (client.roomName === roomName && client.readyState === client.OPEN) client.send(msg);
  }
}

// Drop connections that have gone silent so presence counts stay honest.
const heartbeat = setInterval(() => {
  for (const client of clients) {
    if (!client.isAlive) {
      client.terminate();
      clients.delete(client);
      continue;
    }
    client.isAlive = false;
    try {
      client.ping();
    } catch {
      /* connection is already gone */
    }
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`Clara's Birth Companion listening on :${PORT}`);
  if (PASSCODE) console.log('[auth] passcode required');
});

function shutdown() {
  clearInterval(heartbeat);
  flushAll();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
