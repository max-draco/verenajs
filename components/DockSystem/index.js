import styles from './DockSystem.module.css';
export function createDockSystem({ panels = [] } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.dock);
  panels.forEach((panel, i) => {
    const pane = document.createElement('div'); pane.classList.add(styles.pane);
    const header = document.createElement('div'); header.classList.add(styles.header);
    const title = document.createElement('span'); title.classList.add(styles.title); title.textContent = panel.title || ('Panel ' + (i + 1));
    const closeBtn = document.createElement('button'); closeBtn.classList.add(styles.close);
    closeBtn.setAttribute('aria-label', 'Close'); closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => pane.remove());
    header.appendChild(title); header.appendChild(closeBtn);
    const body = document.createElement('div'); body.classList.add(styles.body);
    if (panel.content instanceof HTMLElement) body.appendChild(panel.content);
    else if (typeof panel.content === 'string') body.innerHTML = panel.content;
    pane.appendChild(header); pane.appendChild(body);
    if (panel.width) pane.style.width = panel.width;
    el.appendChild(pane);
  });
  return el;
}