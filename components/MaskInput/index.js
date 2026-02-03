import styles from './MaskInput.module.css';
const MASKS = { phone: { m: '(###) ###-####', ph: '(555) 123-4567' }, card: { m: '#### #### #### ####', ph: '1234 5678 9012 3456' }, date: { m: '##/##/####', ph: 'MM/DD/YYYY' }, ssn: { m: '###-##-####', ph: '123-45-6789' } };
export function createMaskInput({ mask = 'phone', label, onChange } = {}) {
  const def = MASKS[mask] || { m: mask, ph: '' };
  const wrapper = document.createElement('div'); wrapper.classList.add(styles.wrapper);
  if (label) { const l = document.createElement('label'); l.classList.add(styles.label); l.textContent = label; wrapper.appendChild(l); }
  const input = document.createElement('input'); input.type = 'text'; input.classList.add(styles.input);
  input.placeholder = def.ph; input.maxLength = def.m.length;
  function applyMask(raw) {
    let r = '', ri = 0;
    for (let i = 0; i < def.m.length && ri < raw.length; i++) {
      if (def.m[i] === '#') { if (/\d/.test(raw[ri])) { r += raw[ri]; ri++; } else ri--; }
      else r += def.m[i];
    }
    return r;
  }
  input.addEventListener('input', () => {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = applyMask(raw);
    if (onChange) onChange(input.value, raw);
  });
  wrapper.appendChild(input);
  return { el: wrapper, getValue: () => input.value, getRaw: () => input.value.replace(/[^\d]/g, '') };
}