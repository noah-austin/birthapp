import { el, clear, buzz } from '../util.js';
import { cycles } from '../data/cards.js';

const PATTERNS = [
  {
    id: 'surge',
    name: 'Surge breathing',
    blurb: 'The default. Long slow out-breath keeps the pelvic floor loose.',
    phases: [
      { label: 'Breathe in', seconds: 4, scale: 1 },
      { label: 'Breathe out, slow', seconds: 8, scale: 0.55 },
    ],
  },
  {
    id: 'calm',
    name: 'Calm / box',
    blurb: 'For between surges, or for Noah when his heart rate climbs.',
    phases: [
      { label: 'In', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 4, scale: 1 },
      { label: 'Out', seconds: 4, scale: 0.55 },
      { label: 'Hold', seconds: 4, scale: 0.55 },
    ],
  },
  {
    id: 'down',
    name: 'Down breathing',
    blurb: 'For pushing. Breathe down and out — no held breath, no counting at her.',
    phases: [
      { label: 'In through the nose', seconds: 4, scale: 1 },
      { label: 'Out, down and open', seconds: 10, scale: 0.5 },
    ],
  },
  {
    id: 'rest',
    name: 'Rest',
    blurb: 'For early labor at 2am, when the job is to fall back asleep.',
    phases: [
      { label: 'In', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 2, scale: 1 },
      { label: 'Out', seconds: 6, scale: 0.55 },
    ],
  },
];

function cycleSvg(cycle) {
  const tone = cycle.tone === 'warn' ? 'var(--warn)' : 'var(--good)';
  // Wide enough that "Relaxation" and "Oxytocin" clear the viewBox edges.
  const svg = `
    <svg viewBox="0 0 380 240" role="img" aria-label="${cycle.nodes.join(', then ')}, then back to ${cycle.nodes[0]}">
      <defs>
        <marker id="arrow-${cycle.id}" viewBox="0 0 10 10" refX="8" refY="5"
                markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="${tone}" />
        </marker>
      </defs>
      <g fill="none" stroke="${tone}" stroke-width="3" stroke-linecap="round"
         marker-end="url(#arrow-${cycle.id})">
        <path d="M238,60 Q302,104 298,156" />
        <path d="M266,220 Q190,248 114,220" />
        <path d="M82,156 Q78,104 142,60" />
      </g>
      <g font-size="24" font-family="Georgia, serif" fill="var(--ink)" text-anchor="middle">
        <text x="190" y="40">${cycle.nodes[0]}</text>
        <text x="300" y="202">${cycle.nodes[1]}</text>
        <text x="80" y="202">${cycle.nodes[2]}</text>
      </g>
    </svg>`;
  return el('div', { class: `cycle-svg is-${cycle.tone}`, html: svg });
}

export default function breatheView(root) {
  let pattern = PATTERNS[0];
  let running = false;
  let phaseIndex = 0;
  let timer = null;
  let countdown = null;

  const orb = el('div', { class: 'orb' });
  const orbLabel = el('div', { class: 'orb-label' }, 'Ready');
  const orbCount = el('div', { class: 'orb-count' }, '');
  const startBtn = el('button', { class: 'btn btn-wide', type: 'button' }, 'Start');
  const patternRow = el('div', { class: 'filter-row scroll-row' });
  const blurb = el('p', { class: 'sub center' }, pattern.blurb);

  function setPhase(index) {
    phaseIndex = index % pattern.phases.length;
    const phase = pattern.phases[phaseIndex];
    orb.style.transitionDuration = `${phase.seconds}s`;
    orb.style.transform = `scale(${phase.scale})`;
    orbLabel.textContent = phase.label;
    buzz(8);

    let remaining = phase.seconds;
    orbCount.textContent = String(remaining);
    clearInterval(countdown);
    countdown = setInterval(() => {
      remaining -= 1;
      orbCount.textContent = String(Math.max(0, remaining));
    }, 1000);

    timer = setTimeout(() => setPhase(phaseIndex + 1), phase.seconds * 1000);
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    clearInterval(countdown);
    orb.style.transitionDuration = '0.6s';
    orb.style.transform = 'scale(0.75)';
    orbLabel.textContent = 'Ready';
    orbCount.textContent = '';
    startBtn.textContent = 'Start';
    orb.classList.remove('is-running');
  }

  function start() {
    running = true;
    startBtn.textContent = 'Stop';
    orb.classList.add('is-running');
    setPhase(0);
  }

  startBtn.addEventListener('click', () => (running ? stop() : start()));

  function paintPatterns() {
    clear(patternRow);
    for (const option of PATTERNS) {
      patternRow.append(el('button', {
        class: `filter-btn${option.id === pattern.id ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => {
          const wasRunning = running;
          stop();
          pattern = option;
          blurb.textContent = option.blurb;
          paintPatterns();
          if (wasRunning) start();
        },
      }, option.name));
    }
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Breathe'),
      el('p', { class: 'sub' }, 'Noah — breathe out loud along with it. She will match you without being asked.')),
    patternRow,
    blurb,
    el('div', { class: 'orb-wrap' }, orb, el('div', { class: 'orb-text' }, orbLabel, orbCount)),
    startBtn,
    el('div', { class: 'card' },
      el('h2', {}, 'Why this matters'),
      cycles.map((cycle) => el('div', { class: 'cycle-block' },
        el('h3', {}, cycle.title),
        cycleSvg(cycle),
        el('p', { class: 'small' }, cycle.note)))),
  );

  orb.style.transform = 'scale(0.75)';
  paintPatterns();

  return {
    destroy: stop,
  };
}
