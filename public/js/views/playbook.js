import { el, clear } from '../util.js';
import { stages, sayThis, dontSayThis, comfortMeasures } from '../data/playbook.js';

export default function playbookView(root, ctx) {
  let activeStage = ctx.params.stage || 'active';
  const stageBody = el('div', {});
  const stageRow = el('div', { class: 'filter-row scroll-row' });

  function paintStage() {
    clear(stageRow);
    for (const stage of stages) {
      stageRow.append(el('button', {
        class: `filter-btn${stage.id === activeStage ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => { activeStage = stage.id; paintStage(); },
      }, stage.name));
    }

    const stage = stages.find((s) => s.id === activeStage) || stages[0];
    clear(stageBody);
    stageBody.append(
      el('div', { class: 'card' },
        el('p', { class: 'small caps' }, stage.marker),
        el('p', { class: 'goal' }, stage.goal)),
      el('div', { class: 'card' },
        el('h2', {}, 'Do this'),
        el('ul', { class: 'do-list' }, stage.doThis.map((line) => el('li', {}, line)))),
      el('div', { class: 'card warn-card' },
        el('h2', {}, 'Don’t'),
        el('ul', { class: 'dont-list' }, stage.avoid.map((line) => el('li', {}, line)))),
    );
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Noah’s playbook'),
      el('p', { class: 'sub' }, 'Pick where you are. Do the top thing on the list.')),
    stageRow,
    stageBody,
    el('div', { class: 'card' },
      el('h2', {}, 'Say this'),
      el('ul', { class: 'say-list' }, sayThis.map((line) => el('li', {}, `“${line}”`)))),
    el('div', { class: 'card warn-card' },
      el('h2', {}, 'Not that'),
      el('ul', { class: 'swap-list' },
        dontSayThis.map((pair) => el('li', {},
          el('span', { class: 'bad' }, `“${pair.bad}”`),
          el('span', { class: 'good' }, `→ ${pair.good}`))))),
    el('div', { class: 'card' },
      el('h2', {}, 'Comfort measures'),
      el('div', { class: 'measure-list' },
        comfortMeasures.map((measure) => el('details', { class: 'measure' },
          el('summary', {}, measure.name, el('span', { class: 'measure-tag' }, measure.best)),
          el('p', {}, measure.how))))),
    el('div', { class: 'card' },
      el('h2', {}, 'Quick jumps'),
      el('div', { class: 'chip-grid' },
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('plan') }, 'Birth plan'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('checklists', { list: 'golden-hour' }) }, 'Golden hour list'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('breathe') }, 'Breathe with her'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('cards') }, 'Read her a card'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('prayer') }, 'Pray'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('log') }, 'Log a moment'))),
  );

  paintStage();
}
