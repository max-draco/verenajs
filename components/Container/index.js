import styles from './Container.module.css';
export function createContainer({ maxWidth = '1200px', fluid = false, children = [], padding } = {}) {
  const el = document.createElement('div');
  el.classList.add(styles.container, fluid ? styles.fluid : '');
  if (!fluid) el.style.maxWidth = maxWidth;
  if (padding) el.style.padding = padding;
  (Array.isArray(children) ? children : [children]).forEach(c => { if (c instanceof HTMLElement) el.appendChild(c); });
  return el;
}