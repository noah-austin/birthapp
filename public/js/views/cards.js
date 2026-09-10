import { el, clear, speak, stopSpeaking, buzz } from '../util.js';
import { store, settings, updateSettings } from '../state.js';
import { affirmations, scripture } from '../data/cards.js';
import { icon } from '../icons.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'affirmation', label: 'Affirmations' },
  { id: 'scripture', label: 'Scripture' },
  { id: 'favorite', label: 'Favorites' },
];

/** Swap a button's icon and label together. */
function setBtn(btn, iconName, label, { filled = false } = {}) {
  btn.replaceChildren(icon(iconName, { filled }), el('span', {}, label));
}

function favorites() {
  return new Set(store.list('favorites').map((f) => f.id));
}

function toggleFavorite(id) {
  if (favorites().has(id)) store.remove('favorites', id);
  else store.add('favorites', { id });
}

export default function cardsView(root, ctx) {
  let filter = ctx.params.filter || 'all';
  let index = 0;
  let order = [];
  let autoplay = null;

  const cardNode = el('div', { class: 'deck-card' });
  const counter = el('div', { class: 'deck-counter' });
  const favBtn = el('button', { class: 'ghost-btn', type: 'button', 'aria-label': 'Save this card' },
    icon('heart'), el('span', {}, 'Save'));
  const playBtn = el('button', { class: 'ghost-btn', type: 'button' }, icon('play'), el('span', {}, 'Auto'));
  const speakBtn = el('button', { class: 'ghost-btn', type: 'button' }, icon('speaker'), el('span', {}, 'Read'));
  const filterRow = el('div', { class: 'filter-row' });

  function pool() {
    const favs = favorites();
    if (filter === 'favorite') {
      return [...affirmations.map((c) => ({ ...c, kind: 'affirmation' })), ...scripture.map((c) => ({ ...c, kind: 'scripture' }))]
        .filter((c) => favs.has(c.id));
    }
    if (filter === 'scripture') return scripture.map((c) => ({ ...c, kind: 'scripture' }));
    if (filter === 'affirmation') return affirmations.map((c) => ({ ...c, kind: 'affirmation' }));
    return [
      ...affirmations.map((c) => ({ ...c, kind: 'affirmation' })),
      ...scripture.map((c) => ({ ...c, kind: 'scripture' })),
    ];
  }

  function rebuild({ shuffle = false } = {}) {
    order = pool();
    if (shuffle) {
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    index = 0;
  }

  function step(delta) {
    if (!order.length) return;
    index = (index + delta + order.length) % order.length;
    stopSpeaking();
    paint();
    buzz(8);
  }

  function paint() {
    clear(cardNode);
    clear(counter);

    if (!order.length) {
      cardNode.className = 'deck-card is-empty';
      cardNode.append(el('p', {}, filter === 'favorite'
        ? 'No favorites yet. Tap Save on the cards that land, and they will collect here.'
        : 'No cards in this deck.'));
      return;
    }

    const card = order[index];
    cardNode.className = `deck-card is-${card.kind}`;
    if (card.ref) cardNode.append(el('div', { class: 'deck-ref' }, card.ref));
    cardNode.append(el('p', { class: 'deck-text' }, card.text));

    counter.append(`${index + 1} of ${order.length}`);
    const saved = favorites().has(card.id);
    setBtn(favBtn, 'heart', saved ? 'Saved' : 'Save', { filled: saved });
    favBtn.classList.toggle('is-on', saved);
  }

  function renderFilters() {
    clear(filterRow);
    for (const option of FILTERS) {
      filterRow.append(el('button', {
        class: `filter-btn${filter === option.id ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => {
          filter = option.id;
          rebuild();
          renderFilters();
          paint();
        },
      }, option.label));
    }
  }

  function stopAutoplay() {
    clearInterval(autoplay);
    autoplay = null;
    setBtn(playBtn, 'play', 'Auto');
    playBtn.classList.remove('is-on');
  }

  playBtn.addEventListener('click', () => {
    if (autoplay) {
      stopAutoplay();
      return;
    }
    const seconds = Number(settings().autoplaySeconds) || 12;
    autoplay = setInterval(() => step(1), seconds * 1000);
    setBtn(playBtn, 'pause', 'Stop');
    playBtn.classList.add('is-on');
  });

  speakBtn.addEventListener('click', () => {
    const card = order[index];
    if (!card) return;
    speak(card.ref ? `${card.ref}. ${card.text}` : card.text);
  });

  favBtn.addEventListener('click', () => {
    const card = order[index];
    if (!card) return;
    toggleFavorite(card.id);
    if (filter === 'favorite') {
      rebuild();
      if (index >= order.length) index = Math.max(0, order.length - 1);
    }
    paint();
    buzz(10);
  });

  // Swipe between cards; the whole point is she can nudge it one-handed.
  let touchStartX = 0;
  cardNode.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  cardNode.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
  }, { passive: true });
  cardNode.addEventListener('click', () => step(1));

  const onKey = (event) => {
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'ArrowLeft') step(-1);
  };
  window.addEventListener('keydown', onKey);

  const speedInput = el('input', {
    type: 'range', min: '5', max: '40', step: '1',
    value: String(settings().autoplaySeconds || 12),
    class: 'range',
  });
  const speedLabel = el('span', { class: 'small mono' }, `${settings().autoplaySeconds || 12}s`);
  speedInput.addEventListener('input', () => {
    speedLabel.textContent = `${speedInput.value}s`;
    updateSettings({ autoplaySeconds: Number(speedInput.value) });
    if (autoplay) {
      clearInterval(autoplay);
      autoplay = setInterval(() => step(1), Number(speedInput.value) * 1000);
    }
  });

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Affirmations'),
      el('p', { class: 'sub' }, 'Tap or swipe for the next one. Read them out loud to her between surges, never during.')),
    filterRow,
    cardNode,
    el('div', { class: 'deck-controls' },
      el('button', { class: 'ghost-btn', type: 'button', 'aria-label': 'Previous card', onclick: () => step(-1) }, icon('chevronLeft')),
      counter,
      el('button', { class: 'ghost-btn', type: 'button', 'aria-label': 'Next card', onclick: () => step(1) }, icon('chevronRight'))),
    el('div', { class: 'deck-controls' }, favBtn, speakBtn, playBtn,
      el('button', {
        class: 'ghost-btn',
        type: 'button',
        onclick: () => { rebuild({ shuffle: true }); paint(); },
      }, icon('shuffle'), el('span', {}, 'Shuffle'))),
    el('div', { class: 'card muted-card' },
      el('div', { class: 'row' },
        el('span', { class: 'small' }, 'Auto-advance every'), speedInput, speedLabel)),
  );

  renderFilters();
  rebuild();
  paint();

  return {
    update: paint,
    destroy() {
      stopAutoplay();
      stopSpeaking();
      window.removeEventListener('keydown', onKey);
    },
  };
}
