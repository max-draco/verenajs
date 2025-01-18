import dropdownStyles from './dropdown.module.css';

export  function createDropdown(options) {
  const select = document.createElement('select');
  select.className = dropdownStyles.dropdown;

  options.forEach(optionText => {
    const option = document.createElement('option');
    option.textContent = optionText;
    select.appendChild(option);
  });

  document.body.appendChild(select);
}

