import { el, clear, formatDuration, formatClock, mean, buzz, ScreenLock, confirmAction } from '../util.js';
import { store } from '../state.js';
import { addEvent } from './log.js';

const ACTIVE_ID = 'active';

function completedSurges() {
  return store.list('contractions')
    .filter((c) => c.start && c.end)
    .sort((a, b) => a.start - b.start);
}

/**
 * Evaluate the classic "when do we go" rules against the last hour of surges.
 * Returns null until there is enough data to say anything honest.
 */
export function readPattern(surges, now = Date.now()) {
  const recent = surges.filter((s) => now - s.start < 60 * 60 * 1000);
  if (recent.length < 4) {
    return { level: 'early', title: 'Still gathering', detail: 'Time a few more surges before reading anything into the numbers.' };
  }

  const durations = recent.map((s) => s.end - s.start);
  const intervals = [];
  for (let i = 1; i < recent.length; i += 1) intervals.push(recent[i].start - recent[i - 1].start);

  const avgDuration = mean(durations);
  const avgInterval = mean(intervals);
  const spanMinutes = (recent.at(-1).start - recent[0].start) / 60000;
  const sustained = spanMinutes >= 55;

  const meets = (minutesApart) => avgInterval <= minutesApart * 60000 && avgDuration >= 55000;

  if (meets(4) && sustained) {
    return {
      level: 'go',
      title: '4-1-1 met',
      detail: 'Surges about 4 minutes apart, a minute long, holding for an hour. Call Midwife Harmony now.',
    };
  }
  if (meets(5) && sustained) {
    return {
      level: 'call',
      title: '5-1-1 met',
      detail: 'Surges about 5 minutes apart, a minute long, holding for an hour. Time to call.',
    };
  }
  if (meets(5)) {
    return {
      level: 'watch',
      title: 'Pattern building',
      detail: `Length and spacing are there, but only ${Math.round(spanMinutes)} minutes of it so far. Keep timing.`,
    };
  }
  return {
    level: 'early',
    title: 'Early pattern',
    detail: `Averaging ${formatDuration(avgDuration)} long, ${formatDuration(avgInterval, { compact: true })} apart. Eat, drink, rest.`,
  };
}

export default function timerView(root) {
  const lock = new ScreenLock();
  let tick = null;

  const elapsedNode = el('span', { class: 'timer-elapsed' }, '0:00');
  const buttonLabel = el('span', { class: 'timer-btn-label' }, 'Start surge');
  const button = el('button', { class: 'timer-btn', type: 'button' }, buttonLabel, elapsedNode);
  const sinceNode = el('div', { class: 'stat-value' }, '—');
  const avgLenNode = el('div', { class: 'stat-value' }, '—');
  const avgGapNode = el('div', { class: 'stat-value' }, '—');
  const countNode = el('div', { class: 'stat-value' }, '0');
  const banner = el('div', { class: 'pattern-banner' });
  const listNode = el('div', { class: 'surge-list' });

  function activeStart() {
    return store.get('timer', ACTIVE_ID)?.startedAt || null;
  }

  function toggle() {
    const started = activeStart();
    if (started) {
      const end = Date.now();
      // Guard against a stray double-tap producing a 1-second "surge".
      if (end - started < 5000 && !confirmAction('That surge was under 5 seconds. Save it anyway?')) {
        store.put('timer', ACTIVE_ID, { startedAt: null });
        update();
        return;
      }
      store.add('contractions', { start: started, end });
      store.put('timer', ACTIVE_ID, { startedAt: null });
      lock.release();
      buzz([18, 60, 18]);
    } else {
      store.put('timer', ACTIVE_ID, { startedAt: Date.now() });
      lock.request();
      buzz(18);
      if (completedSurges().length === 0) addEvent('Contractions started', 'auto');
    }
    update();
  }

  button.addEventListener('click', toggle);

  function renderList(surges) {
    clear(listNode);
    const recent = [...surges].reverse().slice(0, 40);
    if (!recent.length) {
      listNode.append(el('p', { class: 'empty' }, 'No surges timed yet. Tap the circle when one begins, tap again when it ends.'));
      return;
    }

    listNode.append(el('div', { class: 'surge-row surge-head' },
      el('span', {}, 'Began'), el('span', {}, 'Lasted'), el('span', {}, 'Apart'), el('span', {}, '')));

    for (const surge of recent) {
      const index = surges.indexOf(surge);
      const prev = index > 0 ? surges[index - 1] : null;
      const gap = prev ? surge.start - prev.start : null;
      listNode.append(el('div', { class: 'surge-row' },
        el('span', {}, formatClock(surge.start)),
        el('span', { class: 'mono' }, formatDuration(surge.end - surge.start)),
        el('span', { class: 'mono' }, gap ? formatDuration(gap) : '—'),
        el('button', {
          class: 'icon-btn',
          type: 'button',
          'aria-label': `Delete surge at ${formatClock(surge.start)}`,
          onclick: () => {
            if (confirmAction('Delete this surge?')) {
              store.remove('contractions', surge.id);
              update();
            }
          },
        }, '×')));
    }
  }

  function update() {
    const started = activeStart();
    const surges = completedSurges();
    const now = Date.now();

    button.classList.toggle('is-running', Boolean(started));
    buttonLabel.textContent = started ? 'End surge' : 'Start surge';
    elapsedNode.textContent = started ? formatDuration(now - started) : `${surges.length} timed`;

    const last = surges.at(-1);
    sinceNode.textContent = started
      ? 'now'
      : last ? formatDuration(now - last.start, { compact: true }) : '—';

    const window5 = surges.slice(-5);
    const durations = window5.map((s) => s.end - s.start);
    const intervals = [];
    for (let i = 1; i < window5.length; i += 1) intervals.push(window5[i].start - window5[i - 1].start);

    avgLenNode.textContent = durations.length ? formatDuration(mean(durations)) : '—';
    avgGapNode.textContent = intervals.length ? formatDuration(mean(intervals)) : '—';
    countNode.textContent = String(surges.filter((s) => now - s.start < 3600000).length);

    const pattern = readPattern(surges, now);
    banner.className = `pattern-banner is-${pattern.level}`;
    clear(banner);
    banner.append(
      el('strong', {}, pattern.title),
      el('span', {}, pattern.detail),
    );

    renderList(surges);
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Surge timer'),
      el('p', { class: 'sub' }, 'Tap when a surge begins. Tap again when it lets go.')),
    el('div', { class: 'timer-wrap' }, button),
    el('div', { class: 'stat-grid' },
      el('div', { class: 'stat' }, sinceNode, el('div', { class: 'stat-label' }, 'Since last began')),
      el('div', { class: 'stat' }, avgLenNode, el('div', { class: 'stat-label' }, 'Avg length (5)')),
      el('div', { class: 'stat' }, avgGapNode, el('div', { class: 'stat-label' }, 'Avg apart (5)')),
      el('div', { class: 'stat' }, countNode, el('div', { class: 'stat-label' }, 'In the last hour'))),
    banner,
    el('div', { class: 'card' },
      el('h2', {}, 'Timed surges'),
      listNode),
    el('div', { class: 'card muted-card' },
      el('h2', {}, 'What the rules mean'),
      el('p', {}, el('strong', {}, '4-1-1'), ' — surges 4 minutes apart, lasting 1 minute, keeping that up for 1 hour. The usual "call now" threshold for a first baby.'),
      el('p', {}, el('strong', {}, '5-1-1'), ' — same idea, 5 minutes apart. Some providers prefer this one. Ask Midwife Harmony which she wants.'),
      el('p', { class: 'small' }, 'Call sooner regardless if the water breaks, if there is bright red bleeding, or if anything feels wrong. The numbers are a guide, not permission.')),
  );

  update();
  tick = setInterval(update, 1000);

  return {
    update,
    destroy() {
      clearInterval(tick);
      lock.release();
    },
  };
}
