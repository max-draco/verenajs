import styles from './SchemaForm.module.css';
export function createSchemaForm({ schema = {}, onSubmit, values = {} } = {}) {
  const el = document.createElement('form'); el.classList.add(styles.form); el.setAttribute('novalidate', '');
  const fields = schema.properties || {}, required = schema.required || [];
  const state = { ...values };
  Object.entries(fields).forEach(([name, def]) => {
    const group = document.createElement('div'); group.classList.add(styles.group);
    const label = document.createElement('label'); label.textContent = def.title || name; label.setAttribute('for', name); label.classList.add(styles.label);
    if (required.includes(name)) { const s = document.createElement('span'); s.style.color = 'var(--red)'; s.textContent = ' *'; label.appendChild(s); }
    group.appendChild(label);
    let input;
    if (def.type === 'boolean') { input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!state[name]; }
    else if (def.type === 'integer' || def.type === 'number') { input = document.createElement('input'); input.type = 'number'; if (def.minimum != null) input.min = def.minimum; if (def.maximum != null) input.max = def.maximum; }
    else if (def.enum) { input = document.createElement('select'); def.enum.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; input.appendChild(o); }); }
    else if (def.format === 'email') { input = document.createElement('input'); input.type = 'email'; }
    else if (def.format === 'password') { input = document.createElement('input'); input.type = 'password'; }
    else { input = document.createElement('input'); input.type = 'text'; }
    input.classList.add(styles.input); input.id = name; input.name = name;
    if (state[name] != null && input.type !== 'checkbox') input.value = state[name];
    if (required.includes(name)) { input.required = true; input.setAttribute('aria-required', 'true'); }
    if (def.placeholder) input.placeholder = def.placeholder;
    if (def.description) { const d = document.createElement('span'); d.classList.add(styles.desc); d.textContent = def.description; group.appendChild(input); group.appendChild(d); }
    else group.appendChild(input);
    input.addEventListener('input', () => { state[name] = input.type === 'checkbox' ? input.checked : input.value; });
    el.appendChild(group);
  });
  const btn = document.createElement('button'); btn.type = 'submit'; btn.classList.add(styles.submit); btn.textContent = 'Submit';
  el.appendChild(btn);
  el.addEventListener('submit', e => { e.preventDefault(); if (el.reportValidity() && onSubmit) onSubmit(state); });
  return { el, getValues: () => ({ ...state }) };
}