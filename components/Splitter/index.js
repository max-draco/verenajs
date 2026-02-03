import styles from './Splitter.module.css';
export function createSplitter({ orientation = 'horizontal', initial = 50, children = [], onResize } = {}) {
  const el = document.createElement('div');
  el.classList.add(styles.splitter, styles[orientation]);
  const p1 = document.createElement('div'); p1.classList.add(styles.pane); p1.style.setProperty('--sz', initial + '%');
  const handle = document.createElement('div'); handle.classList.add(styles.handle); handle.setAttribute('role', 'separator'); handle.setAttribute('tabindex', '0');
  const p2 = document.createElement('div'); p2.classList.add(styles.pane); p2.style.setProperty('--sz', (100 - initial) + '%');
  if (children[0] instanceof HTMLElement) p1.appendChild(children[0]);
  if (children[1] instanceof HTMLElement) p2.appendChild(children[1]);
  el.appendChild(p1); el.appendChild(handle); el.appendChild(p2);
  let dragging = false;
  const onDown = e => { dragging = true; e.preventDefault(); document.body.style.userSelect = 'none'; };
  const onMove = e => {
    if (!dragging) return;
    const rect = el.getBoundingClientRect();
    let pct = orientation === 'horizontal' ? ((e.clientX - rect.left) / rect.width) * 100 : ((e.clientY - rect.top) / rect.height) * 100;
    pct = Math.max(10, Math.min(90, pct));
    p1.style.setProperty('--sz', pct + '%'); p2.style.setProperty('--sz', (100 - pct) + '%');
    if (onResize) onResize(pct);
  };
  const onUp = () => { dragging = false; document.body.style.userSelect = ''; };
  handle.addEventListener('mousedown', onDown); handle.addEventListener('touchstart', e => { onDown(e); }, { passive: false });
  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', e => { if (dragging) onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); });
  document.addEventListener('touchend', onUp);
  return { el, pane1: p1, pane2: p2 };
}