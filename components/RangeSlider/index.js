import styles from './RangeSlider.module.css';
export function createRangeSlider({ min = 0, max = 100, step = 1, value = [0, 100], onChange, label, prefix = '', suffix = '' } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.slider);
  let [low, high] = value;
  if (label) {
    const hdr = document.createElement('div'); hdr.classList.add(styles.header);
    const lbl = document.createElement('span'); lbl.classList.add(styles.label); lbl.textContent = label;
    const val = document.createElement('span'); val.classList.add(styles.val); val.id = 'rv-val';
    val.textContent = prefix + low + ' \u2013 ' + high + suffix;
    hdr.appendChild(lbl); hdr.appendChild(val); el.appendChild(hdr);
  }
  const track = document.createElement('div'); track.classList.add(styles.track);
  const range = document.createElement('div'); range.classList.add(styles.range);
  const tL = document.createElement('div'); tL.classList.add(styles.thumb); tL.setAttribute('role', 'slider'); tL.setAttribute('tabindex', '0');
  const tH = document.createElement('div'); tH.classList.add(styles.thumb); tH.setAttribute('role', 'slider'); tH.setAttribute('tabindex', '0');
  track.appendChild(range); track.appendChild(tL); track.appendChild(tH); el.appendChild(track);
  function update() {
    const r = max - min, lp = ((low - min) / r) * 100, hp = ((high - min) / r) * 100;
    tL.style.left = lp + '%'; tH.style.left = hp + '%'; range.style.left = lp + '%'; range.style.width = (hp - lp) + '%';
    const valEl = el.querySelector('#rv-val'); if (valEl) valEl.textContent = prefix + low + ' \u2013 ' + high + suffix;
    if (onChange) onChange([low, high]);
  }
  function drag(isLow) {
    return e => {
      e.preventDefault();
      const onMove = ev => {
        const rect = track.getBoundingClientRect(), x = ev.clientX || (ev.touches && ev.touches[0].clientX);
        let pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        let v = Math.round((min + pct * (max - min)) / step) * step;
        if (isLow) low = Math.min(v, high - step); else high = Math.max(v, low + step);
        update();
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onUp);
    };
  }
  tL.addEventListener('mousedown', drag(true)); tL.addEventListener('touchstart', drag(true), { passive: false });
  tH.addEventListener('mousedown', drag(false)); tH.addEventListener('touchstart', drag(false), { passive: false });
  update();
  return { el, getRange: () => [low, high], setRange: v => { [low, high] = v; update(); } };
}