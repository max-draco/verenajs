import * as styles from './input.module.css'; // Import all styles

export function createInput({ label, name, type = 'text', placeholder }) {
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add(styles.inputWrapper); // Apply wrapper styles

  // Create the label for input
  const inputLabel = document.createElement('label');
  inputLabel.textContent = label;
  inputLabel.setAttribute('for', name);
  inputLabel.classList.add(styles.label);

  // Create the actual input field
  const input = document.createElement('input');
  input.classList.add(styles.input, styles[type]); // Dynamically add type-specific styles
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;

  inputWrapper.appendChild(inputLabel);
  inputWrapper.appendChild(input);

  return inputWrapper; // Return the div containing the input and label
}
