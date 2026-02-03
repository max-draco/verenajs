import styles from './FileUploader.module.css';
export function createFileUploader({ accept = '*', multiple = false, maxSize, onUpload, placeholder = 'Drop files here or click to upload' } = {}) {
  const el = document.createElement('div'); el.classList.add(styles.uploader);
  const zone = document.createElement('div'); zone.classList.add(styles.zone);
  zone.setAttribute('role', 'button'); zone.setAttribute('tabindex', '0');
  const icon = document.createElement('div'); icon.classList.add(styles.icon);
  icon.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
  const txt = document.createElement('p'); txt.classList.add(styles.txt); txt.textContent = placeholder;
  const hint = document.createElement('p'); hint.classList.add(styles.hint);
  hint.textContent = (accept !== '*' ? 'Accepts: ' + accept : '') + (maxSize ? ' Max: ' + fmtSize(maxSize) : '');
  zone.appendChild(icon); zone.appendChild(txt); zone.appendChild(hint); el.appendChild(zone);
  const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.classList.add(styles.hidden);
  fileInput.accept = accept; fileInput.multiple = multiple; el.appendChild(fileInput);
  const previewsWrap = document.createElement('div'); previewsWrap.classList.add(styles.previews); el.appendChild(previewsWrap);
  const files = [];
  function handle(newFiles) {
    Array.from(newFiles).forEach(f => { if (maxSize && f.size > maxSize) return; files.push(f); addPreview(f); });
    if (onUpload) onUpload([...files]);
  }
  function addPreview(file) {
    const item = document.createElement('div'); item.classList.add(styles.previewItem);
    const name = document.createElement('span'); name.classList.add(styles.fname); name.textContent = file.name;
    const size = document.createElement('span'); size.classList.add(styles.fsize); size.textContent = fmtSize(file.size);
    const rm = document.createElement('button'); rm.classList.add(styles.rmFile); rm.textContent = '\u00D7';
    rm.addEventListener('click', () => { files.splice(files.indexOf(file), 1); item.remove(); if (onUpload) onUpload([...files]); });
    item.appendChild(name); item.appendChild(size); item.appendChild(rm); previewsWrap.appendChild(item);
  }
  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('keydown', e => { if (e.key === 'Enter') fileInput.click(); });
  fileInput.addEventListener('change', () => handle(fileInput.files));
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add(styles.over); });
  zone.addEventListener('dragleave', () => zone.classList.remove(styles.over));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove(styles.over); handle(e.dataTransfer.files); });
  return { el, getFiles: () => [...files], clear: () => { files.length = 0; previewsWrap.innerHTML = ''; } };
}
function fmtSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }