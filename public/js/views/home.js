import { el, clear, formatAgo, formatDuration, mean } from '../util.js';
import { store, settings } from '../state.js';
import { affirmations, scripture } from '../data/cards.js';
import { readPattern } from './timer.js';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  return Math.round((due - Date.now()) / 86400000);
}

function dueLine(days, babyName) {
  if (days == null) return null;
  if (days > 1) return `${days} days until ${babyName}’s due date`;
  if (days === 1) return 'Due tomorrow';
  if (days === 0) return 'Due today';
  if (days === -1) return '1 day past the due date — she is on her own schedule';
  return `${Math.abs(days)} days past the due date — she is on her own schedule`;
}

export default function homeView(root, ctx) {
  const statusCard = el('div', { class: 'card' });
  const cardOfMoment = el('div', { class: 'card accent-card' });

  function paint() {
    const s = settings();
    const surges = store.list('contractions').filter((c) => c.start && c.end).sort((a, b) => a.start - b.start);
    const last = surges.at(-1);
    const active = store.get('timer', 'active')?.startedAt;
    const pattern = readPattern(surges);
    const recent = surges.slice(-5);
    const intervals = [];
    for (let i = 1; i < recent.length; i += 1) intervals.push(recent[i].start - recent[i - 1].start);

    clear(statusCard);
    statusCard.className = `card status-card is-${pattern.level}`;
    if (active) {
      statusCard.append(
        el('div', { class: 'status-kicker' }, 'Surge in progress'),
        el('div', { class: 'status-big' }, formatDuration(Date.now() - active)),
        el('p', { class: 'small' }, 'Breathe out slow. Counter-pressure. Nobody talks.'));
    } else if (!surges.length) {
      statusCard.append(
        el('div', { class: 'status-kicker' }, 'No surges timed yet'),
        el('div', { class: 'status-big' }, 'Not started'),
        el('p', { class: 'small' }, 'When they begin, tap the timer. Until then, rest.'));
    } else {
      statusCard.append(
        el('div', { class: 'status-kicker' }, pattern.title),
        el('div', { class: 'status-big' }, `${formatAgo(last.start)}`),
        el('p', { class: 'small' }, `Last surge lasted ${formatDuration(last.end - last.start)}${intervals.length ? `, averaging ${formatDuration(mean(intervals), { compact: true })} apart` : ''}.`),
        el('p', { class: 'small' }, pattern.detail));
    }
    statusCard.append(el('button', {
      class: 'btn btn-wide',
      type: 'button',
      onclick: () => ctx.navigate('timer'),
    }, active ? 'Open the timer' : 'Time a surge'));

    clear(cardOfMoment);
    const pool = [...affirmations, ...scripture];
    const card = pool[Math.floor(Math.random() * pool.length)];
    cardOfMoment.append(
      card.ref ? el('div', { class: 'deck-ref' }, card.ref) : null,
      el('p', { class: 'quote' }, card.text),
      el('button', { class: 'ghost-btn', type: 'button', onclick: () => ctx.navigate('cards') }, 'More cards →'),
    );
  }

  const s = settings();
  const days = daysUntil(s.dueDate);
  const due = dueLine(days, s.babyName);

  root.append(
    el('header', { class: 'view-head home-head' },
      el('p', { class: 'kicker' }, due || 'Waiting on Clara'),
      el('h1', {}, `${s.babyName}’s birth`),
      el('p', { class: 'sub' }, `${s.momName} & ${s.partnerName}`)),

    statusCard,

    el('div', { class: 'tile-grid' },
      tile('🌊', 'Surge timer', 'Time and read the pattern', () => ctx.navigate('timer')),
      tile('🤝', 'Noah’s playbook', 'What to do right now', () => ctx.navigate('playbook')),
      tile('🌿', 'Affirmations', 'Read one to her', () => ctx.navigate('cards')),
      tile('🌬', 'Breathe', 'Pace it together', () => ctx.navigate('breathe')),
      tile('📋', 'Birth plan', 'Both versions', () => ctx.navigate('plan')),
      tile('🙏', 'Prayer', 'Pray over her', () => ctx.navigate('prayer')),
      tile('📝', 'Labor log', 'Mark the moments', () => ctx.navigate('log')),
      tile('✅', 'Checklists', 'Bags & golden hour', () => ctx.navigate('checklists'))),

    cardOfMoment,

    el('div', { class: 'card' },
      el('h2', {}, 'Call'),
      el('div', { class: 'contact-list' },
        s.contacts.filter((c) => c.phone).length
          ? s.contacts.filter((c) => c.phone).map((c) => el('a', { class: 'contact', href: `tel:${c.phone}` },
            el('span', { class: 'contact-name' }, c.label, c.note ? el('span', { class: 'contact-note' }, c.note) : null),
            el('span', { class: 'contact-call' }, 'Call')))
          : el('p', { class: 'small' }, 'No numbers saved yet. Add them in Settings — you do not want to be searching for the midwife’s number at 3am.'))),
  );

  paint();
  const tick = setInterval(paint, 1000);

  return {
    update: paint,
    destroy() { clearInterval(tick); },
  };
}

function tile(icon, title, subtitle, onClick) {
  return el('button', { class: 'tile', type: 'button', onclick: onClick },
    el('span', { class: 'tile-icon', 'aria-hidden': 'true' }, icon),
    el('span', { class: 'tile-title' }, title),
    el('span', { class: 'tile-sub' }, subtitle));
}
