import styles from './RichTextEditor.module.css';
export function createRichTextEditor({ placeholder = 'Start typing...', value = '', onChange, toolbar = ['bold','italic','underline','ul','ol'] } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.editor);
  const bar = document.createElement('div'); bar.classList.add(styles.toolbar); bar.setAttribute('role', 'toolbar');
  const cmds = { bold:{l:'B',t:'Bold',c:'bold'}, italic:{l:'I',t:'Italic',c:'italic'}, underline:{l:'U',t:'Underline',c:'underline'}, ul:{l:'\u2022 List',t:'List',c:'insertUnorderedList'}, ol:{l:'1. List',t:'Ordered',c:'insertOrderedList'} };
  toolbar.forEach(name => {
    const def = cmds[name]; if (!def) return;
    const btn = document.createElement('button'); btn.type = 'button'; btn.classList.add(styles.toolBtn);
    btn.textContent = def.l; btn.title = def.t; btn.setAttribute('aria-label', def.t);
    btn.addEventListener('click', () => { document.execCommand(def.c, false, null); area.focus(); });
    bar.appendChild(btn);
  });
  el.appendChild(bar);
  const area = document.createElement('div'); area.classList.add(styles.area);
  area.contentEditable = 'true'; area.setAttribute('role', 'textbox'); area.setAttribute('aria-multiline', 'true');
  if (value) area.innerHTML = value;
  const ph = document.createElement('div'); ph.classList.add(styles.ph); ph.textContent = placeholder; area.appendChild(ph);
  area.addEventListener('input', () => { ph.style.display = area.innerText.trim() === '' ? 'block' : 'none'; if (onChange) onChange(area.innerHTML); });
  el.appendChild(area);
  return { el, getValue: () => area.innerHTML, setValue: html => { area.innerHTML = html; }, getPlainText: () => area.innerText };
}