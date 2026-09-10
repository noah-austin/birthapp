import { el, clear } from './util.js';
import { store, settings, updateSettings } from './state.js';
import { sync } from './sync.js';
import { icon } from './icons.js';

import homeView from './views/home.js';
import timerView from './views/timer.js';
import cardsView from './views/cards.js';
import planView from './views/plan.js';
import breatheView from './views/breathe.js';
import playbookView from './views/playbook.js';
import logView from './views/log.js';
import checklistsView from './views/checklists.js';
import postpartumView from './views/postpartum.js';
import prayerView from './views/prayer.js';
import moreView from './views/more.js';
import settingsView from './views/settings.js';

const views = {
  home: homeView,
  timer: timerView,
  cards: cardsView,
  plan: planView,
  breathe: breatheView,
  playbook: playbookView,
  log: logView,
  checklists: checklistsView,
  postpartum: postpartumView,
  prayer: prayerView,
  more: moreView,
  settings: settingsView,
};

const tabs = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'timer', label: 'Surges', icon: 'wave' },
  { route: 'cards', label: 'Cards', icon: 'leaf' },
  { route: 'playbook', label: 'Noah', icon: 'support' },
  { route: 'more', label: 'More', icon: 'dots' },
];

const appRoot = document.getElementById('app');
const navRoot = document.getElementById('nav');
const statusRoot = document.getElementById('sync-status');

let current = null;
let unsubscribe = null;

export function navigate(route, params = {}) {
  const query = new URLSearchParams(params).toString();
  location.hash = `#/${route}${query ? `?${query}` : ''}`;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [route, queryString] = raw.split('?');
  return {
    route: views[route] ? route : 'home',
    params: Object.fromEntries(new URLSearchParams(queryString || '')),
  };
}

function applyTheme() {
  const mode = settings().theme;
  document.documentElement.dataset.theme = mode === 'auto' ? '' : mode;
  if (mode === 'auto') delete document.documentElement.dataset.theme;
}

function renderNav(activeRoute) {
  clear(navRoot);
  // "More" stays lit for any of the pages that live behind it.
  const behindMore = ['more', 'log', 'checklists', 'postpartum', 'breathe', 'prayer', 'settings', 'plan'];
  for (const tab of tabs) {
    const isActive = tab.route === activeRoute
      || (tab.route === 'more' && behindMore.includes(activeRoute));
    navRoot.append(
      el('button', {
        class: `nav-btn${isActive ? ' is-active' : ''}`,
        type: 'button',
        'aria-current': isActive ? 'page' : null,
        onclick: () => navigate(tab.route),
      },
      icon(tab.icon, { className: 'nav-icon' }),
      el('span', { class: 'nav-label' }, tab.label)),
    );
  }
}

function renderStatus(detail) {
  const { status, error, peers } = detail;
  clear(statusRoot);
  const labels = {
    online: peers > 1 ? `Synced · ${peers} devices` : 'Synced',
    connecting: 'Connecting…',
    offline: 'Offline — saved on this phone',
    error: error || 'Sync problem',
  };
  statusRoot.className = `sync-status is-${status}`;
  statusRoot.append(
    el('span', { class: 'sync-dot', 'aria-hidden': 'true' }),
    el('span', {}, labels[status] || status),
  );
  statusRoot.onclick = () => sync.reconnect();
}

function render() {
  const { route, params } = parseHash();

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  current?.destroy?.();

  clear(appRoot);
  appRoot.scrollTop = 0;
  window.scrollTo(0, 0);

  const view = views[route];
  const ctx = { params, navigate, store, settings, updateSettings };
  current = view(appRoot, ctx) || null;

  // Views opt into live updates by exposing `update`.
  if (current?.update) {
    unsubscribe = store.subscribe(() => current.update());
  }

  renderNav(route);
}

window.addEventListener('hashchange', render);
sync.addEventListener('status', (event) => renderStatus(event.detail));

store.subscribe(applyTheme);
applyTheme();
renderStatus({ status: 'connecting', error: '', peers: 0 });
render();
sync.connect();

// Register the service worker so the app opens with no signal at all.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is a bonus, not a blocker */
    });
  });
}
