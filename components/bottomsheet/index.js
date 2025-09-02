// components/bottomsheet/index.js
import styles from './index.module.css';

/**
 * createBottomSheet
 * @param {Object} opts
 * @param {HTMLElement|string} [opts.opener]   Element or selector that opens the sheet on click
 * @param {HTMLElement|string} [opts.mountTo]  Container to append into (default: document.body)
 * @param {HTMLElement|string} [opts.content]  Sheet content (HTMLElement or HTML string)
 * @param {boolean} [opts.closeOnBackdrop=true]
 * @param {number}  [opts.maxHeightVH=85]      Max height as viewport %
 * @param {Function} [opts.onOpen]
 * @param {Function} [opts.onClose]
 * @returns {{el:HTMLElement, open:Function, close:Function, destroy:Function, setContent:Function}}
 */
export function createBottomSheet(opts = {}) {
  const {
    opener,
    mountTo,
    content,
    closeOnBackdrop = true,
    maxHeightVH = 85,
    onOpen,
    onClose,
  } = opts;

  // --- build DOM ---
  const root = document.createElement('div');
  root.classList.add(styles.container); // initially hidden (pointer-events: none)

  const backdrop = document.createElement('div');
  backdrop.classList.add(styles.backdrop);

  const panel = document.createElement('div');
  panel.classList.add(styles.panel);
  panel.style.setProperty('--sheet-max-height', `${maxHeightVH}vh`);

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.setAttribute('aria-label', 'Drag to close');
  handle.classList.add(styles.handle);

  const contentWrap = document.createElement('div');
  contentWrap.classList.add(styles.content);

  if (content instanceof HTMLElement) {
    contentWrap.appendChild(content);
  } else if (typeof content === 'string') {
    contentWrap.innerHTML = content;
  }

  panel.appendChild(handle);
  panel.appendChild(contentWrap);
  root.appendChild(backdrop);
  root.appendChild(panel);

  const host =
    typeof mountTo === 'string'
      ? document.querySelector(mountTo)
      : mountTo instanceof HTMLElement
      ? mountTo
      : document.body;

  host.appendChild(root);

  // --- state ---
  let isOpen = false;
  let lockedScroll = false;
  let prevFocus = null;

  // drag state
  let dragging = false;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;

  // --- helpers ---
  const focusableSelector =
    'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function lockScroll() {
    if (lockedScroll) return;
    lockedScroll = true;
    document.documentElement.classList.add(styles.locked);
  }

  function unlockScroll() {
    if (!lockedScroll) return;
    lockedScroll = false;
    document.documentElement.classList.remove(styles.locked);
  }

  function trapFocus(e) {
    if (!isOpen || e.key !== 'Tab') return;
    const nodes = panel.querySelectorAll(focusableSelector);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function setContent(nodeOrHtml) {
    contentWrap.innerHTML = '';
    if (nodeOrHtml instanceof HTMLElement) contentWrap.appendChild(nodeOrHtml);
    else if (typeof nodeOrHtml === 'string') contentWrap.innerHTML = nodeOrHtml;
  }

  // --- open/close ---
  function open() {
    if (isOpen) return;
    isOpen = true;
    prevFocus = document.activeElement;

    root.classList.add(styles.open);
    lockScroll();

    // focus first focusable after animation
    requestAnimationFrame(() => {
      const focusable = panel.querySelector(focusableSelector);
      if (focusable) focusable.focus();
      else handle.focus();
    });

    onOpen && onOpen();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    root.classList.remove(styles.open);
    // wait for transition to finish (panel/backdrop share duration)
    const done = () => {
      root.removeEventListener('transitionend', done);
      unlockScroll();
      if (prevFocus && document.contains(prevFocus)) {
        prevFocus.focus();
      }
      onClose && onClose();
    };
    root.addEventListener('transitionend', done);
  }

  // --- events: backdrop / esc / focus trap ---
  function onBackdropClick(e) {
    if (!closeOnBackdrop) return;
    if (e.target === backdrop) close();
  }
  backdrop.addEventListener('click', onBackdropClick);

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  }
  document.addEventListener('keydown', onKey);

  // optional opener
  if (opener) {
    const openerEl =
      typeof opener === 'string' ? document.querySelector(opener) : opener;
    if (openerEl) openerEl.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }

  // --- drag to dismiss (pointer events on handle area) ---
  const onPointerDown = (e) => {
    // only left mouse / primary pointer
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    startY = e.clientY;
    lastY = startY;
    lastT = performance.now();

    root.classList.add(styles.dragging);
    panel.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const y = e.clientY;
    const dy = Math.max(0, y - startY); // downward only
    lastY = y;

    panel.style.transform = `translateY(${dy}px)`;
    // fade backdrop proportionally
    const sheetHeight = panel.getBoundingClientRect().height || 1;
    const pct = Math.min(1, dy / sheetHeight);
    backdrop.style.opacity = String(1 - pct * 0.9);
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove(styles.dragging);

    const endY = e.clientY;
    const dy = Math.max(0, endY - startY);
    const dt = Math.max(1, performance.now() - lastT);
    const velocity = (endY - lastY) / dt; // px/ms

    const sheetHeight = panel.getBoundingClientRect().height || 1;
    const passDistance = dy > sheetHeight * 0.33;
    const passVelocity = velocity > 0.6;

    // snap
    panel.style.transform = ''; // let CSS take over
    backdrop.style.opacity = '';

    if (passDistance || passVelocity) close();
    else open();
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', onPointerUp);
  handle.addEventListener('pointercancel', onPointerUp);
  // also allow dragging from the panel top area (40px)
  panel.addEventListener('pointerdown', (e) => {
    const rect = panel.getBoundingClientRect();
    if (e.clientY - rect.top <= 40) onPointerDown(e);
  });
  panel.addEventListener('pointermove', onPointerMove);
  panel.addEventListener('pointerup', onPointerUp);
  panel.addEventListener('pointercancel', onPointerUp);

  // --- public API ---
  return {
    el: root,
    open,
    close,
    setContent,
    destroy() {
      document.removeEventListener('keydown', onKey);
      backdrop.removeEventListener('click', onBackdropClick);
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
      panel.removeEventListener('pointerdown', onPointerDown);
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerup', onPointerUp);
      panel.removeEventListener('pointercancel', onPointerUp);
      root.remove();
      unlockScroll();
    }
  };
}
