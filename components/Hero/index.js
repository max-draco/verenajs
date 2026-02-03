import styles from './Hero.module.css';
export function createHero({ title = '', subtitle = '', background, cta, overlay = true, height = '100vh', align = 'center' } = {}) {
  const el = document.createElement('section'); el.classList.add(styles.hero);
  el.style.height = height;
  if (background) el.style.setProperty('--hero-bg', background);
  el.setAttribute('role', 'banner');
  if (overlay) { const ov = document.createElement('div'); ov.classList.add(styles.overlay); el.appendChild(ov); }
  const content = document.createElement('div'); content.classList.add(styles.content, styles[align] || styles.center);
  if (title) { const h1 = document.createElement('h1'); h1.classList.add(styles.title); h1.textContent = title; content.appendChild(h1); }
  if (subtitle) { const p = document.createElement('p'); p.classList.add(styles.subtitle); p.textContent = subtitle; content.appendChild(p); }
  if (cta) { const btn = document.createElement('button'); btn.classList.add(styles.cta); btn.textContent = cta.label || 'Get Started'; btn.addEventListener('click', cta.onClick || (() => {})); content.appendChild(btn); }
  el.appendChild(content);
  return el;
}