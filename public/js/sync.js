import { store, deviceId, getRoomName, getPasscode } from './state.js';

/**
 * WebSocket sync with an HTTP fallback and an offline queue.
 *
 * The app never waits on the network. Writes land in localStorage first; this
 * client's only job is to push them out and fold in what the other phone did.
 */
class SyncClient extends EventTarget {
  constructor() {
    super();
    this.ws = null;
    // Starts unset, not 'offline', so the first real status always reaches the
    // banner. Seeding it with a real value swallows that first update.
    this.status = null;
    this.peers = 0;
    this.retryDelay = 1000;
    this.pending = [];
    this.lastError = '';

    store.onOutbound = (records) => this.push(records);

    window.addEventListener('online', () => this.connect());
    // Say so the moment the signal drops. A banner reading "Synced" when
    // nothing is reaching the other phone is worse than no banner at all.
    window.addEventListener('offline', () => {
      this.peers = 0;
      this.setStatus('offline');
      try {
        this.ws?.close();
      } catch {
        /* already gone */
      }
      this.ws = null;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.connect();
    });
  }

  setStatus(status, error = '') {
    if (this.status === status && this.lastError === error) return;
    this.status = status;
    this.lastError = error;
    this.dispatchEvent(new CustomEvent('status', { detail: { status, error, peers: this.peers } }));
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.setStatus('connecting');
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    let ws;
    try {
      ws = new WebSocket(`${proto}//${location.host}/sync`);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;

    ws.addEventListener('open', () => {
      this.retryDelay = 1000;
      ws.send(JSON.stringify({
        t: 'hello',
        room: getRoomName(),
        pass: getPasscode(),
        dev: deviceId,
        records: store.allRecords(),
      }));
    });

    ws.addEventListener('message', (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.t === 'state') {
        store.applyRemote(msg.records || []);
        this.setStatus('online');
        this.flushPending();
      } else if (msg.t === 'patch') {
        store.applyRemote(msg.records || []);
      } else if (msg.t === 'presence') {
        this.peers = msg.count || 0;
        this.dispatchEvent(new CustomEvent('status', {
          detail: { status: this.status, error: this.lastError, peers: this.peers },
        }));
      } else if (msg.t === 'error') {
        this.setStatus('error', msg.message || 'Sync refused');
      }
    });

    ws.addEventListener('close', () => {
      this.ws = null;
      this.peers = 0;
      if (this.status !== 'error') this.setStatus('offline');
      this.scheduleRetry();
    });

    ws.addEventListener('error', () => {
      // 'close' always follows; retry is handled there.
    });
  }

  scheduleRetry() {
    if (this.status === 'error') return; // A bad passcode will not fix itself.
    clearTimeout(this._retry);
    this._retry = setTimeout(() => this.connect(), this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 1.7, 20000);
  }

  push(records) {
    if (!records?.length) return;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ t: 'patch', records }));
    } else {
      this.pending.push(...records);
      this.tryHttpFallback();
    }
  }

  flushPending() {
    if (!this.pending.length) return;
    const batch = this.pending;
    this.pending = [];
    this.push(batch);
  }

  /** Used when WebSockets are blocked (some hospital networks do this). */
  async tryHttpFallback() {
    if (this._httpBusy || !navigator.onLine) return;
    this._httpBusy = true;
    try {
      const batch = this.pending;
      this.pending = [];
      const res = await fetch('/api/patch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: getRoomName(), pass: getPasscode(), records: batch }),
      });
      if (res.ok) {
        const body = await res.json();
        store.applyRemote(body.records || []);
      } else {
        this.pending.unshift(...batch);
      }
    } catch {
      /* still offline — the queue keeps waiting */
    } finally {
      this._httpBusy = false;
    }
  }

  async forcePull() {
    try {
      const url = `/api/state?room=${encodeURIComponent(getRoomName())}&pass=${encodeURIComponent(getPasscode())}`;
      const res = await fetch(url);
      if (!res.ok) return false;
      const body = await res.json();
      store.applyRemote(body.records || []);
      return true;
    } catch {
      return false;
    }
  }

  reconnect() {
    this.setStatus('connecting');
    this.retryDelay = 1000;
    try {
      this.ws?.close();
    } catch {
      /* already closed */
    }
    this.ws = null;
    this.connect();
  }
}

export const sync = new SyncClient();
