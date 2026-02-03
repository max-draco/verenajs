import buttonStyles from './index.module.css';
export function createButton({ type = 'primary', label = 'Click Me', onClick = () => {} }) {
    // Create the button element
    const button = document.createElement('button');
    // Add base styles from the CSS module
    button.classList.add(buttonStyles.button);
    // Ad style based on type (primary, secondary, etc.)
    const buttonTypeClass = buttonStyles[`button${type.charAt(0).toUpperCase() + type.slice(1)}`];
    if (buttonTypeClass) {
        button.classList.add(buttonTypeClass);
    }

    // Set the button's label
    button.textContent = label;

    // Add click event listener
    button.addEventListener('click', onClick);

    // Return the button element
    return button;
}
// Export the createButton function