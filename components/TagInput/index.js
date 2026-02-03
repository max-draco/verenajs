import styles from './TagInput.module.css';
export function createTagInput({ placeholder = 'Add tag...', tags = [], onChange, maxTags } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.wrapper);
  el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Tag input');
  const tagsWrap = document.createElement('div'); tagsWrap.classList.add(styles.tags);
  const input = document.createElement('input'); input.classList.add(styles.input); input.placeholder = placeholder;
  el.appendChild(tagsWrap); el.appendChild(input);
  const current = [...tags];
  function render() {
    tagsWrap.innerHTML = '';
    current.forEach((tag, i) => {
      const chip = document.createElement('span'); chip.classList.add(styles.tag); chip.textContent = tag;
      const rm = document.createElement('button'); rm.classList.add(styles.rm); rm.setAttribute('aria-label', 'Remove ' + tag); rm.textContent = '\u00D7';
      rm.addEventListener('click', () => { current.splice(i, 1); render(); if (onChange) onChange([...current]); });
      chip.appendChild(rm); tagsWrap.appendChild(chip);
    });
  }
  function addTag(v) {
    const t = v.trim(); if (!t || current.includes(t)) return;
    if (maxTags && current.length >= maxTags) return;
    current.push(t); render(); input.value = '';
    if (onChange) onChange([...current]);
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); addTag(input.value); }
    if (e.key === 'Backspace' && !input.value && current.length) { current.pop(); render(); if (onChange) onChange([...current]); }
  });
  el.addEventListener('click', () => input.focus());
  render();
  return { el, getTags: () => [...current], addTag, removeTag: t => { const i = current.indexOf(t); if (i > -1) { current.splice(i, 1); render(); if (onChange) onChange([...current]); } } };
}