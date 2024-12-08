import colorpickerStyles from './colorpicker.module.css';

function createColorPicker() {
  const input = document.createElement('input');
  input.type = 'color';
  input.className = colorpickerStyles.colorPicker;
  document.body.appendChild(input);
}

export default createColorPicker;
