import checkboxStyles from './checkbox.module.css';

function createCheckbox(labelText) {
  const container = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = checkboxStyles.checkbox;

  container.appendChild(checkbox);
  container.appendChild(document.createTextNode(labelText));

  document.body.appendChild(container);
}

export default createCheckbox;
