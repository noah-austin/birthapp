import { el, clear, download, confirmAction, uid } from '../util.js';
import { store, settings, updateSettings, getRoomName, setRoomName, getPasscode, setPasscode, deviceId } from '../state.js';
import { sync } from '../sync.js';

function field(label, input, hint) {
  return el('label', { class: 'field' },
    el('span', { class: 'field-label' }, label),
    input,
    hint ? el('span', { class: 'field-hint' }, hint) : null);
}

export default function settingsView(root) {
  const s = settings();
  const contactsNode = el('div', { class: 'contact-edit-list' });
  const syncNode = el('div', {});

  function textInput(value, onChange, attrs = {}) {
    const input = el('input', { class: 'text-input', type: 'text', value: value || '', ...attrs });
    input.addEventListener('change', () => onChange(input.value.trim()));
    return input;
  }

  function paintContacts() {
    clear(contactsNode);
    const current = settings().contacts || [];
    for (const contact of current) {
      contactsNode.append(el('div', { class: 'contact-edit' },
        textInput(contact.label, (value) => saveContact(contact.id, { label: value }), { placeholder: 'Name' }),
        textInput(contact.phone, (value) => saveContact(contact.id, { phone: value }), { placeholder: 'Phone', type: 'tel', inputmode: 'tel' }),
        textInput(contact.note, (value) => saveContact(contact.id, { note: value }), { placeholder: 'Note' }),
        el('button', {
          class: 'icon-btn',
          type: 'button',
          'aria-label': `Remove ${contact.label || 'contact'}`,
          onclick: () => {
            updateSettings({ contacts: settings().contacts.filter((c) => c.id !== contact.id) });
            paintContacts();
          },
        }, '×')));
    }
    contactsNode.append(el('button', {
      class: 'btn btn-quiet btn-wide',
      type: 'button',
      onclick: () => {
        updateSettings({ contacts: [...settings().contacts, { id: uid(), label: '', phone: '', note: '' }] });
        paintContacts();
      },
    }, '+ Add contact'));
  }

  function saveContact(id, patch) {
    updateSettings({
      contacts: settings().contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function paintSync() {
    clear(syncNode);
    const labels = {
      online: 'Connected',
      connecting: 'Connecting…',
      offline: 'Offline — everything is still saved on this phone',
      error: sync.lastError || 'Sync refused',
    };
    syncNode.append(
      el('div', { class: `sync-badge is-${sync.status}` }, labels[sync.status] || sync.status),
      sync.peers > 1 ? el('p', { class: 'small' }, `${sync.peers} devices connected to room “${getRoomName()}”.`) : null,
    );
  }

  sync.addEventListener('status', paintSync);

  root.append(
    el('header', { class: 'view-head' }, el('h1', {}, 'Settings')),

    el('div', { class: 'card' },
      el('h2', {}, 'Who this is for'),
      field('Mom', textInput(s.momName, (v) => updateSettings({ momName: v || 'Jillian' }))),
      field('Partner', textInput(s.partnerName, (v) => updateSettings({ partnerName: v || 'Noah' }))),
      field('Baby', textInput(s.babyName, (v) => updateSettings({ babyName: v || 'Clara' }))),
      field('Due date', (() => {
        const input = el('input', { class: 'text-input', type: 'date', value: s.dueDate || '' });
        input.addEventListener('change', () => updateSettings({ dueDate: input.value }));
        return input;
      })(), 'Only used for the countdown on the home screen.')),

    el('div', { class: 'card' },
      el('h2', {}, 'Contacts'),
      el('p', { class: 'small' }, 'These become one-tap call buttons on the home screen.'),
      contactsNode),

    el('div', { class: 'card' },
      el('h2', {}, 'Worship playlist'),
      field('Link', textInput(s.playlistUrl, (v) => updateSettings({ playlistUrl: v }), { placeholder: 'https://…', type: 'url' }),
        'Download it for offline listening before labor.')),

    el('div', { class: 'card' },
      el('h2', {}, 'Appearance'),
      el('div', { class: 'filter-row' },
        [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dim']].map(([id, label]) => el('button', {
          class: `filter-btn${settings().theme === id ? ' is-active' : ''}`,
          type: 'button',
          onclick: (event) => {
            updateSettings({ theme: id });
            for (const sibling of event.target.parentNode.children) sibling.classList.remove('is-active');
            event.target.classList.add('is-active');
          },
        }, label))),
      el('p', { class: 'small' }, 'Dim is built for a dark birth room — warm, low contrast, no white flash.')),

    el('div', { class: 'card' },
      el('h2', {}, 'Sync'),
      syncNode,
      field('Room name', textInput(getRoomName(), (v) => { setRoomName(v); sync.reconnect(); paintSync(); }),
        'Both phones must use the same room name to see each other.'),
      field('Passcode', (() => {
        const input = el('input', { class: 'text-input', type: 'password', value: getPasscode(), placeholder: 'Only if the server requires one' });
        input.addEventListener('change', () => { setPasscode(input.value); sync.reconnect(); paintSync(); });
        return input;
      })(), 'Set APP_PASSCODE on the server to lock the room down.'),
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-quiet', type: 'button', onclick: () => sync.reconnect() }, 'Reconnect'),
        el('button', { class: 'btn btn-quiet', type: 'button', onclick: () => sync.forcePull() }, 'Pull from server')),
      el('p', { class: 'small mono' }, `Device ${deviceId}`)),

    el('div', { class: 'card' },
      el('h2', {}, 'Data'),
      el('button', {
        class: 'btn btn-quiet btn-wide',
        type: 'button',
        onclick: () => download('clara-backup.json', JSON.stringify(store.allRecords(), null, 2)),
      }, 'Download a backup'),
      el('button', {
        class: 'btn btn-danger btn-wide',
        type: 'button',
        onclick: () => {
          if (!confirmAction('Erase every surge, log entry, checklist tick and note — on BOTH phones? This cannot be undone.')) return;
          if (!confirmAction('Really erase everything?')) return;
          store.wipe();
          location.hash = '#/home';
        },
      }, 'Erase all data'),
      el('p', { class: 'small' }, 'Erasing propagates to the other phone the next time it connects.')),
  );

  paintContacts();
  paintSync();

  return {
    destroy() {
      sync.removeEventListener('status', paintSync);
    },
  };
}
