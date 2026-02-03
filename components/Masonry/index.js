import styles from './Masonry.module.css';
export function createMasonry({ columns = 3, gap = 16, children = [] } = {}) {
  const el = document.createElement('div');
  el.classList.add(styles.masonry);
  el.style.setProperty('--cols', String(columns));
  el.style.setProperty('--gap', gap + 'px');
  children.forEach(c => {
    const item = document.createElement('div');
    item.classList.add(styles.item);
    if (c instanceof HTMLElement) item.appendChild(c);
    el.appendChild(item);
  });
  return el;
}