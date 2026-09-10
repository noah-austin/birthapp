import { el, clear, formatDateTime, formatClock, download, confirmAction, buzz } from '../util.js';
import { store, settings } from '../state.js';

export const quickEvents = [
  'Contractions started',
  'Water broke',
  'Bloody show',
  'Called the midwife',
  'Left for the birth center',
  'Arrived at the birth center',
  'Cervical check',
  'Got in the tub',
  'Started pushing',
  'CLARA IS HERE',
  'Placenta delivered',
  'Cord cut',
  'First latch',
  'Transferred to hospital',
];

export function addEvent(label, note = '') {
  return store.add('events', { at: Date.now(), label, note });
}

function sortedEvents() {
  return store.list('events').sort((a, b) => b.at - a.at);
}

function buildStory() {
  const s = settings();
  const events = [...sortedEvents()].reverse();
  const surges = store.list('contractions').filter((c) => c.start && c.end);
  const lines = [`${s.babyName}'s Birth Story`, '='.repeat(24), ''];

  if (events.length) {
    const first = events[0].at;
    const born = events.find((e) => /clara is here|born/i.test(e.label));
    if (born) {
      const hours = (born.at - first) / 3600000;
      lines.push(`Labor began ${formatDateTime(first)}.`);
      lines.push(`${s.babyName} arrived ${formatDateTime(born.at)} — ${hours.toFixed(1)} hours later.`);
      lines.push('');
    }
  }

  lines.push(`Surges timed: ${surges.length}`, '');
  lines.push('Timeline', '-'.repeat(24));
  for (const event of events) {
    lines.push(`${formatDateTime(event.at)}  ${event.label}${event.note && event.note !== 'auto' ? ` — ${event.note}` : ''}`);
  }
  return lines.join('\n');
}

export default function logView(root) {
  const listNode = el('div', { class: 'log-list' });
  const noteInput = el('input', { class: 'text-input', type: 'text', placeholder: 'Write your own note…', maxlength: '200' });

  function addCustom() {
    const value = noteInput.value.trim();
    if (!value) return;
    addEvent(value);
    noteInput.value = '';
    buzz(12);
    update();
  }

  noteInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addCustom();
  });

  const quickGrid = el('div', { class: 'chip-grid' },
    quickEvents.map((label) => el('button', {
      class: `chip${label === 'CLARA IS HERE' ? ' chip-hero' : ''}`,
      type: 'button',
      onclick: () => {
        addEvent(label);
        buzz(label === 'CLARA IS HERE' ? [30, 60, 30, 60, 90] : 12);
        update();
      },
    }, label)));

  function update() {
    const events = sortedEvents();
    clear(listNode);
    if (!events.length) {
      listNode.append(el('p', { class: 'empty' }, 'Nothing logged yet. Tap a moment above as it happens — this becomes Clara’s birth story.'));
      return;
    }
    let lastDay = '';
    for (const event of events) {
      const day = new Date(event.at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        listNode.append(el('div', { class: 'log-day' }, new Date(event.at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })));
      }
      listNode.append(el('div', { class: 'log-row' },
        el('span', { class: 'log-time mono' }, formatClock(event.at)),
        el('span', { class: 'log-label' }, event.label,
          event.note && event.note !== 'auto' ? el('span', { class: 'log-note' }, event.note) : null),
        el('button', {
          class: 'icon-btn',
          type: 'button',
          'aria-label': `Delete ${event.label}`,
          onclick: () => {
            if (confirmAction(`Delete "${event.label}"?`)) {
              store.remove('events', event.id);
              update();
            }
          },
        }, '×')));
    }
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Labor log'),
      el('p', { class: 'sub' }, 'Tap a moment the second it happens. You will not remember the times afterwards — nobody does.')),
    el('div', { class: 'card' }, quickGrid),
    el('div', { class: 'card' },
      el('div', { class: 'row' }, noteInput, el('button', { class: 'btn', type: 'button', onclick: addCustom }, 'Add'))),
    el('div', { class: 'card' }, el('h2', {}, 'Timeline'), listNode),
    el('div', { class: 'card' },
      el('button', {
        class: 'btn btn-wide',
        type: 'button',
        onclick: () => download(`${settings().babyName || 'baby'}-birth-story.txt`, buildStory()),
      }, 'Export birth story')),
  );

  update();
  return { update };
}
