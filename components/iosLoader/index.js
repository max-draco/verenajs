/**
 * IOSLoader — classic 12-line activity indicator + full-screen overlay
 *
 * createIOSLoader({ size, color })          → spinner element
 * createIOSLoaderScreen({ message })        → full-screen glass overlay
 * dismissIOSLoader()                        → fade-out & remove overlay
 */
import styles from './iosLoader.module.css';

export function createIOSLoader({ size = 28, color = '#60a5fa' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = styles.loaderWrap;
  wrap.style.width = size + 'px';
  wrap.style.height = size + 'px';

  for (let i = 0; i < 12; i++) {
    const line = document.createElement('div');
    line.className = styles.loaderLine;
    line.style.transform = `rotate(${i * 30}deg)`;
    line.style.animationDelay = `${-1.1 + i * 0.1}s`;

    const bar = document.createElement('div');
    bar.className = styles.loaderBar;
    bar.style.backgroundColor = color;
    bar.style.width = Math.max(2, size * 0.08) + 'px';
    bar.style.height = (size * 0.22) + 'px';

    line.appendChild(bar);
    wrap.appendChild(line);
  }
  return wrap;
}

export function createIOSLoaderScreen({ message = 'Loading…' } = {}) {
  const screen = document.createElement('div');
  screen.className = styles.loaderScreen;
  screen.id = 'iosLoaderScreen';

  const inner = document.createElement('div');
  inner.className = styles.loaderInner;

  inner.appendChild(createIOSLoader({ size: 44, color: '#60a5fa' }));

  const msg = document.createElement('p');
  msg.className = styles.loaderMessage;
  msg.textContent = message;
  inner.appendChild(msg);

  screen.appendChild(inner);
  return screen;
}

export function dismissIOSLoader() {
  const el = document.getElementById('iosLoaderScreen');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => el.remove(), 320);
}
