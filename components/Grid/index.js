import styles from './Grid.module.css';
export function createGrid({ columns = 12, gap = 16, children = [], align = 'stretch' } = {}) {
  const el = document.createElement('div');
  el.classList.add(styles.grid);
  el.style.setProperty('--cols', String(columns));
  el.style.setProperty('--gap', gap + 'px');
  el.style.alignItems = align;
  el.setAttribute('role', 'grid');
  children.forEach(c => { if (c instanceof HTMLElement) el.appendChild(c); });
  return el;
}
export function createGridItem({ span = 1, offset = 0, children = [] } = {}) {
  const el = document.createElement('div');
  el.classList.add(styles.item);
  el.style.setProperty('--span', String(span));
  if (offset) el.style.gridColumn = 'span ' + span + ' / ' + (offset + span + 1);
  (Array.isArray(children) ? children : [children]).forEach(c => { if (c instanceof HTMLElement) el.appendChild(c); });
  return el;
}