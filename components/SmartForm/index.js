import styles from './SmartForm.module.css';
import { ValidationEngine } from '../../core/validation.js';
export function createSmartForm({ fields = [], onSubmit, schema } = {}) {
  const validator = new ValidationEngine();
  const el = document.createElement('form');
  el.classList.add(styles.form); el.setAttribute('novalidate', '');
  const errorMap = {}, fieldEls = [];
  (fields || []).forEach((field, i) => {
    const group = document.createElement('div'); group.classList.add(styles.group);
    if (field.label) {
      const label = document.createElement('label'); label.classList.add(styles.label);
      label.textContent = field.label; label.setAttribute('for', field.name || ('f' + i));
      if (field.rules && field.rules.includes('required')) { const s = document.createElement('span'); s.classList.add(styles.req); s.textContent = '*'; label.appendChild(s); }
      group.appendChild(label);
    }
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      (field.options || []).forEach(opt => { const o = document.createElement('option'); o.value = opt.value ?? opt; o.textContent = opt.label ?? opt; input.appendChild(o); });
    } else if (field.type === 'textarea') { input = document.createElement('textarea'); input.rows = field.rows || 3; }
    else { input = document.createElement('input'); input.type = field.type || 'text'; }
    input.classList.add(styles.input); input.name = field.name || ('f' + i); input.id = input.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.value != null) input.value = field.value;
    if (field.rules && field.rules.includes('required')) input.setAttribute('aria-required', 'true');
    input.addEventListener('input', () => { const e = errorMap[input.name]; if (e) { e.el.textContent = ''; input.classList.remove(styles.err); } });
    group.appendChild(input);
    const errEl = document.createElement('span'); errEl.classList.add(styles.error); errEl.setAttribute('role', 'alert');
    group.appendChild(errEl);
    errorMap[input.name] = { el: errEl, input, rules: field.rules || '' };
    fieldEls.push({ input, name: input.name });
    el.appendChild(group);
  });
  const submitBtn = document.createElement('button'); submitBtn.type = 'submit'; submitBtn.classList.add(styles.submit); submitBtn.textContent = 'Submit';
  el.appendChild(submitBtn);
  async function validate() {
    let valid = true;
    for (const [name, entry] of Object.entries(errorMap)) {
      const val = entry.input.type === 'checkbox' ? entry.input.checked : entry.input.value;
      const result = validator.validate(val, entry.rules);
      if (!result.valid) { entry.el.textContent = result.errors[0]; entry.input.classList.add(styles.err); valid = false; }
      else { entry.el.textContent = ''; entry.input.classList.remove(styles.err); }
    }
    return valid;
  }
  function getValues() { const v = {}; fieldEls.forEach(({ input, name }) => { v[name] = input.type === 'checkbox' ? input.checked : input.value; }); return v; }
  el.addEventListener('submit', async e => { e.preventDefault(); if (await validate() && onSubmit) onSubmit(getValues()); });
  return { el, validate, getValues, reset: () => { el.reset(); Object.values(errorMap).forEach(e => { e.el.textContent = ''; e.input.classList.remove(styles.err); }); } };
}