import labelStyles from './label.module.css';

function createLabel(forId, text) {
  const label = document.createElement('label');
  label.htmlFor = forId;
  label.textContent = text;
  label.className = labelStyles.label;
  document.body.appendChild(label);
}

export default createLabel;
