import { el } from './util.js';

// Line icons drawn on a 24x24 grid. They inherit colour from `currentColor`
// and size from the font-size of whatever holds them, so the existing
// .nav-icon / .tile-icon / .menu-icon rules keep working unchanged.

const PATHS = {
  home: '<path d="M3.5 10.2 12 3.2l8.5 7v9.3a1.5 1.5 0 0 1-1.5 1.5h-3.4v-6h-5.2v6H5a1.5 1.5 0 0 1-1.5-1.5z"/>',

  // Two rolling waves — a surge, not a contraction.
  wave: '<path d="M2.5 8.8c2-2.7 4-2.7 6 0s4 2.7 6 0 4-2.7 6 0"/><path d="M2.5 15.2c2-2.7 4-2.7 6 0s4 2.7 6 0 4-2.7 6 0"/>',

  leaf: '<path d="M11 20.5A7 7 0 0 1 9.8 6.6C15.5 5.5 17 5 19 2.5c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2.5 21.5c0-3 1.9-5.4 5.1-6C10 15 12.5 13.5 13.5 12.5"/>',

  // Two people: this tab is Noah supporting Jillian.
  support: '<path d="M16.5 20.5v-1.7a3.5 3.5 0 0 0-3.5-3.5H6a3.5 3.5 0 0 0-3.5 3.5v1.7"/><circle cx="9.5" cy="8" r="3.5"/><path d="M21.5 20.5v-1.7a3.5 3.5 0 0 0-2.6-3.4M15.5 4.7a3.5 3.5 0 0 1 0 6.6"/>',

  dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',

  wind: '<path d="M3 8.5h10.5a3 3 0 1 0-3-3"/><path d="M3 13.5h13a3 3 0 1 1-3 3"/><path d="M3 18.5h7"/>',

  clipboard: '<path d="M9 4.5H7A1.8 1.8 0 0 0 5.2 6.3v13.4A1.8 1.8 0 0 0 7 21.5h10a1.8 1.8 0 0 0 1.8-1.8V6.3A1.8 1.8 0 0 0 17 4.5h-2"/><rect x="9" y="2.5" width="6" height="4" rx="1.3"/><path d="M8.8 12h6.4M8.8 16h4.4"/>',

  cross: '<path d="M12 3.5v17M7.6 9h8.8"/>',

  pen: '<path d="M12.5 20.5h8"/><path d="M16.3 3.8a2.1 2.1 0 0 1 3 3L7.6 18.5l-4 1 1-4z"/>',

  checklist: '<path d="M3.5 7 5.4 8.9 9.2 5.1"/><path d="M3.5 15.6l1.9 1.9 3.8-3.8"/><path d="M12.5 7h8M12.5 15.6h8"/>',

  bottle: '<rect x="8.5" y="8.5" width="7" height="13" rx="2.2"/><path d="M10.2 8.5V6h3.6v2.5M10.6 3.2h2.8"/><path d="M8.5 13h7"/>',

  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.1 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a1.9 1.9 0 1 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z"/>',

  speaker: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15 9.2a4 4 0 0 1 0 5.6M17.8 6.4a8 8 0 0 1 0 11.2"/>',

  play: '<path d="M7.5 4.8 19 12 7.5 19.2z" fill="currentColor" stroke="none"/>',

  pause: '<path d="M9.2 5v14M14.8 5v14"/>',

  shuffle: '<path d="M16.5 3.5h4.5V8"/><path d="M3 20.5 20.5 3.5"/><path d="M21 16v4.5h-4.5"/><path d="M15 15l6 5.5"/><path d="M3 3.5 8.5 8.5"/>',

  heart: '<path d="M20.6 5.8a5.2 5.2 0 0 0-7.4 0L12 7l-1.2-1.2a5.2 5.2 0 0 0-7.4 7.4l.9.9L12 21.5l7.7-7.4.9-.9a5.2 5.2 0 0 0 0-7.4z"/>',

  check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',

  chevronLeft: '<path d="M14.5 5 8 12l6.5 7"/>',
  chevronRight: '<path d="M9.5 5 16 12l-6.5 7"/>',
};

/**
 * Build an icon node. `filled` swaps stroke for fill, used for the "saved"
 * state of the favourite heart.
 */
export function icon(name, { filled = false, className = '' } = {}) {
  const body = PATHS[name] || '';
  // The sizing rule hangs off `.icon`, so that class always stays on.
  const svg = `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">${body}</svg>`;
  return el('span', { class: className ? `icon ${className}` : 'icon', 'aria-hidden': 'true', html: svg });
}

/** An icon followed by a text label, for buttons that carry both. */
export function iconLabel(name, label) {
  return [icon(name), el('span', {}, label)];
}
