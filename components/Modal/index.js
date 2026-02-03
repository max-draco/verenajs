import modalStyles from './modal.module.css';

export function createModal(content, triggerButton) {
  // Disable the trigger button immediately
  if (triggerButton) triggerButton.classList.add(modalStyles.lnkDisable);

  const modal = document.createElement('div');
  modal.className = modalStyles.modal;

  const modalContent = document.createElement('div');
  modalContent.className = modalStyles.modalContent;
  modalContent.appendChild(content);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.classList.add(modalStyles.closeButton);
  closeButton.onclick = () => {
    modal.remove();
    if (triggerButton) triggerButton.classList.remove(modalStyles.lnkDisable); // Re-enable when closed
  };

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
 return modal;
}
