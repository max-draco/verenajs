import datepickerStyles from './datepicker.module.css';

export function createDatePicker(target) {
  if (!target || !(target instanceof HTMLElement)) {
    throw new Error('createDatePicker requires a valid DOM element as target.');
  }

  const input = document.createElement('input');
  input.type = 'date';
  input.className = datepickerStyles.datePicker;
  target.appendChild(input);
}
