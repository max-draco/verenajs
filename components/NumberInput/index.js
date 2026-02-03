import styles from './NumberInput.module.css';
export function createNumberInput({ value = 0, min, max, step = 1, label, onChange } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.wrapper);
  if (label) { const l = document.createElement('label'); l.classList.add(styles.label); l.textContent = label; el.appendChild(l); }
  const row = document.createElement('div'); row.classList.add(styles.row);
  const dec = document.createElement('button'); dec.type = 'button'; dec.classList.add(styles.btn); dec.setAttribute('aria-label', 'Decrease'); dec.textContent = '\u2212';
  const input = document.createElement('input'); input.type = 'number'; input.classList.add(styles.input);
  input.value = value; input.step = step; if (min != null) input.min = min; if (max != null) input.max = max;
  const inc = document.createElement('button'); inc.type = 'button'; inc.classList.add(styles.btn); inc.setAttribute('aria-label', 'Increase'); inc.textContent = '+';
  let current = Number(value);
  function update(v) { current = min != null ? Math.max(min, v) : v; current = max != null ? Math.min(max, current) : current; input.value = current; if (onChange) onChange(current); }
  dec.addEventListener('click', () => update(current - step));
  inc.addEventListener('click', () => update(current + step));
  input.addEventListener('input', () => { const v = parseFloat(input.value); if (!isNaN(v)) update(v); });
  row.appendChild(dec); row.appendChild(input); row.appendChild(inc); el.appendChild(row);
  return { el, getValue: () => current, setValue: v => update(v) };
}