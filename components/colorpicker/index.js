import colorpickerStyles from './colorpicker.module.css';

export function createColorPicker() {
  const input = document.createElement('input');
  input.type = 'color';
  input.className = colorpickerStyles.colorPicker;
  document.body.appendChild(input);
}
