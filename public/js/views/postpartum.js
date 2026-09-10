import { el, clear, formatClock, formatAgo, formatDuration, confirmAction, buzz } from '../util.js';
import { store, settings } from '../state.js';

const DAY = 24 * 60 * 60 * 1000;

function within24h(items) {
  const cutoff = Date.now() - DAY;
  return items.filter((item) => item.at >= cutoff);
}

function sortDesc(collection) {
  return store.list(collection).sort((a, b) => b.at - a.at);
}

export default function postpartumView(root) {
  let tab = 'feeds';
  const body = el('div', {});
  const summary = el('div', { class: 'stat-grid' });
  const tabRow = el('div', { class: 'filter-row' });

  /* ---- Feeding ---------------------------------------------------------- */

  function activeFeed() {
    return store.get('feedTimer', 'active');
  }

  function feedSection() {
    const running = activeFeed()?.startedAt || null;
    const node = el('div', {});

    const sideButtons = el('div', { class: 'chip-grid' },
      ['Left', 'Right', 'Both'].map((side) => el('button', {
        class: 'chip',
        type: 'button',
        onclick: () => {
          if (running) {
            store.add('feeds', { at: running, side, minutes: Math.round((Date.now() - running) / 60000) });
            store.put('feedTimer', 'active', { startedAt: null });
          } else {
            store.add('feeds', { at: Date.now(), side, minutes: null });
          }
          buzz(12);
          paint();
        },
      }, side)));

    node.append(
      el('div', { class: 'card' },
        el('h2', {}, running ? 'Feeding now' : 'Log a feed'),
        running
          ? el('p', { class: 'big-timer mono' }, formatDuration(Date.now() - running))
          : el('p', { class: 'small' }, 'Start the timer, or just tap a side to log it instantly.'),
        el('button', {
          class: `btn btn-wide${running ? ' btn-quiet' : ''}`,
          type: 'button',
          onclick: () => {
            store.put('feedTimer', 'active', { startedAt: running ? null : Date.now() });
            buzz(12);
            paint();
          },
        }, running ? 'Cancel timer' : 'Start feed timer'),
        el('p', { class: 'small' }, running ? 'Tap the side she finished on to save it:' : 'Or log which side:'),
        sideButtons),
      historyCard('feeds', (item) => `${item.side}${item.minutes ? ` · ${item.minutes} min` : ''}`),
    );
    return node;
  }

  /* ---- Diapers ---------------------------------------------------------- */

  function diaperSection() {
    return el('div', {},
      el('div', { class: 'card' },
        el('h2', {}, 'Log a diaper'),
        el('div', { class: 'chip-grid' },
          [['Wet', '💧'], ['Dirty', '💩'], ['Both', '💧💩']].map(([type, icon]) => el('button', {
            class: 'chip chip-big',
            type: 'button',
            onclick: () => { store.add('diapers', { at: Date.now(), type }); buzz(12); paint(); },
          }, `${icon} ${type}`)))),
      el('div', { class: 'card muted-card' },
        el('h2', {}, 'What is normal'),
        el('p', { class: 'small' }, 'Roughly one wet diaper per day of life for the first week — 1 on day one, 2 on day two, and so on, levelling off around 6+ a day once your milk is in.'),
        el('p', { class: 'small' }, 'Stools go black/tarry → green → yellow and seedy over the first week. Call the midwife about fewer wet diapers than expected, no stool in 24h after day 1, or a baby too sleepy to feed.')),
      historyCard('diapers', (item) => item.type),
    );
  }

  /* ---- Mom ------------------------------------------------------------- */

  function momSection() {
    const noteInput = el('textarea', { class: 'text-area', rows: '3', placeholder: 'How is she doing? Bleeding, pain, mood, meds, what she ate…' });
    const painInput = el('input', { type: 'range', min: '0', max: '10', value: '0', class: 'range' });
    const painLabel = el('span', { class: 'mono' }, '0');
    painInput.addEventListener('input', () => { painLabel.textContent = painInput.value; });

    return el('div', {},
      el('div', { class: 'card' },
        el('h2', {}, `How is ${settings().momName}?`),
        noteInput,
        el('div', { class: 'row' }, el('span', { class: 'small' }, 'Pain'), painInput, painLabel),
        el('button', {
          class: 'btn btn-wide',
          type: 'button',
          onclick: () => {
            const text = noteInput.value.trim();
            if (!text && painInput.value === '0') return;
            store.add('momNotes', { at: Date.now(), text, pain: Number(painInput.value) });
            noteInput.value = '';
            painInput.value = '0';
            painLabel.textContent = '0';
            buzz(12);
            paint();
          },
        }, 'Save note')),
      el('div', { class: 'card warn-card' },
        el('h2', {}, 'Call someone now if'),
        el('ul', { class: 'do-list' },
          el('li', {}, 'Soaking a pad in an hour or less, or passing clots bigger than a golf ball'),
          el('li', {}, 'Fever over 100.4°F'),
          el('li', {}, 'Severe headache, vision changes, or upper-right belly pain'),
          el('li', {}, 'Chest pain, trouble breathing, or a hot swollen calf'),
          el('li', {}, 'A red, hot, painful area on the breast with flu-like symptoms'),
          el('li', {}, 'Thoughts of harming herself or the baby — call immediately, this is treatable and common'))),
      historyCard('momNotes', (item) => `${item.text || 'Note'}${item.pain ? ` · pain ${item.pain}/10` : ''}`),
    );
  }

  /* ---- Shared ----------------------------------------------------------- */

  function historyCard(collection, describe) {
    const items = sortDesc(collection).slice(0, 60);
    const list = el('div', { class: 'log-list' });
    if (!items.length) {
      list.append(el('p', { class: 'empty' }, 'Nothing logged yet.'));
    } else {
      let lastDay = '';
      for (const item of items) {
        const day = new Date(item.at).toDateString();
        if (day !== lastDay) {
          lastDay = day;
          list.append(el('div', { class: 'log-day' }, new Date(item.at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })));
        }
        list.append(el('div', { class: 'log-row' },
          el('span', { class: 'log-time mono' }, formatClock(item.at)),
          el('span', { class: 'log-label' }, describe(item)),
          el('button', {
            class: 'icon-btn',
            type: 'button',
            'aria-label': 'Delete entry',
            onclick: () => {
              if (confirmAction('Delete this entry?')) { store.remove(collection, item.id); paint(); }
            },
          }, '×')));
      }
    }
    return el('div', { class: 'card' }, el('h2', {}, 'History'), list);
  }

  function paintSummary() {
    const feeds = within24h(store.list('feeds'));
    const diapers = within24h(store.list('diapers'));
    const lastFeed = sortDesc('feeds')[0];
    const wet = diapers.filter((d) => d.type === 'Wet' || d.type === 'Both').length;
    const dirty = diapers.filter((d) => d.type === 'Dirty' || d.type === 'Both').length;

    clear(summary);
    summary.append(
      el('div', { class: 'stat' }, el('div', { class: 'stat-value' }, lastFeed ? formatAgo(lastFeed.at) : '—'), el('div', { class: 'stat-label' }, 'Last feed')),
      el('div', { class: 'stat' }, el('div', { class: 'stat-value' }, String(feeds.length)), el('div', { class: 'stat-label' }, 'Feeds / 24h')),
      el('div', { class: 'stat' }, el('div', { class: 'stat-value' }, String(wet)), el('div', { class: 'stat-label' }, 'Wet / 24h')),
      el('div', { class: 'stat' }, el('div', { class: 'stat-value' }, String(dirty)), el('div', { class: 'stat-label' }, 'Dirty / 24h')),
    );
  }

  function paint() {
    clear(tabRow);
    for (const [id, label] of [['feeds', 'Feeding'], ['diapers', 'Diapers'], ['mom', settings().momName]]) {
      tabRow.append(el('button', {
        class: `filter-btn${tab === id ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => { tab = id; paint(); },
      }, label));
    }
    paintSummary();
    clear(body);
    body.append(tab === 'feeds' ? feedSection() : tab === 'diapers' ? diaperSection() : momSection());
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Postpartum'),
      el('p', { class: 'sub' }, 'The first days blur together. Let the phone remember.')),
    summary,
    tabRow,
    body,
  );

  paint();
  // Keep the running feed timer honest without a full re-render storm.
  const tick = setInterval(() => { if (tab === 'feeds' && activeFeed()?.startedAt) paint(); }, 1000);

  return {
    update: paint,
    destroy() { clearInterval(tick); },
  };
}
