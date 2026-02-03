import styles from './PhoneInput.module.css';
const COUNTRIES = [{c:'+1',f:'\uD83C\uDDFA\uD83C\uDDF8',n:'United States'},{c:'+44',f:'\uD83C\uDDEC\uD83C\uDDE7',n:'United Kingdom'},{c:'+254',f:'\uD83C\uDDEA\uD83C\uDDED',n:'Kenya'},{c:'+255',f:'\uD83C\uDDFB\uD83C\uDDFF',n:'Tanzania'},{c:'+27',f:'\uD83C\uDDFF\uD83C\uDDE6',n:'South Africa'},{c:'+234',f:'\uD83C\uDDF3\uD83C\uDDEC',n:'Nigeria'},{c:'+33',f:'\uD83C\uDDEB\uD83C\uDDF7',n:'France'},{c:'+49',f:'\uD83C\uDDE9\uD83C\uDDEA',n:'Germany'},{c:'+91',f:'\uD83C\uDDEE\uD83C\uDDF3',n:'India'},{c:'+86',f:'\uD83C\uDDE8\uD83C\uDDF3',n:'China'}];
export function createPhoneInput({ label, placeholder = 'Enter phone number', defaultCountry = '+1', onChange } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.wrapper);
  if (label) { const l = document.createElement('label'); l.classList.add(styles.label); l.textContent = label; el.appendChild(l); }
  const row = document.createElement('div'); row.classList.add(styles.row);
  let sel = COUNTRIES.find(c => c.c === defaultCountry) || COUNTRIES[0];
  const btn = document.createElement('button'); btn.type = 'button'; btn.classList.add(styles.countryBtn);
  btn.textContent = sel.f + ' ' + sel.c;
  const dd = document.createElement('div'); dd.classList.add(styles.dropdown);
  const search = document.createElement('input'); search.classList.add(styles.search); search.placeholder = 'Search...'; dd.appendChild(search);
  const cList = document.createElement('div'); cList.classList.add(styles.cList); dd.appendChild(cList);
  let isOpen = false;
  function renderCountries(filter = '') {
    cList.innerHTML = '';
    COUNTRIES.filter(c => c.n.toLowerCase().includes(filter.toLowerCase())).forEach(c => {
      const item = document.createElement('button'); item.type = 'button'; item.classList.add(styles.cItem);
      item.textContent = c.f + ' ' + c.n + ' ' + c.c;
      item.addEventListener('click', () => { sel = c; btn.textContent = c.f + ' ' + c.c; isOpen = false; row.classList.remove(styles.open); phoneInput.focus(); if (onChange) onChange(sel.c + phoneInput.value); });
      cList.appendChild(item);
    });
  }
  btn.addEventListener('click', () => { isOpen = !isOpen; row.classList.toggle(styles.open, isOpen); if (isOpen) search.focus(); });
  document.addEventListener('click', e => { if (!el.contains(e.target)) { isOpen = false; row.classList.remove(styles.open); } });
  search.addEventListener('input', () => renderCountries(search.value));
  const phoneInput = document.createElement('input'); phoneInput.type = 'tel'; phoneInput.classList.add(styles.phoneInput);
  phoneInput.placeholder = placeholder; phoneInput.addEventListener('input', () => { if (onChange) onChange(sel.c + phoneInput.value); });
  row.appendChild(btn); row.appendChild(dd); row.appendChild(phoneInput);
  el.appendChild(row); renderCountries();
  return { el, getValue: () => sel.c + phoneInput.value };
}