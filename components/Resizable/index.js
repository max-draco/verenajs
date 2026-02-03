import styles from './Resizable.module.css';
export function createResizable({ width = '300px', height = '200px', minWidth = 80, minHeight = 60, children = [], onResize } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.resizable);
  el.style.width = width; el.style.height = height;
  const content = document.createElement('div'); content.classList.add(styles.content);
  (Array.isArray(children) ? children : [children]).forEach(c => { if (c instanceof HTMLElement) content.appendChild(c); });
  el.appendChild(content);
  ['se','s','e'].forEach(dir => {
    const h = document.createElement('div'); h.classList.add(styles.handle, styles['h' + dir]); h.setAttribute('data-dir', dir);
    let sX, sY, sW, sH;
    const down = e => { e.preventDefault(); sX = e.clientX; sY = e.clientY; sW = el.offsetWidth; sH = el.offsetHeight; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); document.body.style.userSelect = 'none'; };
    const move = e => {
      if (dir.includes('e')) el.style.width = Math.max(minWidth, sW + e.clientX - sX) + 'px';
      if (dir.includes('s')) el.style.height = Math.max(minHeight, sH + e.clientY - sY) + 'px';
      if (onResize) onResize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.body.style.userSelect = ''; };
    h.addEventListener('mousedown', down); el.appendChild(h);
  });
  return el;
}