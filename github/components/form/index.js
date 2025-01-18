import * as formStyles from './form.module.css'; // Import all styles

// Define a class for the form
export class shadid {
  constructor({ action = '', method = 'POST', className = formStyles.form } = {}) {
    // Create the form element
    this.form = document.createElement('form');
    
    // Set the form's action and method
    this.form.action = action;
    this.form.method = method;

    // Apply custom or default styles
    this.form.classList.add(className);
  }

  // Method to dynamically add elements (inputs or other components)
  addElement(element) {
    if (element && element instanceof HTMLElement) {
      this.form.appendChild(element); // Append valid HTML elements or components
    } else {
      console.warn('Element to be added is not a valid HTMLElement');
    }
  }

  // Method to clear all elements from the form
  clearForm() {
    this.form.innerHTML = ''; // Clear the form's contents
  }

  // Method to reset the form (restores input values to default)
  resetForm() {
    this.form.reset();
  }

  // Method to get the form element (returns the form itself)
  getForm() {
    return this.form;
  }

  // Method to set a custom submit handler
  setSubmitHandler(callback) {
    if (typeof callback === 'function') {
      this.form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        callback(event); // Call the custom callback
      });
    }
  }
}
