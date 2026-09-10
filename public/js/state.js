import { uid } from './util.js';

const LS_RECORDS = 'clara.records.v1';
const LS_DEVICE = 'clara.device.v1';
const LS_ROOM = 'clara.room.v1';
const LS_PASS = 'clara.pass.v1';

export const deviceId = (() => {
  let id = localStorage.getItem(LS_DEVICE);
  if (!id) {
    id = uid();
    localStorage.setItem(LS_DEVICE, id);
  }
  return id;
})();

export function getRoomName() {
  return localStorage.getItem(LS_ROOM) || 'clara';
}

export function setRoomName(name) {
  localStorage.setItem(LS_ROOM, (name || 'clara').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'clara');
}

export function getPasscode() {
  return localStorage.getItem(LS_PASS) || '';
}

export function setPasscode(pass) {
  if (pass) localStorage.setItem(LS_PASS, pass);
  else localStorage.removeItem(LS_PASS);
}

/**
 * Everything the app knows lives in one flat map of last-write-wins records.
 * Views subscribe; the sync client feeds remote changes in through `applyRemote`.
 */
class Store {
  constructor() {
    this.records = new Map();
    this.listeners = new Set();
    this.outbox = [];
    this.onOutbound = null;
    this.load();
  }

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_RECORDS) || '[]');
      for (const rec of raw) if (rec && rec.k) this.records.set(rec.k, rec);
    } catch {
      /* corrupt storage should never block the app on the day it matters */
    }
  }

  persist() {
    if (this._persistTimer) return;
    this._persistTimer = setTimeout(() => {
      this._persistTimer = null;
      try {
        localStorage.setItem(LS_RECORDS, JSON.stringify([...this.records.values()]));
      } catch (err) {
        console.warn('local persistence failed', err);
      }
    }, 250);
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    if (this._emitTimer) return;
    this._emitTimer = setTimeout(() => {
      this._emitTimer = null;
      for (const fn of this.listeners) fn();
    }, 0);
  }

  static isNewer(incoming, existing) {
    if (!existing) return true;
    if (incoming.u !== existing.u) return incoming.u > existing.u;
    return String(incoming.dev || '') > String(existing.dev || '');
  }

  /** Write a record locally and queue it for the server. */
  write(collection, id, data, { deleted = false } = {}) {
    const rec = {
      k: `${collection}:${id}`,
      c: collection,
      id,
      d: data || {},
      u: Date.now(),
      dev: deviceId,
      del: deleted,
    };
    this.records.set(rec.k, rec);
    this.outbox.push(rec);
    this.persist();
    this.emit();
    this.onOutbound?.([rec]);
    return rec;
  }

  put(collection, id, patch) {
    const existing = this.get(collection, id);
    return this.write(collection, id, { ...(existing || {}), ...patch, id });
  }

  add(collection, data) {
    const id = data.id || uid();
    return this.write(collection, id, { ...data, id });
  }

  remove(collection, id) {
    return this.write(collection, id, {}, { deleted: true });
  }

  get(collection, id) {
    const rec = this.records.get(`${collection}:${id}`);
    if (!rec || rec.del) return null;
    return rec.d;
  }

  list(collection) {
    const out = [];
    for (const rec of this.records.values()) {
      if (rec.c === collection && !rec.del) out.push(rec.d);
    }
    return out;
  }

  /** Merge server records without echoing them back out. */
  applyRemote(incoming) {
    let changed = false;
    for (const rec of incoming) {
      if (!rec || typeof rec.k !== 'string') continue;
      const existing = this.records.get(rec.k);
      if (Store.isNewer(rec, existing)) {
        this.records.set(rec.k, rec);
        changed = true;
      }
    }
    if (changed) {
      this.persist();
      this.emit();
    }
    return changed;
  }

  allRecords() {
    return [...this.records.values()];
  }

  drainOutbox() {
    const items = this.outbox;
    this.outbox = [];
    return items;
  }

  wipe() {
    // Tombstone everything so the erasure propagates to the other phone too.
    for (const rec of [...this.records.values()]) {
      if (!rec.del) this.write(rec.c, rec.id, {}, { deleted: true });
    }
  }
}

export const store = new Store();

/* ---- Settings ------------------------------------------------------------ */

const SETTINGS_ID = 'app';

export const defaultSettings = {
  momName: 'Jillian',
  partnerName: 'Noah',
  babyName: 'Clara',
  supportName: 'Renee',
  dueDate: '',
  theme: 'auto',
  autoplaySeconds: 12,
  contacts: [
    { id: 'c1', label: 'Midwife Harmony', phone: '', note: 'After-hours line' },
    { id: 'c2', label: 'Austin Area Birthing Center', phone: '', note: '' },
    { id: 'c3', label: 'Renee Martin (Mom)', phone: '', note: 'Support person' },
    { id: 'c4', label: 'Backup hospital', phone: '', note: '' },
  ],
  playlistUrl: '',
};

export function settings() {
  return { ...defaultSettings, ...(store.get('settings', SETTINGS_ID) || {}) };
}

export function updateSettings(patch) {
  store.put('settings', SETTINGS_ID, { ...settings(), ...patch });
}
