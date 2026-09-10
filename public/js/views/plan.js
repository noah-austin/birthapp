import { el, clear } from '../util.js';
import { plans, essentials } from '../data/plans.js';

export default function planView(root, ctx) {
  let activeId = ctx.params.plan || 'center';
  let staffMode = false;

  const body = el('div', {});
  const tabRow = el('div', { class: 'filter-row' });
  const staffToggle = el('button', { class: 'ghost-btn nowrap', type: 'button' }, 'Aa Big');

  function renderEssentials() {
    return el('div', { class: 'card accent-card' },
      el('h2', {}, 'The short version'),
      el('p', { class: 'small' }, 'Hand the phone over, or read these out. Everything else is detail.'),
      el('ul', { class: 'essentials' },
        essentials.map((item) => el('li', {},
          el('strong', {}, item.text),
          item.detail ? el('span', {}, item.detail) : null))));
  }

  function renderPlan(plan) {
    const node = el('div', {});
    node.append(
      el('div', { class: 'card' },
        el('h2', {}, plan.title),
        el('p', { class: 'small caps' }, plan.facility),
        el('p', { class: 'plan-intro' }, plan.intro)),
    );

    for (const section of plan.sections) {
      const card = el('div', { class: 'card' }, el('h2', {}, section.title));
      if (section.note) card.append(el('p', { class: 'small' }, section.note));

      if (section.items?.length) {
        card.append(el('ul', { class: 'plan-list' },
          section.items.map((item) => el('li', { class: item.emphasis ? 'is-key' : '' },
            el('strong', {}, item.label),
            el('span', {}, item.text)))));
      }

      if (section.declines?.length) {
        card.append(el('ul', { class: 'decline-list' },
          section.declines.map((label) => el('li', {}, el('span', { class: 'decline-tag' }, 'Declined'), label))));
      }

      node.append(card);
    }
    return node;
  }

  function paint() {
    clear(body);
    const plan = plans.find((p) => p.id === activeId) || plans[0];
    body.append(renderEssentials(), renderPlan(plan));
    document.body.classList.toggle('staff-mode', staffMode);

    clear(tabRow);
    for (const p of plans) {
      tabRow.append(el('button', {
        class: `filter-btn${p.id === activeId ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => { activeId = p.id; paint(); },
      }, p.label));
    }
  }

  staffToggle.addEventListener('click', () => {
    staffMode = !staffMode;
    staffToggle.classList.toggle('is-on', staffMode);
    staffToggle.textContent = staffMode ? 'Aa Normal' : 'Aa Big';
    paint();
  });

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Birth plan'),
      el('p', { class: 'sub' }, 'Both versions, so nobody has to find the printout.')),
    el('div', { class: 'row space-between' }, tabRow, staffToggle),
    body,
  );

  paint();

  return {
    destroy() {
      document.body.classList.remove('staff-mode');
    },
  };
}
