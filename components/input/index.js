import inputStyles from './input.module.css';

function createInput(type = 'text', placeholder = '') {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.className = inputStyles.input;
  document.body.appendChild(input);
}

export default createInput;
