import datepickerStyles from './datepicker.module.css';

function createDatePicker() {
  const input = document.createElement('input');
  input.type = 'date';
  input.className = datepickerStyles.datePicker;
  document.body.appendChild(input);
}

export default createDatePicker;
