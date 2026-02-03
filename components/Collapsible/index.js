import styles from './Collapsible.module.css';
export function createCollapsible({ title = '', content, open = false, onToggle, icon } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.collapsible);
  let isOpen = open;
  const header = document.createElement('button'); header.classList.add(styles.header);
  header.setAttribute('aria-expanded', String(isOpen));
  const titleEl = document.createElement('span'); titleEl.classList.add(styles.title); titleEl.textContent = title;
  const chevron = document.createElement('span'); chevron.classList.add(styles.chevron); chevron.innerHTML = '&#x25B4;';
  if (icon) { const ico = document.createElement('span'); ico.classList.add(styles.icon); ico.innerHTML = icon; header.appendChild(ico); }
  header.appendChild(titleEl); header.appendChild(chevron);
  const body = document.createElement('div'); body.classList.add(styles.body);
  const inner = document.createElement('div'); inner.classList.add(styles.inner);
  if (content instanceof HTMLElement) inner.appendChild(content);
  else if (typeof content === 'string') inner.innerHTML = content;
  body.appendChild(inner);
  const toggle = () => {
    isOpen = !isOpen; el.classList.toggle(styles.open, isOpen);
    header.setAttribute('aria-expanded', String(isOpen));
    body.style.maxHeight = isOpen ? inner.scrollHeight + 'px' : '0';
    if (onToggle) onToggle(isOpen);
  };
  header.addEventListener('click', toggle);
  header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  if (isOpen) { el.classList.add(styles.open); requestAnimationFrame(() => { body.style.maxHeight = inner.scrollHeight + 'px'; }); }
  else { body.style.maxHeight = '0'; }
  el.appendChild(header); el.appendChild(body);
  return { el, open: () => { if (!isOpen) toggle(); }, close: () => { if (isOpen) toggle(); }, toggle };
}