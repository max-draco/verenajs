import datepickerStyles from './datepicker.module.css';

export function createDatePicker() {
  const input = document.createElement('input');
  input.type = 'date';
  input.className = datepickerStyles.datePicker;
  document.body.appendChild(input);
}
