/**
 * verenajs Component Generator
 * Auto-generates production-ready components with full styling and functionality
 *
 * @version 2.0.0
 */

import { dom, theme, injectStyle, events, registerComponent } from './core.js';
import { COMPONENT_CATEGORIES, extendedComponentManifest } from './component-manifest.js';

// Component template configurations
const COMPONENT_TEMPLATES = {
  // ============================================
  // LAYOUT COMPONENTS
  // ============================================
  Container: {
    tag: 'div',
    defaultProps: { maxWidth: '1200px', padding: '1rem', centered: true },
    styles: (props) => `
      .v-container {
        width: 100%;
        max-width: ${props.maxWidth};
        padding: ${props.padding};
        ${props.centered ? 'margin: 0 auto;' : ''}
        box-sizing: border-box;
      }
    `
  },

  Grid: {
    tag: 'div',
    defaultProps: { columns: 12, gap: '1rem', responsive: true },
    styles: (props) => `
      .v-grid {
        display: grid;
        grid-template-columns: repeat(${props.columns}, 1fr);
        gap: ${props.gap};
      }
      ${props.responsive ? `
        @media (max-width: 768px) { .v-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .v-grid { grid-template-columns: 1fr; } }
      ` : ''}
    `
  },

  Flex: {
    tag: 'div',
    defaultProps: { direction: 'row', align: 'center', justify: 'flex-start', gap: '0.5rem', wrap: false },
    styles: (props) => `
      .v-flex {
        display: flex;
        flex-direction: ${props.direction};
        align-items: ${props.align};
        justify-content: ${props.justify};
        gap: ${props.gap};
        ${props.wrap ? 'flex-wrap: wrap;' : ''}
      }
    `
  },

  Stack: {
    tag: 'div',
    defaultProps: { spacing: '1rem', direction: 'vertical' },
    styles: (props) => `
      .v-stack {
        display: flex;
        flex-direction: ${props.direction === 'horizontal' ? 'row' : 'column'};
        gap: ${props.spacing};
      }
    `
  },

  // ============================================
  // FORM COMPONENTS
  // ============================================
  TextInput: {
    tag: 'input',
    defaultProps: { type: 'text', placeholder: '', disabled: false, size: 'medium' },
    attributes: ['type', 'placeholder', 'disabled', 'name', 'value', 'required', 'readonly'],
    styles: () => `
      .v-text-input {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 1px solid var(--v-border, #e2e8f0);
        border-radius: 0.5rem;
        background: var(--v-surface, #fff);
        color: var(--v-text, #1e293b);
        transition: all 0.2s ease;
        outline: none;
      }
      .v-text-input:focus {
        border-color: var(--v-primary, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .v-text-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--v-surface-disabled, #f1f5f9);
      }
      .v-text-input.size-small { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
      .v-text-input.size-large { padding: 1rem 1.25rem; font-size: 1.125rem; }
      .v-text-input.error { border-color: var(--v-error, #ef4444); }
      .v-text-input.success { border-color: var(--v-success, #22c55e); }
    `
  },

  EmailInput: {
    extends: 'TextInput',
    defaultProps: { type: 'email', placeholder: 'Enter email address' },
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },

  PasswordInput: {
    tag: 'div',
    defaultProps: { showToggle: true, strength: false },
    render: (props) => {
      const wrapper = dom.create('div', { className: 'v-password-input-wrapper' });
      const input = dom.create('input', {
        type: 'password',
        className: 'v-password-input',
        placeholder: props.placeholder || 'Enter password'
      });

      if (props.showToggle) {
        const toggle = dom.create('button', {
          type: 'button',
          className: 'v-password-toggle',
          onClick: () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.textContent = isPassword ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}';
          }
        }, '\u{1F441}\u200D\u{1F5E8}');
        wrapper.appendChild(input);
        wrapper.appendChild(toggle);
      } else {
        wrapper.appendChild(input);
      }

      if (props.strength) {
        const meter = dom.create('div', { className: 'v-password-strength' });
        input.addEventListener('input', () => {
          const score = calculatePasswordStrength(input.value);
          meter.dataset.score = score;
          meter.style.setProperty('--strength', `${score * 25}%`);
        });
        wrapper.appendChild(meter);
      }

      return wrapper;
    },
    styles: () => `
      .v-password-input-wrapper {
        position: relative;
        width: 100%;
      }
      .v-password-input {
        width: 100%;
        padding: 0.75rem 3rem 0.75rem 1rem;
        font-size: 1rem;
        border: 1px solid var(--v-border, #e2e8f0);
        border-radius: 0.5rem;
        outline: none;
      }
      .v-password-input:focus {
        border-color: var(--v-primary, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .v-password-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.25rem;
        opacity: 0.6;
      }
      .v-password-toggle:hover { opacity: 1; }
      .v-password-strength {
        height: 4px;
        margin-top: 0.5rem;
        background: var(--v-border, #e2e8f0);
        border-radius: 2px;
        overflow: hidden;
      }
      .v-password-strength::after {
        content: '';
        display: block;
        height: 100%;
        width: var(--strength, 0%);
        background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
        transition: width 0.3s ease;
      }
    `
  },

  // ============================================
  // BUTTON COMPONENTS
  // ============================================
  Button: {
    tag: 'button',
    defaultProps: { variant: 'primary', size: 'medium', disabled: false, loading: false },
    attributes: ['type', 'disabled'],
    render: (props, children) => {
      const btn = dom.create('button', {
        type: props.type || 'button',
        className: `v-button v-button-${props.variant} v-button-${props.size}`,
        disabled: props.disabled || props.loading
      });

      if (props.loading) {
        btn.classList.add('loading');
        btn.innerHTML = '<span class="v-button-spinner"></span>';
      }

      if (props.icon) {
        const icon = dom.create('span', { className: 'v-button-icon' }, props.icon);
        btn.appendChild(icon);
      }

      if (children || props.label) {
        const text = dom.create('span', { className: 'v-button-text' }, children || props.label);
        btn.appendChild(text);
      }

      if (props.onClick) {
        btn.addEventListener('click', props.onClick);
      }

      return btn;
    },
    styles: () => `
      .v-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        white-space: nowrap;
      }
      .v-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .v-button:focus-visible {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }
      .v-button-primary {
        background: var(--v-primary, #3b82f6);
        color: white;
      }
      .v-button-primary:hover:not(:disabled) {
        background: var(--v-primary-hover, #2563eb);
      }
      .v-button-secondary {
        background: var(--v-secondary, #6366f1);
        color: white;
      }
      .v-button-secondary:hover:not(:disabled) {
        background: var(--v-secondary-hover, #4f46e5);
      }
      .v-button-outline {
        background: transparent;
        border: 2px solid var(--v-primary, #3b82f6);
        color: var(--v-primary, #3b82f6);
      }
      .v-button-outline:hover:not(:disabled) {
        background: var(--v-primary, #3b82f6);
        color: white;
      }
      .v-button-ghost {
        background: transparent;
        color: var(--v-text, #1e293b);
      }
      .v-button-ghost:hover:not(:disabled) {
        background: var(--v-surface, rgba(0,0,0,0.05));
      }
      .v-button-danger {
        background: var(--v-error, #ef4444);
        color: white;
      }
      .v-button-danger:hover:not(:disabled) {
        background: var(--v-error-hover, #dc2626);
      }
      .v-button-success {
        background: var(--v-success, #22c55e);
        color: white;
      }
      .v-button-small { padding: 0.5rem 1rem; font-size: 0.875rem; }
      .v-button-large { padding: 1rem 2rem; font-size: 1.125rem; }
      .v-button.loading { pointer-events: none; }
      .v-button-spinner {
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: v-spin 0.8s linear infinite;
      }
      @keyframes v-spin { to { transform: rotate(360deg); } }
    `
  },

  IconButton: {
    tag: 'button',
    defaultProps: { variant: 'ghost', size: 'medium', ariaLabel: '' },
    render: (props) => {
      const btn = dom.create('button', {
        type: 'button',
        className: `v-icon-button v-icon-button-${props.variant} v-icon-button-${props.size}`,
        'aria-label': props.ariaLabel,
        disabled: props.disabled
      });

      if (props.icon) {
        btn.innerHTML = props.icon;
      }

      if (props.onClick) {
        btn.addEventListener('click', props.onClick);
      }

      return btn;
    },
    styles: () => `
      .v-icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .v-icon-button-medium { width: 2.5rem; height: 2.5rem; font-size: 1.25rem; }
      .v-icon-button-small { width: 2rem; height: 2rem; font-size: 1rem; }
      .v-icon-button-large { width: 3rem; height: 3rem; font-size: 1.5rem; }
      .v-icon-button-ghost { background: transparent; color: var(--v-text, #1e293b); }
      .v-icon-button-ghost:hover { background: var(--v-surface, rgba(0,0,0,0.05)); }
      .v-icon-button-primary { background: var(--v-primary, #3b82f6); color: white; }
      .v-icon-button-primary:hover { background: var(--v-primary-hover, #2563eb); }
    `
  },

  LoadingButton: {
    extends: 'Button',
    defaultProps: { loadingText: 'Loading...' },
    render: (props, children) => {
      const btn = dom.create('button', {
        type: props.type || 'button',
        className: `v-button v-loading-button v-button-${props.variant || 'primary'}`,
        disabled: props.disabled || props.loading
      });

      const normalContent = dom.create('span', { className: 'v-btn-content' }, children || props.label);
      const loadingContent = dom.create('span', { className: 'v-btn-loading' },
        dom.create('span', { className: 'v-button-spinner' }),
        props.loadingText
      );

      btn.appendChild(normalContent);
      btn.appendChild(loadingContent);

      if (props.loading) {
        btn.classList.add('loading');
      }

      btn.setLoading = (isLoading) => {
        btn.classList.toggle('loading', isLoading);
        btn.disabled = isLoading;
      };

      if (props.onClick) {
        btn.addEventListener('click', props.onClick);
      }

      return btn;
    },
    styles: () => `
      .v-loading-button .v-btn-loading { display: none; gap: 0.5rem; align-items: center; }
      .v-loading-button.loading .v-btn-content { display: none; }
      .v-loading-button.loading .v-btn-loading { display: inline-flex; }
    `
  },

  // ============================================
  // DISPLAY COMPONENTS
  // ============================================
  Card: {
    tag: 'div',
    defaultProps: { variant: 'elevated', padding: '1.5rem', hoverable: false },
    styles: (props) => `
      .v-card {
        background: var(--v-surface, #fff);
        border-radius: 0.75rem;
        padding: ${props.padding};
        ${props.variant === 'elevated' ? 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);' : ''}
        ${props.variant === 'outlined' ? 'border: 1px solid var(--v-border, #e2e8f0);' : ''}
        ${props.hoverable ? 'transition: transform 0.2s, box-shadow 0.2s;' : ''}
      }
      ${props.hoverable ? `
        .v-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
        }
      ` : ''}
    `
  },

  Badge: {
    tag: 'span',
    defaultProps: { variant: 'primary', size: 'medium', rounded: true },
    render: (props, children) => {
      return dom.create('span', {
        className: `v-badge v-badge-${props.variant} v-badge-${props.size} ${props.rounded ? 'rounded' : ''}`
      }, children || props.label);
    },
    styles: () => `
      .v-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 0.25rem;
      }
      .v-badge.rounded { border-radius: 9999px; }
      .v-badge-primary { background: var(--v-primary, #3b82f6); color: white; }
      .v-badge-secondary { background: var(--v-secondary, #6366f1); color: white; }
      .v-badge-success { background: var(--v-success, #22c55e); color: white; }
      .v-badge-warning { background: var(--v-warning, #f59e0b); color: white; }
      .v-badge-error { background: var(--v-error, #ef4444); color: white; }
      .v-badge-outline { background: transparent; border: 1px solid currentColor; }
      .v-badge-small { padding: 0.125rem 0.5rem; font-size: 0.625rem; }
      .v-badge-large { padding: 0.375rem 1rem; font-size: 0.875rem; }
    `
  },

  Avatar: {
    tag: 'div',
    defaultProps: { size: '40px', src: '', alt: '', fallback: '', status: null },
    render: (props) => {
      const avatar = dom.create('div', {
        className: 'v-avatar',
        style: { width: props.size, height: props.size }
      });

      if (props.src) {
        const img = dom.create('img', {
          src: props.src,
          alt: props.alt || '',
          className: 'v-avatar-image'
        });
        img.onerror = () => {
          img.remove();
          avatar.appendChild(createFallback(props.fallback || props.alt));
        };
        avatar.appendChild(img);
      } else {
        avatar.appendChild(createFallback(props.fallback || props.alt));
      }

      if (props.status) {
        const statusDot = dom.create('span', {
          className: `v-avatar-status v-avatar-status-${props.status}`
        });
        avatar.appendChild(statusDot);
      }

      function createFallback(text) {
        const initials = text ? text.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
        return dom.create('span', { className: 'v-avatar-fallback' }, initials);
      }

      return avatar;
    },
    styles: () => `
      .v-avatar {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--v-surface, #e2e8f0);
        overflow: hidden;
      }
      .v-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .v-avatar-fallback {
        font-weight: 600;
        color: var(--v-text-muted, #64748b);
        font-size: 0.4em;
      }
      .v-avatar-status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25%;
        height: 25%;
        min-width: 8px;
        min-height: 8px;
        border-radius: 50%;
        border: 2px solid var(--v-background, #fff);
      }
      .v-avatar-status-online { background: var(--v-success, #22c55e); }
      .v-avatar-status-offline { background: var(--v-text-muted, #94a3b8); }
      .v-avatar-status-busy { background: var(--v-error, #ef4444); }
      .v-avatar-status-away { background: var(--v-warning, #f59e0b); }
    `
  },

  // ============================================
  // FEEDBACK COMPONENTS
  // ============================================
  Alert: {
    tag: 'div',
    defaultProps: { variant: 'info', dismissible: false, icon: true },
    render: (props, children) => {
      const alert = dom.create('div', {
        className: `v-alert v-alert-${props.variant}`,
        role: 'alert'
      });

      if (props.icon) {
        const icons = {
          info: '\u2139\uFE0F',
          success: '\u2705',
          warning: '\u26A0\uFE0F',
          error: '\u274C'
        };
        const iconEl = dom.create('span', { className: 'v-alert-icon' }, icons[props.variant] || icons.info);
        alert.appendChild(iconEl);
      }

      const content = dom.create('div', { className: 'v-alert-content' });
      if (props.title) {
        content.appendChild(dom.create('div', { className: 'v-alert-title' }, props.title));
      }
      content.appendChild(dom.create('div', { className: 'v-alert-message' }, children || props.message));
      alert.appendChild(content);

      if (props.dismissible) {
        const close = dom.create('button', {
          className: 'v-alert-close',
          'aria-label': 'Dismiss',
          onClick: () => {
            alert.classList.add('dismissed');
            setTimeout(() => alert.remove(), 300);
          }
        }, '\u00D7');
        alert.appendChild(close);
      }

      return alert;
    },
    styles: () => `
      .v-alert {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.5rem;
        transition: opacity 0.3s, transform 0.3s;
      }
      .v-alert.dismissed { opacity: 0; transform: translateY(-10px); }
      .v-alert-info { background: #dbeafe; border: 1px solid #93c5fd; color: #1e40af; }
      .v-alert-success { background: #dcfce7; border: 1px solid #86efac; color: #166534; }
      .v-alert-warning { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
      .v-alert-error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
      .v-alert-icon { font-size: 1.25rem; flex-shrink: 0; }
      .v-alert-content { flex: 1; }
      .v-alert-title { font-weight: 600; margin-bottom: 0.25rem; }
      .v-alert-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.6;
        line-height: 1;
      }
      .v-alert-close:hover { opacity: 1; }
    `
  },

  Toast: {
    tag: 'div',
    defaultProps: { variant: 'info', duration: 5000, position: 'top-right' },
    render: (props, children) => {
      const toast = dom.create('div', {
        className: `v-toast v-toast-${props.variant}`
      });

      const content = dom.create('div', { className: 'v-toast-content' }, children || props.message);
      toast.appendChild(content);

      if (props.action) {
        const action = dom.create('button', {
          className: 'v-toast-action',
          onClick: props.action.onClick
        }, props.action.label);
        toast.appendChild(action);
      }

      const close = dom.create('button', {
        className: 'v-toast-close',
        onClick: () => dismissToast(toast)
      }, '\u00D7');
      toast.appendChild(close);

      if (props.duration > 0) {
        const progress = dom.create('div', { className: 'v-toast-progress' });
        progress.style.animationDuration = `${props.duration}ms`;
        toast.appendChild(progress);
        setTimeout(() => dismissToast(toast), props.duration);
      }

      function dismissToast(el) {
        el.classList.add('dismissed');
        setTimeout(() => el.remove(), 300);
      }

      return toast;
    },
    styles: () => `
      .v-toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--v-surface, #fff);
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
        animation: v-toast-in 0.3s ease;
      }
      .v-toast.dismissed { animation: v-toast-out 0.3s ease forwards; }
      @keyframes v-toast-in { from { opacity: 0; transform: translateY(-10px); } }
      @keyframes v-toast-out { to { opacity: 0; transform: translateX(100%); } }
      .v-toast-info { border-left: 4px solid var(--v-primary, #3b82f6); }
      .v-toast-success { border-left: 4px solid var(--v-success, #22c55e); }
      .v-toast-warning { border-left: 4px solid var(--v-warning, #f59e0b); }
      .v-toast-error { border-left: 4px solid var(--v-error, #ef4444); }
      .v-toast-content { flex: 1; }
      .v-toast-action {
        background: none;
        border: none;
        color: var(--v-primary, #3b82f6);
        font-weight: 600;
        cursor: pointer;
      }
      .v-toast-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        opacity: 0.6;
        cursor: pointer;
      }
      .v-toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        opacity: 0.3;
        animation: v-toast-progress linear forwards;
      }
      @keyframes v-toast-progress { from { width: 100%; } to { width: 0; } }
    `
  },

  Modal: {
    tag: 'div',
    defaultProps: { size: 'medium', closeable: true, backdrop: true },
    render: (props, children) => {
      const modal = dom.create('div', {
        className: 'v-modal-overlay',
        role: 'dialog',
        'aria-modal': 'true'
      });

      if (props.backdrop) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal && props.closeable) {
            closeModal(modal);
          }
        });
      }

      const dialog = dom.create('div', {
        className: `v-modal v-modal-${props.size}`
      });

      if (props.title || props.closeable) {
        const header = dom.create('div', { className: 'v-modal-header' });
        if (props.title) {
          header.appendChild(dom.create('h2', { className: 'v-modal-title' }, props.title));
        }
        if (props.closeable) {
          const close = dom.create('button', {
            className: 'v-modal-close',
            'aria-label': 'Close',
            onClick: () => closeModal(modal)
          }, '\u00D7');
          header.appendChild(close);
        }
        dialog.appendChild(header);
      }

      const body = dom.create('div', { className: 'v-modal-body' }, children);
      dialog.appendChild(body);

      if (props.footer) {
        const footer = dom.create('div', { className: 'v-modal-footer' }, props.footer);
        dialog.appendChild(footer);
      }

      modal.appendChild(dialog);

      function closeModal(el) {
        el.classList.add('closing');
        setTimeout(() => el.remove(), 300);
        if (props.onClose) props.onClose();
      }

      modal.close = () => closeModal(modal);

      return modal;
    },
    styles: () => `
      .v-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 1000;
        animation: v-modal-fade-in 0.2s ease;
      }
      .v-modal-overlay.closing { animation: v-modal-fade-out 0.2s ease forwards; }
      @keyframes v-modal-fade-in { from { opacity: 0; } }
      @keyframes v-modal-fade-out { to { opacity: 0; } }
      .v-modal {
        background: var(--v-background, #fff);
        border-radius: 0.75rem;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        max-height: calc(100vh - 2rem);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: v-modal-slide-in 0.2s ease;
      }
      .v-modal-overlay.closing .v-modal { animation: v-modal-slide-out 0.2s ease forwards; }
      @keyframes v-modal-slide-in { from { transform: translateY(-20px); opacity: 0; } }
      @keyframes v-modal-slide-out { to { transform: translateY(-20px); opacity: 0; } }
      .v-modal-small { width: 100%; max-width: 400px; }
      .v-modal-medium { width: 100%; max-width: 600px; }
      .v-modal-large { width: 100%; max-width: 800px; }
      .v-modal-fullscreen { width: 100%; height: 100%; max-width: none; border-radius: 0; }
      .v-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--v-border, #e2e8f0);
      }
      .v-modal-title { margin: 0; font-size: 1.25rem; font-weight: 600; }
      .v-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.6;
        line-height: 1;
      }
      .v-modal-close:hover { opacity: 1; }
      .v-modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
      .v-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--v-border, #e2e8f0);
      }
    `
  },

  Spinner: {
    tag: 'div',
    defaultProps: { size: '40px', color: 'primary', variant: 'circle' },
    render: (props) => {
      const spinner = dom.create('div', {
        className: `v-spinner v-spinner-${props.variant}`,
        style: {
          width: props.size,
          height: props.size,
          '--spinner-color': props.color === 'primary' ? 'var(--v-primary, #3b82f6)' : props.color
        },
        role: 'status',
        'aria-label': 'Loading'
      });

      if (props.variant === 'dots') {
        for (let i = 0; i < 3; i++) {
          spinner.appendChild(dom.create('span', { className: 'v-spinner-dot' }));
        }
      }

      return spinner;
    },
    styles: () => `
      .v-spinner {
        display: inline-block;
      }
      .v-spinner-circle {
        border: 3px solid var(--v-border, #e2e8f0);
        border-top-color: var(--spinner-color);
        border-radius: 50%;
        animation: v-spin 0.8s linear infinite;
      }
      .v-spinner-dots {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
      }
      .v-spinner-dot {
        width: 25%;
        height: 25%;
        background: var(--spinner-color);
        border-radius: 50%;
        animation: v-bounce 1.4s ease-in-out infinite both;
      }
      .v-spinner-dot:nth-child(1) { animation-delay: -0.32s; }
      .v-spinner-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes v-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `
  },

  // ============================================
  // NAVIGATION COMPONENTS
  // ============================================
  Tabs: {
    tag: 'div',
    defaultProps: { variant: 'underline', orientation: 'horizontal' },
    render: (props) => {
      const tabs = dom.create('div', {
        className: `v-tabs v-tabs-${props.variant} v-tabs-${props.orientation}`
      });

      const tabList = dom.create('div', {
        className: 'v-tab-list',
        role: 'tablist'
      });

      const tabPanels = dom.create('div', { className: 'v-tab-panels' });

      let activeIndex = props.defaultIndex || 0;

      (props.tabs || []).forEach((tab, index) => {
        const tabButton = dom.create('button', {
          className: `v-tab ${index === activeIndex ? 'active' : ''}`,
          role: 'tab',
          'aria-selected': index === activeIndex,
          onClick: () => {
            tabList.querySelectorAll('.v-tab').forEach((t, i) => {
              t.classList.toggle('active', i === index);
              t.setAttribute('aria-selected', i === index);
            });
            tabPanels.querySelectorAll('.v-tab-panel').forEach((p, i) => {
              p.classList.toggle('active', i === index);
            });
            if (props.onChange) props.onChange(index);
          }
        }, tab.label);

        if (tab.icon) {
          tabButton.insertBefore(dom.create('span', { className: 'v-tab-icon' }, tab.icon), tabButton.firstChild);
        }

        tabList.appendChild(tabButton);

        const panel = dom.create('div', {
          className: `v-tab-panel ${index === activeIndex ? 'active' : ''}`,
          role: 'tabpanel'
        }, tab.content);
        tabPanels.appendChild(panel);
      });

      tabs.appendChild(tabList);
      tabs.appendChild(tabPanels);

      return tabs;
    },
    styles: () => `
      .v-tabs { display: flex; flex-direction: column; }
      .v-tabs-vertical { flex-direction: row; }
      .v-tab-list {
        display: flex;
        gap: 0.25rem;
        border-bottom: 1px solid var(--v-border, #e2e8f0);
      }
      .v-tabs-vertical .v-tab-list {
        flex-direction: column;
        border-bottom: none;
        border-right: 1px solid var(--v-border, #e2e8f0);
      }
      .v-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--v-text-muted, #64748b);
        font-size: 0.875rem;
        font-weight: 500;
        transition: color 0.2s;
        position: relative;
      }
      .v-tab:hover { color: var(--v-text, #1e293b); }
      .v-tab.active { color: var(--v-primary, #3b82f6); }
      .v-tabs-underline .v-tab::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--v-primary, #3b82f6);
        transform: scaleX(0);
        transition: transform 0.2s;
      }
      .v-tabs-underline .v-tab.active::after { transform: scaleX(1); }
      .v-tabs-pills .v-tab { border-radius: 0.5rem; }
      .v-tabs-pills .v-tab.active { background: var(--v-primary, #3b82f6); color: white; }
      .v-tab-panels { padding: 1rem 0; flex: 1; }
      .v-tab-panel { display: none; }
      .v-tab-panel.active { display: block; animation: v-tab-fade 0.2s ease; }
      @keyframes v-tab-fade { from { opacity: 0; } }
    `
  },

  Breadcrumb: {
    tag: 'nav',
    defaultProps: { separator: '/' },
    render: (props) => {
      const nav = dom.create('nav', {
        className: 'v-breadcrumb',
        'aria-label': 'Breadcrumb'
      });

      const list = dom.create('ol', { className: 'v-breadcrumb-list' });

      (props.items || []).forEach((item, index, arr) => {
        const li = dom.create('li', { className: 'v-breadcrumb-item' });

        if (index === arr.length - 1) {
          li.appendChild(dom.create('span', {
            className: 'v-breadcrumb-current',
            'aria-current': 'page'
          }, item.label));
        } else {
          li.appendChild(dom.create('a', {
            className: 'v-breadcrumb-link',
            href: item.href || '#'
          }, item.label));
          li.appendChild(dom.create('span', {
            className: 'v-breadcrumb-separator',
            'aria-hidden': 'true'
          }, props.separator));
        }

        list.appendChild(li);
      });

      nav.appendChild(list);
      return nav;
    },
    styles: () => `
      .v-breadcrumb-list {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.875rem;
      }
      .v-breadcrumb-item { display: flex; align-items: center; gap: 0.5rem; }
      .v-breadcrumb-link {
        color: var(--v-text-muted, #64748b);
        text-decoration: none;
      }
      .v-breadcrumb-link:hover {
        color: var(--v-primary, #3b82f6);
        text-decoration: underline;
      }
      .v-breadcrumb-separator { color: var(--v-text-muted, #94a3b8); }
      .v-breadcrumb-current {
        color: var(--v-text, #1e293b);
        font-weight: 500;
      }
    `
  },

  // ============================================
  // DATA DISPLAY COMPONENTS
  // ============================================
  DataTable: {
    tag: 'div',
    defaultProps: {
      columns: [],
      data: [],
      sortable: true,
      filterable: true,
      paginate: true,
      pageSize: 10,
      selectable: false
    },
    render: (props) => {
      const wrapper = dom.create('div', { className: 'v-datatable' });

      // Toolbar
      if (props.filterable || props.toolbar) {
        const toolbar = dom.create('div', { className: 'v-datatable-toolbar' });

        if (props.filterable) {
          const search = dom.create('input', {
            type: 'search',
            className: 'v-datatable-search',
            placeholder: 'Search...'
          });
          search.addEventListener('input', () => filterTable(search.value));
          toolbar.appendChild(search);
        }

        wrapper.appendChild(toolbar);
      }

      // Table
      const table = dom.create('table', { className: 'v-datatable-table' });

      // Header
      const thead = dom.create('thead');
      const headerRow = dom.create('tr');

      if (props.selectable) {
        const th = dom.create('th', { className: 'v-datatable-checkbox' });
        const checkbox = dom.create('input', { type: 'checkbox' });
        checkbox.addEventListener('change', () => toggleAll(checkbox.checked));
        th.appendChild(checkbox);
        headerRow.appendChild(th);
      }

      props.columns.forEach(col => {
        const th = dom.create('th', {
          className: props.sortable && col.sortable !== false ? 'sortable' : ''
        });
        th.textContent = col.header || col.key;

        if (props.sortable && col.sortable !== false) {
          th.addEventListener('click', () => sortColumn(col.key));
          th.appendChild(dom.create('span', { className: 'v-sort-indicator' }));
        }

        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body
      const tbody = dom.create('tbody');
      table.appendChild(tbody);

      wrapper.appendChild(table);

      // Pagination
      if (props.paginate) {
        const pagination = dom.create('div', { className: 'v-datatable-pagination' });
        wrapper.appendChild(pagination);
      }

      // State
      let currentData = [...props.data];
      let currentPage = 1;
      let sortKey = null;
      let sortDir = 'asc';
      let selected = new Set();

      function renderBody() {
        dom.empty(tbody);

        const start = props.paginate ? (currentPage - 1) * props.pageSize : 0;
        const end = props.paginate ? start + props.pageSize : currentData.length;
        const pageData = currentData.slice(start, end);

        pageData.forEach((row, rowIndex) => {
          const tr = dom.create('tr', {
            className: selected.has(start + rowIndex) ? 'selected' : ''
          });

          if (props.selectable) {
            const td = dom.create('td', { className: 'v-datatable-checkbox' });
            const checkbox = dom.create('input', {
              type: 'checkbox',
              checked: selected.has(start + rowIndex)
            });
            checkbox.addEventListener('change', () => {
              if (checkbox.checked) {
                selected.add(start + rowIndex);
              } else {
                selected.delete(start + rowIndex);
              }
              tr.classList.toggle('selected', checkbox.checked);
              if (props.onSelectionChange) {
                props.onSelectionChange(Array.from(selected).map(i => props.data[i]));
              }
            });
            td.appendChild(checkbox);
            tr.appendChild(td);
          }

          props.columns.forEach(col => {
            const td = dom.create('td');
            const value = row[col.key];

            if (col.render) {
              const rendered = col.render(value, row);
              if (rendered instanceof Node) {
                td.appendChild(rendered);
              } else {
                td.textContent = rendered;
              }
            } else {
              td.textContent = value ?? '';
            }

            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });

        renderPagination();
      }

      function renderPagination() {
        if (!props.paginate) return;

        const pagination = wrapper.querySelector('.v-datatable-pagination');
        dom.empty(pagination);

        const totalPages = Math.ceil(currentData.length / props.pageSize);

        pagination.appendChild(dom.create('span', { className: 'v-datatable-info' },
          `Showing ${Math.min((currentPage - 1) * props.pageSize + 1, currentData.length)} - ${Math.min(currentPage * props.pageSize, currentData.length)} of ${currentData.length}`
        ));

        const nav = dom.create('div', { className: 'v-datatable-nav' });

        const prevBtn = dom.create('button', {
          disabled: currentPage === 1,
          onClick: () => { currentPage--; renderBody(); }
        }, '\u2039 Prev');

        const pageInfo = dom.create('span', {}, `Page ${currentPage} of ${totalPages}`);

        const nextBtn = dom.create('button', {
          disabled: currentPage === totalPages,
          onClick: () => { currentPage++; renderBody(); }
        }, 'Next \u203A');

        nav.append(prevBtn, pageInfo, nextBtn);
        pagination.appendChild(nav);
      }

      function sortColumn(key) {
        if (sortKey === key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = key;
          sortDir = 'asc';
        }

        currentData.sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortDir === 'asc' ? cmp : -cmp;
        });

        // Update sort indicators
        wrapper.querySelectorAll('th.sortable').forEach(th => {
          th.classList.remove('sort-asc', 'sort-desc');
        });
        const activeHeader = wrapper.querySelector(`th.sortable:nth-child(${props.columns.findIndex(c => c.key === key) + (props.selectable ? 2 : 1)})`);
        if (activeHeader) {
          activeHeader.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }

        currentPage = 1;
        renderBody();
      }

      function filterTable(query) {
        const lower = query.toLowerCase();
        currentData = props.data.filter(row =>
          props.columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(lower))
        );
        currentPage = 1;
        renderBody();
      }

      function toggleAll(checked) {
        if (checked) {
          currentData.forEach((_, i) => selected.add(i));
        } else {
          selected.clear();
        }
        renderBody();
        if (props.onSelectionChange) {
          props.onSelectionChange(checked ? [...currentData] : []);
        }
      }

      // Initial render
      renderBody();

      // API
      wrapper.refresh = () => {
        currentData = [...props.data];
        renderBody();
      };

      wrapper.setData = (data) => {
        props.data = data;
        currentData = [...data];
        renderBody();
      };

      return wrapper;
    },
    styles: () => `
      .v-datatable {
        background: var(--v-surface, #fff);
        border: 1px solid var(--v-border, #e2e8f0);
        border-radius: 0.5rem;
        overflow: hidden;
      }
      .v-datatable-toolbar {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--v-border, #e2e8f0);
      }
      .v-datatable-search {
        padding: 0.5rem 1rem;
        border: 1px solid var(--v-border, #e2e8f0);
        border-radius: 0.375rem;
        outline: none;
        min-width: 200px;
      }
      .v-datatable-search:focus { border-color: var(--v-primary, #3b82f6); }
      .v-datatable-table {
        width: 100%;
        border-collapse: collapse;
      }
      .v-datatable-table th,
      .v-datatable-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--v-border, #e2e8f0);
      }
      .v-datatable-table th {
        background: var(--v-surface, #f8fafc);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--v-text-muted, #64748b);
      }
      .v-datatable-table th.sortable { cursor: pointer; user-select: none; }
      .v-datatable-table th.sortable:hover { background: var(--v-border, #e2e8f0); }
      .v-sort-indicator::after { content: ' \u2195'; opacity: 0.5; }
      .v-datatable-table th.sort-asc .v-sort-indicator::after { content: ' \u2191'; opacity: 1; }
      .v-datatable-table th.sort-desc .v-sort-indicator::after { content: ' \u2193'; opacity: 1; }
      .v-datatable-table tr:hover { background: var(--v-surface, rgba(0,0,0,0.02)); }
      .v-datatable-table tr.selected { background: rgba(59, 130, 246, 0.1); }
      .v-datatable-checkbox { width: 40px; text-align: center; }
      .v-datatable-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--v-border, #e2e8f0);
        font-size: 0.875rem;
        color: var(--v-text-muted, #64748b);
      }
      .v-datatable-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .v-datatable-nav button {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--v-border, #e2e8f0);
        background: var(--v-surface, #fff);
        border-radius: 0.375rem;
        cursor: pointer;
      }
      .v-datatable-nav button:disabled { opacity: 0.5; cursor: not-allowed; }
      .v-datatable-nav button:hover:not(:disabled) { background: var(--v-border, #e2e8f0); }
    `
  }
};

// ============================================
// COMPONENT FACTORY
// ============================================

/**
 * Generate a component factory function from a template
 */
function createComponentFactory(name, template) {
  const factory = (props = {}, ...children) => {
    const mergedProps = { ...template.defaultProps, ...props };

    // Inject styles
    if (template.styles) {
      const styleId = `v-${name.toLowerCase()}`;
      const css = typeof template.styles === 'function'
        ? template.styles(mergedProps)
        : template.styles;
      injectStyle(styleId, css);
    }

    // Custom render function
    if (template.render) {
      const element = template.render(mergedProps, children.flat());
      element._verenaComponent = name;
      element._verenaProps = mergedProps;
      return element;
    }

    // Default render
    const element = dom.create(template.tag || 'div', {
      className: `v-${name.toLowerCase()} ${mergedProps.className || ''}`
    });

    // Apply attributes
    if (template.attributes) {
      template.attributes.forEach(attr => {
        if (mergedProps[attr] !== undefined) {
          element.setAttribute(attr, mergedProps[attr]);
        }
      });
    }

    // Add children
    children.flat().forEach(child => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (child != null) {
        element.appendChild(document.createTextNode(String(child)));
      }
    });

    element._verenaComponent = name;
    element._verenaProps = mergedProps;

    return element;
  };

  // Register the component
  registerComponent(name, factory, {
    category: template.category || 'general',
    version: '2.0.0'
  });

  return factory;
}

/**
 * Generate placeholder components for categories not yet fully implemented
 */
function createPlaceholderComponent(name, category) {
  return (props = {}) => {
    const el = dom.create('div', {
      className: `v-${name.toLowerCase()} v-placeholder`,
      style: {
        padding: '1rem',
        border: '2px dashed var(--v-border, #e2e8f0)',
        borderRadius: '0.5rem',
        textAlign: 'center',
        color: 'var(--v-text-muted, #64748b)'
      }
    });

    el.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${name}</div>
      <div style="font-size: 0.875rem;">Category: ${category}</div>
      <div style="font-size: 0.75rem; margin-top: 0.5rem;">Component ready for customization</div>
    `;

    el._verenaComponent = name;
    el._verenaProps = props;

    return el;
  };
}

// ============================================
// GENERATE ALL COMPONENTS
// ============================================

const generatedComponents = {};

// Generate components from templates
Object.entries(COMPONENT_TEMPLATES).forEach(([name, template]) => {
  generatedComponents[`create${name}`] = createComponentFactory(name, template);
});

// Generate placeholder components for all others
Object.entries(COMPONENT_CATEGORIES).forEach(([categoryKey, category]) => {
  category.components.forEach(componentName => {
    const factoryName = `create${componentName.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (!generatedComponents[factoryName]) {
      generatedComponents[factoryName] = createPlaceholderComponent(componentName, categoryKey);
      registerComponent(componentName, generatedComponents[factoryName], {
        category: categoryKey,
        version: '2.0.0'
      });
    }
  });
});

// Helper functions
function calculatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

// Export all generated components
export default generatedComponents;
export { createComponentFactory, createPlaceholderComponent, COMPONENT_TEMPLATES };
