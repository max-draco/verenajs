import badgeStyles from './badge.module.css';

export function createBadge(text, type = 'default') {
  const badge = document.createElement('span');
  badge.className = badgeStyles[`badge${type.charAt(0).toUpperCase() + type.slice(1)}`];
  badge.textContent = text;
  document.body.appendChild(badge);
}

