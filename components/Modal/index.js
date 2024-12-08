import modalStyles from './modal.module.css';

function createModal(content) {
  const modal = document.createElement('div');
  modal.className = modalStyles.modal;

  const modalContent = document.createElement('div');
  modalContent.className = modalStyles.modalContent;
  modalContent.innerHTML = content;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.className = modalStyles.closeButton;
  closeButton.onclick = () => modal.remove();

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

export default createModal;
