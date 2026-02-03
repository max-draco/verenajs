/**
 * GlassMorphism — frosted-glass panels & cards
 *
 * createGlassPanel({ blur, opacity, dark, padding, radius, shadow, border, children })
 * createGlassCard({ title, subtitle, icon, value, accentColor })
 */
import styles from './glassMorphism.module.css';

export function createGlassPanel({
  blur = 20,
  opacity = 0.08,
  dark = true,
  padding = '20px',
  radius = '18px',
  shadow = true,
  border = true,
  children = null,
  className = ''
} = {}) {
  const panel = document.createElement('div');
  panel.className = `${styles.glassPanel} ${className}`;

  const bg = dark
    ? `rgba(11,11,12,${0.55 + opacity})`
    : `rgba(255,255,255,${opacity})`;
  const bd = dark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.18)';

  panel.style.cssText = `
    background:${bg};
    backdrop-filter:blur(${blur}px) saturate(1.4);
    -webkit-backdrop-filter:blur(${blur}px) saturate(1.4);
    border:${border ? `1px solid ${bd}` : 'none'};
    border-radius:${radius};
    padding:${padding};
    ${shadow ? 'box-shadow:0 8px 32px rgba(0,0,0,0.25);' : ''}
  `;

  if (children instanceof Node) panel.appendChild(children);
  else if (typeof children === 'string') panel.innerHTML = children;

  return panel;
}

export function createGlassCard({
  title = '',
  subtitle = '',
  icon = '',
  value = '',
  accentColor = '#60a5fa'
} = {}) {
  const card = document.createElement('div');
  card.className = styles.glassCard;

  let html = '';
  if (icon) html += `<div class="${styles.cardIcon}" style="color:${accentColor}"><i class="${icon}"></i></div>`;
  if (title) html += `<div class="${styles.cardTitle}">${title}</div>`;
  if (value) html += `<div class="${styles.cardValue}" style="color:${accentColor}">${value}</div>`;
  if (subtitle) html += `<div class="${styles.cardSubtitle}">${subtitle}</div>`;

  card.innerHTML = html;
  return card;
}
