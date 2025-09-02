// HTML Tabs Frame – simple, callable
// Usage:
// import { createTabsFrame } from './index.js';
// createTabsFrame({
//   target: '#tabs',
//   tabs: [
//     { label: 'Positions', content: '<p>Positions content</p>' },
//     { label: 'Open orders', content: () => '<p>Open orders</p>' },
//     { label: 'History', content: someNode }
//   ],
//   active: 0
// });

import styles from './index.module.css';

function toNode(content, ctx) {
  if (content == null) return document.createTextNode('');
  if (typeof content === 'function') return toNode(content(ctx));
  if (content instanceof Node) return content;
  const tpl = document.createElement('template');
  tpl.innerHTML = String(content);
  return tpl.content.cloneNode(true);
}

function q(x) { return x instanceof Element ? x : document.querySelector(x); }

export function createTabsFrame({ target, tabs, active = 0 }) {
  const root = q(target);
  if (!root) throw new Error('TabsFrame: target not found');
  if (!Array.isArray(tabs) || !tabs.length) throw new Error('TabsFrame: tabs required');

  root.innerHTML = '';
  root.classList.add(styles.frame);

  // Header list
  const list = document.createElement('div');
  list.classList.add(styles.tablist);
  list.setAttribute('role', 'tablist');

  const ink = document.createElement('span');
  ink.classList.add(styles.ink);

  const btns = tabs.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t.label || `Tab ${i + 1}`;
    b.classList.add(styles.tab);
    list.appendChild(b);
    return b;
  });
  list.appendChild(ink);

  // Panels
  const panelsWrap = document.createElement('div');
  panelsWrap.classList.add(styles.panels);
  const panels = tabs.map(() => {
    const p = document.createElement('div');
    p.classList.add(styles.panel);
    panelsWrap.appendChild(p);
    return p;
  });

  root.appendChild(list);
  root.appendChild(panelsWrap);

  function setInk(index) {
    const btn = btns[index];
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    ink.style.width = r.width + 'px';
    ink.style.transform = `translateX(${r.left - lr.left}px)`;
  }

  function render(index, focus) {
    btns.forEach((b, i) => {
      const on = i === index;
      b.classList.toggle(styles.active, on);
      if (on && focus) b.focus();
    });
    panels.forEach((p, i) => {
      const on = i === index;
      p.classList.toggle(styles.hidden, !on);
      if (on && !p.hasChildNodes()) p.appendChild(toNode(tabs[i].content, { index }));
    });
    setInk(index);
    current = index;
  }

  list.addEventListener('click', (e) => {
    const idx = btns.indexOf(e.target.closest('button'));
    if (idx >= 0) render(idx, true);
  });

  list.addEventListener('keydown', (e) => {
    const max = tabs.length - 1;
    if (e.key === 'ArrowRight') { e.preventDefault(); render(Math.min(current + 1, max), true); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); render(Math.max(current - 1, 0), true); }
    if (e.key === 'Home')       { e.preventDefault(); render(0, true); }
    if (e.key === 'End')        { e.preventDefault(); render(max, true); }
  });

  let current = Math.max(0, Math.min(active, tabs.length - 1));
  render(current, false);
  window.addEventListener('resize', () => setInk(current));

  // simple API for callers
  return {
    select: (i) => render(i, false),
    setRight: (node) => {
      // optional helper: add controls on the right
      let right = root.querySelector('.' + styles.right);
      if (!right) {
        right = document.createElement('div');
        right.classList.add(styles.right);
        root.insertBefore(right, panelsWrap);
        root.insertBefore(list, right); // keep order: list | right
      }
      right.innerHTML = '';
      right.appendChild(toNode(node));
    }
  };
}