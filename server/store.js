import fs from 'node:fs';
import path from 'node:path';

/**
 * Tiny last-write-wins record store with debounced atomic persistence.
 *
 * A record looks like:
 *   { k: 'contractions:abc', c: 'contractions', id: 'abc', d: {...}, u: 1736..., dev: 'x9f', del: false }
 *
 * Merge rule: higher `u` (updatedAt in ms) wins. Ties broken by comparing
 * `dev` so every peer converges on the same answer regardless of arrival order.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');

export function isNewer(incoming, existing) {
  if (!existing) return true;
  if (incoming.u !== existing.u) return incoming.u > existing.u;
  return String(incoming.dev || '') > String(existing.dev || '');
}

export class RoomStore {
  constructor(name) {
    this.name = name;
    this.records = new Map();
    this.file = path.join(DATA_DIR, `${encodeURIComponent(name)}.json`);
    this.saveTimer = null;
    this.load();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      for (const rec of parsed.records || []) {
        if (rec && rec.k) this.records.set(rec.k, rec);
      }
      console.log(`[store] loaded room "${this.name}" (${this.records.size} records)`);
    } catch (err) {
      if (err.code !== 'ENOENT') console.warn(`[store] could not load ${this.file}:`, err.message);
    }
  }

  /** Merge incoming records. Returns only the ones that actually changed state. */
  merge(incoming) {
    const applied = [];
    for (const rec of incoming) {
      if (!rec || typeof rec.k !== 'string' || typeof rec.u !== 'number') continue;
      const existing = this.records.get(rec.k);
      if (isNewer(rec, existing)) {
        this.records.set(rec.k, rec);
        applied.push(rec);
      }
    }
    if (applied.length) this.scheduleSave();
    return applied;
  }

  all() {
    return [...this.records.values()];
  }

  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.saveNow();
    }, 800);
  }

  saveNow() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = `${this.file}.tmp`;
      const payload = JSON.stringify({ savedAt: Date.now(), records: this.all() });
      fs.writeFileSync(tmp, payload);
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error('[store] save failed:', err.message);
    }
  }
}

const rooms = new Map();

export function getRoom(name) {
  const key = (name || 'clara').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'clara';
  if (!rooms.has(key)) rooms.set(key, new RoomStore(key));
  return rooms.get(key);
}

export function flushAll() {
  for (const room of rooms.values()) {
    if (room.saveTimer) clearTimeout(room.saveTimer);
    room.saveNow();
  }
}
