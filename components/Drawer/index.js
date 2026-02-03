import styles from './Drawer.module.css';
export function createDrawer({ position = 'right', width = '320px', content, onClose, closeOnBackdrop = true } = {}) {
  const overlay = document.createElement('div'); overlay.classList.add(styles.overlay);
  const drawer = document.createElement('div'); drawer.classList.add(styles.drawer, styles[position]);
  drawer.style.setProperty('--dw', width);
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true');
  const close = () => { overlay.classList.remove(styles.open); setTimeout(() => { overlay.remove(); if (onClose) onClose(); }, 300); };
  const closeBtn = document.createElement('button'); closeBtn.classList.add(styles.closeBtn);
  closeBtn.setAttribute('aria-label', 'Close'); closeBtn.innerHTML = '&#x2715;'; closeBtn.addEventListener('click', close);
  const body = document.createElement('div'); body.classList.add(styles.body);
  if (content instanceof HTMLElement) body.appendChild(content);
  else if (typeof content === 'string') body.innerHTML = content;
  drawer.appendChild(closeBtn); drawer.appendChild(body); overlay.appendChild(drawer);
  if (closeOnBackdrop) overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  const open = () => { document.body.appendChild(overlay); requestAnimationFrame(() => overlay.classList.add(styles.open)); };
  return { el: overlay, open, close };
}