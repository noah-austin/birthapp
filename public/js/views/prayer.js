import { el, speak, stopSpeaking } from '../util.js';
import { settings } from '../state.js';
import { prayers } from '../data/playbook.js';

export default function prayerView(root, ctx) {
  const s = settings();

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Prayer'),
      el('p', { class: 'sub' }, 'Pray these over her out loud. She does not have to say anything back.')),

    el('div', { class: 'card accent-card' },
      el('h2', {}, 'If a decision comes up'),
      el('p', { class: 'plan-intro' }, '“Could we have a few minutes alone to pray about this before we decide?”'),
      el('p', { class: 'small' }, 'It is in both birth plans. You are allowed to ask, every single time, and a good care team will step out without being annoyed.')),

    el('div', { class: 'card' },
      el('h2', {}, 'Through the stages'),
      el('div', { class: 'measure-list' },
        prayers.map((prayer) => el('details', { class: 'measure' },
          el('summary', {}, prayer.stage),
          el('p', {}, prayer.text),
          el('button', {
            class: 'ghost-btn',
            type: 'button',
            onclick: () => speak(prayer.text, { rate: 0.8 }),
          }, '🔊 Read aloud'))))),

    el('div', { class: 'card' },
      el('h2', {}, 'Worship'),
      s.playlistUrl
        ? el('a', { class: 'btn btn-wide', href: s.playlistUrl, target: '_blank', rel: 'noopener' }, 'Open the playlist')
        : el('p', { class: 'small' }, 'No playlist link saved yet — add one in Settings.'),
      el('p', { class: 'small' }, 'Download it for offline before labor. Birth center wifi is not a plan.')),

    el('div', { class: 'card muted-card' },
      el('h2', {}, 'Ask the room'),
      el('p', { class: 'small' }, `The birth plan already invites it: any believer on the care team is welcome to pray with you or over ${s.momName} and ${s.babyName}. If someone offers, say yes.`)),

    el('div', { class: 'card' },
      el('div', { class: 'chip-grid' },
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('cards', { filter: 'scripture' }) }, 'Read Scripture cards'),
        el('button', { class: 'chip', type: 'button', onclick: () => ctx.navigate('breathe') }, 'Breathe together'))),
  );

  return { destroy: stopSpeaking };
}
