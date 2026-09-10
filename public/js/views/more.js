import { el } from '../util.js';
import { settings } from '../state.js';
import { icon } from '../icons.js';

export default function moreView(root, ctx) {
  const s = settings();
  const links = [
    { icon: 'clipboard', title: 'Birth plan', sub: 'Birth center + hospital backup', route: 'plan' },
    { icon: 'pen', title: 'Labor log', sub: 'Timeline and birth story', route: 'log' },
    { icon: 'checklist', title: 'Checklists', sub: 'Bags, signs, golden hour', route: 'checklists' },
    { icon: 'wind', title: 'Breathe', sub: 'Paced breathing', route: 'breathe' },
    { icon: 'cross', title: 'Prayer', sub: 'Prayers and worship', route: 'prayer' },
    { icon: 'bottle', title: 'Postpartum', sub: 'Feeds, diapers, recovery', route: 'postpartum' },
    { icon: 'gear', title: 'Settings', sub: 'Names, contacts, sync', route: 'settings' },
  ];

  root.append(
    el('header', { class: 'view-head' }, el('h1', {}, 'More')),
    el('div', { class: 'menu' },
      links.map((link) => el('button', {
        class: 'menu-row',
        type: 'button',
        onclick: () => ctx.navigate(link.route),
      },
      icon(link.icon, { className: 'menu-icon' }),
      el('span', { class: 'menu-text' },
        el('span', { class: 'menu-title' }, link.title),
        el('span', { class: 'menu-sub' }, link.sub)),
      el('span', { class: 'menu-chevron', 'aria-hidden': 'true' }, '›')))),

    el('div', { class: 'card muted-card' },
      el('p', { class: 'small' }, `Built for ${s.momName}, ${s.partnerName}, and ${s.babyName}.`),
      el('p', { class: 'small' }, 'Everything works with no signal. It syncs to the other phone whenever there is one.')),
  );
}
