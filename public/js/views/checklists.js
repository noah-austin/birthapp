import { el, clear, confirmAction, buzz } from '../util.js';
import { store } from '../state.js';
import { checklists } from '../data/checklists.js';

function itemKey(listId, index) {
  return `${listId}__${index}`;
}

function isChecked(listId, index) {
  return Boolean(store.get('checks', itemKey(listId, index))?.done);
}

function setChecked(listId, index, done) {
  store.put('checks', itemKey(listId, index), { done });
}

export default function checklistsView(root, ctx) {
  let activeId = ctx.params.list || checklists[0].id;
  const body = el('div', {});
  const listRow = el('div', { class: 'filter-row scroll-row' });

  function progressFor(list) {
    if (list.kind !== 'checklist') return null;
    const done = list.items.filter((_, i) => isChecked(list.id, i)).length;
    return { done, total: list.items.length };
  }

  function renderReference(list) {
    const node = el('div', {});
    if (list.intro) node.append(el('p', { class: 'sub' }, list.intro));
    for (const group of list.groups) {
      node.append(el('div', { class: `card${group.urgent ? ' warn-card' : ''}` },
        el('h2', {}, group.title),
        el('ul', { class: 'do-list' }, group.items.map((item) => el('li', {}, item)))));
    }
    node.append(el('div', { class: 'card muted-card' },
      el('p', { class: 'small' }, 'When in doubt, call. Midwives would far rather hear from you at 3am than have you sit at home wondering.')));
    return node;
  }

  function renderChecklist(list) {
    const node = el('div', {});
    if (list.intro) node.append(el('p', { class: 'sub' }, list.intro));

    const progress = progressFor(list);
    const bar = el('div', { class: 'progress' },
      el('div', { class: 'progress-fill', style: `width:${progress.total ? (progress.done / progress.total) * 100 : 0}%` }));

    const items = el('ul', { class: 'check-list' },
      list.items.map((text, index) => {
        const checked = isChecked(list.id, index);
        const box = el('button', {
          class: `check-box${checked ? ' is-on' : ''}`,
          type: 'button',
          role: 'checkbox',
          'aria-checked': checked ? 'true' : 'false',
          onclick: () => {
            setChecked(list.id, index, !isChecked(list.id, index));
            buzz(10);
            paint();
          },
        }, checked ? '✓' : '');
        return el('li', { class: checked ? 'is-done' : '' }, box, el('span', {}, text));
      }));

    node.append(
      el('div', { class: 'card' },
        el('div', { class: 'row space-between' },
          el('h2', {}, list.name),
          el('span', { class: 'small mono' }, `${progress.done}/${progress.total}`)),
        bar,
        items),
      el('button', {
        class: 'btn btn-quiet btn-wide',
        type: 'button',
        onclick: () => {
          if (!confirmAction(`Uncheck everything in "${list.name}"?`)) return;
          list.items.forEach((_, i) => setChecked(list.id, i, false));
          paint();
        },
      }, 'Reset this list'),
    );
    return node;
  }

  function paint() {
    clear(listRow);
    for (const list of checklists) {
      const progress = progressFor(list);
      listRow.append(el('button', {
        class: `filter-btn${list.id === activeId ? ' is-active' : ''}`,
        type: 'button',
        onclick: () => { activeId = list.id; paint(); },
      }, list.name,
      progress && progress.done === progress.total && progress.total
        ? el('span', { class: 'tick' }, ' ✓')
        : null));
    }

    const list = checklists.find((l) => l.id === activeId) || checklists[0];
    clear(body);
    body.append(list.kind === 'reference' ? renderReference(list) : renderChecklist(list));
  }

  root.append(
    el('header', { class: 'view-head' },
      el('h1', {}, 'Checklists'),
      el('p', { class: 'sub' }, 'Ticks sync to both phones. Whoever packs it, the other one sees it.')),
    listRow,
    body,
  );

  paint();
  return { update: paint };
}
