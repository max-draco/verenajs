import formStyles from './form.module.css';

function createForm(actionUrl, method = 'POST') {
  const form = document.createElement('form');
  form.action = actionUrl;
  form.method = method;
  form.className = formStyles.form;

  document.body.appendChild(form);
  return form;
}

export default createForm;
