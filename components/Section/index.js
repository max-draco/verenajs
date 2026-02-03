import styles from './Section.module.css';
export function createSection({ padding = 'lg', background, children = [], id, ariaLabel } = {}) {
  const el = document.createElement('section');
  el.classList.add(styles.section, styles['pad' + padding] || styles.padlg);
  if (background) el.style.background = background;
  if (id) el.id = id;
  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  (Array.isArray(children) ? children : [children]).forEach(c => { if (c instanceof HTMLElement) el.appendChild(c); });
  return el;
}