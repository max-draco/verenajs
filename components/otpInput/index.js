/**
 * OTP input component - vanilla JS replacement for React avatar.js
 * No React dependencies
 * Usage: createOTPInput({ length, autoFocus, disabled, mask, gap, onComplete })
 */
import styles from './index.module.css';

export function createOTPInput({
  length = 6,
  autoFocus = true,
  disabled = false,
  mask = false,
  gap = 10,
  onComplete,
  onChange
}) {
  const wrapper = document.createElement('div');
  wrapper.className = styles.otpWrap;
  wrapper.style.gap = `${gap}px`;

  const inputs = [];
  const values = Array(length).fill('');
  let isCompleted = false;

  // Create input boxes
  for (let i = 0; i < length; i++) {
    const input = document.createElement('input');
    input.className = styles.otpBox;
    input.type = 'text';
    input.inputMode = 'numeric';
    input.maxLength = 1;
    input.pattern = '\\d*';
    input.autocomplete = 'one-time-code';
    input.disabled = disabled;
    input.dataset.index = i;

    // Handle input
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, ''); // Only digits
      values[i] = val;
      input.value = mask && val ? '•' : val;

      // Move to next input
      if (val && i < length - 1) {
        inputs[i + 1]?.focus();
      }

      // Check if complete
      if (values.every(v => v !== '') && values.join('').length === length) {
        if (!isCompleted) {
          isCompleted = true;
          wrapper.classList.add(styles.done);
          onComplete?.(values.join(''));
        }
      } else {
        isCompleted = false;
        wrapper.classList.remove(styles.done);
      }

      // Trigger onChange
      onChange?.(values.join(''), values.every(v => v !== ''));
    });

    // Handle key down (backspace, arrows)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (values[i]) {
          // Clear current
          values[i] = '';
          input.value = '';
          isCompleted = false;
          wrapper.classList.remove(styles.done);
          onChange?.(values.join(''), false);
        } else if (i > 0) {
          // Move to previous and clear
          inputs[i - 1]?.focus();
          values[i - 1] = '';
          inputs[i - 1].value = '';
          onChange?.(values.join(''), false);
        }
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        inputs[i - 1]?.focus();
      } else if (e.key === 'ArrowRight' && i < length - 1) {
        e.preventDefault();
        inputs[i + 1]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        inputs[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        inputs[length - 1]?.focus();
      }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
      const chars = pasteData.slice(0, length).split('');

      chars.forEach((char, idx) => {
        if (idx < length) {
          values[idx] = char;
          inputs[idx].value = mask ? '•' : char;
        }
      });

      // Focus last filled input
      const lastIdx = Math.min(chars.length - 1, length - 1);
      inputs[lastIdx]?.focus();

      // Check completion
      if (values.every(v => v !== '') && values.join('').length === length) {
        wrapper.classList.add(styles.done);
        onComplete?.(values.join(''));
      }

      onChange?.(values.join(''), values.every(v => v !== ''));
    });

    // Handle focus (select all for easier editing)
    input.addEventListener('focus', (e) => {
      e.target.select();
    });

    inputs.push(input);
    wrapper.appendChild(input);
  }

  // Auto-focus first input
  if (autoFocus && !disabled) {
    setTimeout(() => inputs[0]?.focus(), 100);
  }

  // Public API
  wrapper.getValue = () => values.join('');
  wrapper.setValue = (value) => {
    const chars = value.toString().split('').slice(0, length);
    chars.forEach((char, idx) => {
      values[idx] = char;
      inputs[idx].value = mask ? '•' : char;
    });
  };
  wrapper.clear = () => {
    values.fill('');
    inputs.forEach(input => input.value = '');
    wrapper.classList.remove(styles.done);
    inputs[0]?.focus();
    onChange?.('', false);
  };
  wrapper.focus = () => {
    const firstEmpty = inputs.findIndex((inp, idx) => !values[idx]);
    inputs[firstEmpty !== -1 ? firstEmpty : 0]?.focus();
  };

  return wrapper;
}
