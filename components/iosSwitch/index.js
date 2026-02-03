/**
 * IOSSwitch — pill-shaped iOS toggle
 *
 * createIOSSwitch({ value, onChange, label, onColor, offColor })
 * Returns a row element with .getValue() / .setValue(bool) API
 */
import styles from './iosSwitch.module.css';

export function createIOSSwitch({
  value = false,
  onChange,
  label = '',
  onColor = '#22c55e',
  offColor = '#3a3a3c'
} = {}) {
  const row = document.createElement('div');
  row.className = styles.switchRow;

  if (label) {
    const lbl = document.createElement('span');
    lbl.className = styles.switchLabel;
    lbl.textContent = label;
    row.appendChild(lbl);
  }

  const track = document.createElement('div');
  track.className = styles.switchTrack;
  track.style.backgroundColor = value ? onColor : offColor;

  const thumb = document.createElement('div');
  thumb.className = styles.switchThumb;
  if (value) thumb.classList.add(styles.thumbOn);

  track.appendChild(thumb);
  row.appendChild(track);

  let current = value;

  track.addEventListener('click', () => {
    current = !current;
    track.style.backgroundColor = current ? onColor : offColor;
    thumb.classList.toggle(styles.thumbOn, current);
    if (onChange) onChange(current);
  });

  row.getValue = () => current;
  row.setValue = (v) => {
    current = !!v;
    track.style.backgroundColor = current ? onColor : offColor;
    thumb.classList.toggle(styles.thumbOn, current);
  };

  return row;
}
