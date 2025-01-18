import alertStyles from './alert.module.css';

// Function to create an alert dynamically with Material Icons
export function createAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  const iconSpan = document.createElement('span');
  const messageSpan = document.createElement('span');

  // Define icon and class mappings based on the alert type
  const typeMappings = {
    info: { icon: 'info', className: alertStyles.alertInfo },
    success: { icon: 'check_circle', className: alertStyles.alertSuccess },
    warning: { icon: 'warning', className: alertStyles.alertWarning },
    error: { icon: 'error', className: alertStyles.alertError },
  };

  const { icon, className } = typeMappings[type] || typeMappings.info;

  // Set up the icon span
  iconSpan.className = 'material-icons';
  iconSpan.textContent = icon;

  // Set up the message span
  messageSpan.textContent = message;

  // Configure the alert container
  alertDiv.className = `${alertStyles.alert} ${className}`;
  alertDiv.appendChild(iconSpan);
  alertDiv.appendChild(messageSpan);

  // Add the alert to the body
  document.body.appendChild(alertDiv);

  // Optional: Auto-dismiss the alert after a set time
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}