import dropdownStyles from './dropdown.module.css';

/**
 * Creates a styled dropdown component
 * @param {Object} config
 * @param {(string|{label:string,value:string,disabled?:boolean,selected?:boolean,attrs?:Record<string,string>})[]} config.options
 * @param {HTMLElement|string} [config.mountTo] - Element or selector to append dropdown to (optional)
 * @param {Function} [config.onChange] - Callback when value changes (value:string)
 * @param {string} [config.defaultValue] - The default selected value (matches option.value)
 * @param {string} [config.name] - Optional name attribute
 * @param {string} [config.id] - Optional id attribute
 * @param {string} [config.ariaLabel] - Optional aria-label
 * @returns {HTMLSelectElement & { getValue:()=>string, setValue:(v:string)=>void }} The dropdown element
 */
export function createDropdown({
  options = [],
  mountTo,
  onChange,
  defaultValue,
  name,
  id,
  ariaLabel,
} = {}) {
  const select = document.createElement('select');
  select.className = dropdownStyles.dropdown;
  if (name) select.name = name;
  if (id) select.id = id;
  if (ariaLabel) select.setAttribute('aria-label', ariaLabel);

  const normalized = options.map(opt => {
    if (typeof opt === 'string') return { label: opt, value: opt };
    // minimal validation
    if (!opt || typeof opt.value !== 'string') {
      throw new Error('Each option must be a string or an object with a string `value`.');
    }
    return { label: opt.label ?? opt.value, value: opt.value, disabled: !!opt.disabled, selected: !!opt.selected, attrs: opt.attrs || {} };
  });

  normalized.forEach(({ label, value, disabled, selected, attrs }) => {
    const optionEl = document.createElement('option');
    optionEl.value = value;
    optionEl.textContent = label;
    if (disabled) optionEl.disabled = true;

    // defaultValue wins; otherwise honor `selected` flag
    if (defaultValue === value) optionEl.selected = true;
    else if (!defaultValue && selected) optionEl.selected = true;

    // extra attributes if provided (e.g., data-* )
    for (const [k, v] of Object.entries(attrs)) {
      optionEl.setAttribute(k, String(v));
    }
    select.appendChild(optionEl);
  });

  // Event listener for changes
  if (typeof onChange === 'function') {
    select.addEventListener('change', e => onChange(e.target.value));
  }

  // Small convenience API
  select.getValue = () => select.value;
  select.setValue = (v) => {
    select.value = v;
    // Manually trigger change callback if present
    const evt = new Event('change', { bubbles: true });
    select.dispatchEvent(evt);
  };

  // Append if mountTo is provided
  if (mountTo) {
    const container = typeof mountTo === 'string' ? document.querySelector(mountTo) : mountTo;
    if (container) container.appendChild(select);
  }

  return select;
}
