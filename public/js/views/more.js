import { el } from '../util.js';
import { settings } from '../state.js';

export default function moreView(root, ctx) {
  const s = settings();
  const links = [
    { icon: '📋', title: 'Birth plan', sub: 'Birth center + hospital backup', route: 'plan' },
    { icon: '📝', title: 'Labor log', sub: 'Timeline and birth story', route: 'log' },
    { icon: '✅', title: 'Checklists', sub: 'Bags, signs, golden hour', route: 'checklists' },
    { icon: '🌬', title: 'Breathe', sub: 'Paced breathing', route: 'breathe' },
    { icon: '🙏', title: 'Prayer', sub: 'Prayers and worship', route: 'prayer' },
    { icon: '🍼', title: 'Postpartum', sub: 'Feeds, diapers, recovery', route: 'postpartum' },
    { icon: '⚙️', title: 'Settings', sub: 'Names, contacts, sync', route: 'settings' },
  ];

  root.append(
    el('header', { class: 'view-head' }, el('h1', {}, 'More')),
    el('div', { class: 'menu' },
      links.map((link) => el('button', {
        class: 'menu-row',
        type: 'button',
        onclick: () => ctx.navigate(link.route),
      },
      el('span', { class: 'menu-icon', 'aria-hidden': 'true' }, link.icon),
      el('span', { class: 'menu-text' },
        el('span', { class: 'menu-title' }, link.title),
        el('span', { class: 'menu-sub' }, link.sub)),
      el('span', { class: 'menu-chevron', 'aria-hidden': 'true' }, '›')))),

    el('div', { class: 'card muted-card' },
      el('p', { class: 'small' }, `Built for ${s.momName}, ${s.partnerName}, and ${s.babyName}.`),
      el('p', { class: 'small' }, 'Everything works with no signal. It syncs to the other phone whenever there is one.')),
  );
}
