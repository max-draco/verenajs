import alertStyles from './alert.module.css';

function createAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = alertStyles[`alert${type.charAt(0).toUpperCase() + type.slice(1)}`];
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
}

export default createAlert;
