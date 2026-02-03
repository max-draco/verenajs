import styles from './MultiSelect.module.css';
export function createMultiSelect({ options = [], placeholder = 'Select...', onChange, value = [], searchable = true } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.wrapper);
  const selected = new Set(value);
  const trigger = document.createElement('div'); trigger.classList.add(styles.trigger);
  const chipsWrap = document.createElement('div'); chipsWrap.classList.add(styles.chips);
  const chevron = document.createElement('span'); chevron.classList.add(styles.chevron); chevron.innerHTML = '&#x25B4;';
  trigger.appendChild(chipsWrap); trigger.appendChild(chevron);
  const dropdown = document.createElement('div'); dropdown.classList.add(styles.dropdown);
  let searchInput; let filterText = '';
  if (searchable) { searchInput = document.createElement('input'); searchInput.classList.add(styles.search); searchInput.placeholder = 'Search...'; dropdown.appendChild(searchInput); }
  const list = document.createElement('div'); list.classList.add(styles.list); dropdown.appendChild(list);
  let isOpen = false;
  function renderOptions() {
    list.innerHTML = '';
    options.filter(o => !filterText || (o.label || o).toString().toLowerCase().includes(filterText.toLowerCase())).forEach(opt => {
      const val = opt.value ?? opt, label = opt.label ?? opt;
      const item = document.createElement('div'); item.classList.add(styles.option);
      if (selected.has(val)) item.classList.add(styles.sel);
      item.setAttribute('role', 'option'); item.setAttribute('aria-selected', String(selected.has(val)));
      const check = document.createElement('span'); check.classList.add(styles.check); check.innerHTML = selected.has(val) ? '&#x2713;' : '';
      const lbl = document.createElement('span'); lbl.textContent = label;
      item.appendChild(check); item.appendChild(lbl);
      item.addEventListener('click', () => { selected.has(val) ? selected.delete(val) : selected.add(val); renderChips(); renderOptions(); if (onChange) onChange([...selected]); });
      list.appendChild(item);
    });
  }
  function renderChips() {
    chipsWrap.innerHTML = '';
    if (!selected.size) { const p = document.createElement('span'); p.classList.add(styles.ph); p.textContent = placeholder; chipsWrap.appendChild(p); }
    else { [...selected].forEach(val => { const opt = options.find(o => (o.value ?? o) === val); const chip = document.createElement('span'); chip.classList.add(styles.chip); chip.textContent = opt ? (opt.label ?? opt) : val; chipsWrap.appendChild(chip); }); }
  }
  trigger.addEventListener('click', () => { isOpen = !isOpen; el.classList.toggle(styles.open, isOpen); if (isOpen && searchInput) searchInput.focus(); });
  document.addEventListener('click', e => { if (!el.contains(e.target)) { isOpen = false; el.classList.remove(styles.open); } });
  if (searchInput) searchInput.addEventListener('input', () => { filterText = searchInput.value; renderOptions(); });
  el.appendChild(trigger); el.appendChild(dropdown);
  renderOptions(); renderChips();
  return { el, getSelected: () => [...selected], setSelected: v => { selected.clear(); v.forEach(x => selected.add(x)); renderChips(); renderOptions(); } };
}