/**
 * verenajs Core Runtime
 * Central engine for component registration, state management, and platform abstraction
 */

const VERSION = '2.0.0';

// Component Registry - Central store for all components
const componentRegistry = new Map();
const componentMeta = new Map();

// Event Bus - Framework-wide event system
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }
}

// Global State Store - Reactive state management
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = new Set();
    this.middleware = [];
  }

  getState() {
    return this.state;
  }

  setState(partial) {
    const prev = this.state;
    const next = typeof partial === 'function' ? partial(prev) : { ...prev, ...partial };

    // Run middleware
    for (const mw of this.middleware) {
      mw(prev, next);
    }

    this.state = next;
    this.notify(prev, next);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(prev, next) {
    this.subscribers.forEach(cb => cb(next, prev));
  }

  use(middleware) {
    this.middleware.push(middleware);
  }
}

// Platform Detection
const Platform = {
  isWeb: typeof window !== 'undefined' && typeof document !== 'undefined',
  isNode: typeof process !== 'undefined' && process.versions?.node,
  isElectron: typeof process !== 'undefined' && process.versions?.electron,
  isCapacitor: typeof window !== 'undefined' && window.Capacitor,
  isQt: false, // Set by Qt bridge

  get current() {
    if (this.isQt) return 'qt';
    if (this.isElectron) return 'electron';
    if (this.isCapacitor) return 'capacitor';
    if (this.isWeb) return 'web';
    if (this.isNode) return 'node';
    return 'unknown';
  }
};

// Component Registration
function registerComponent(name, factory, meta = {}) {
  componentRegistry.set(name, factory);
  componentMeta.set(name, {
    name,
    version: meta.version || '1.0.0',
    category: meta.category || 'general',
    props: meta.props || {},
    registeredAt: Date.now(),
    ...meta
  });
  events.emit('component:registered', { name, meta });
}

function getComponent(name) {
  return componentRegistry.get(name);
}

function hasComponent(name) {
  return componentRegistry.has(name);
}

function listComponents() {
  return Array.from(componentRegistry.keys());
}

function getComponentMeta(name) {
  return componentMeta.get(name);
}

// Component Creation Helper
function createElement(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  children.flat(Infinity).forEach(child => {
    if (child == null) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

// Reactive Binding
function reactive(obj) {
  const subscribers = new Map();

  return new Proxy(obj, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      if (subscribers.has(prop)) {
        subscribers.get(prop).forEach(cb => cb(value, oldValue));
      }
      return true;
    },
    subscribe(prop, callback) {
      if (!subscribers.has(prop)) {
        subscribers.set(prop, new Set());
      }
      subscribers.get(prop).add(callback);
      return () => subscribers.get(prop).delete(callback);
    }
  });
}

// DOM Utilities
const dom = {
  query: (selector, context = document) => context.querySelector(selector),
  queryAll: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
  create: createElement,
  remove: (el) => el?.parentNode?.removeChild(el),
  empty: (el) => { while (el.firstChild) el.removeChild(el.firstChild); },
  append: (parent, ...children) => children.forEach(c => parent.appendChild(c)),
  prepend: (parent, child) => parent.insertBefore(child, parent.firstChild),
  after: (ref, el) => ref.parentNode.insertBefore(el, ref.nextSibling),
  before: (ref, el) => ref.parentNode.insertBefore(el, ref),
  addClass: (el, ...classes) => el.classList.add(...classes),
  removeClass: (el, ...classes) => el.classList.remove(...classes),
  toggleClass: (el, cls, force) => el.classList.toggle(cls, force),
  hasClass: (el, cls) => el.classList.contains(cls),
  attr: (el, name, value) => value === undefined ? el.getAttribute(name) : el.setAttribute(name, value),
  data: (el, key, value) => value === undefined ? el.dataset[key] : (el.dataset[key] = value),
  css: (el, prop, value) => {
    if (typeof prop === 'object') {
      Object.assign(el.style, prop);
    } else if (value === undefined) {
      return getComputedStyle(el)[prop];
    } else {
      el.style[prop] = value;
    }
  },
  on: (el, event, handler, options) => {
    el.addEventListener(event, handler, options);
    return () => el.removeEventListener(event, handler, options);
  },
  off: (el, event, handler) => el.removeEventListener(event, handler),
  ready: (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
};

// Style Injection
const injectedStyles = new Set();
function injectStyle(id, css) {
  if (injectedStyles.has(id)) return;
  const style = document.createElement('style');
  style.id = `verena-style-${id}`;
  style.textContent = css;
  document.head.appendChild(style);
  injectedStyles.add(id);
}

// Theme System
const theme = {
  current: 'light',
  tokens: {
    light: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#818cf8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155'
    }
  },
  get(token) {
    return this.tokens[this.current]?.[token] || this.tokens.light[token];
  },
  set(themeName) {
    this.current = themeName;
    events.emit('theme:change', themeName);
    if (Platform.isWeb) {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  },
  extend(themeName, tokens) {
    this.tokens[themeName] = { ...this.tokens.light, ...tokens };
  }
};

// Plugin System
const plugins = new Map();
function usePlugin(plugin) {
  if (plugins.has(plugin.name)) return;
  plugins.set(plugin.name, plugin);
  if (typeof plugin.install === 'function') {
    plugin.install(verena);
  }
  events.emit('plugin:installed', plugin.name);
}

// Global instances
const events = new EventBus();
const store = new Store();

// Core API
const verena = {
  VERSION,
  Platform,

  // Component System
  register: registerComponent,
  get: getComponent,
  has: hasComponent,
  list: listComponents,
  meta: getComponentMeta,

  // DOM Utilities
  createElement,
  dom,

  // Reactivity
  reactive,

  // State Management
  store,
  events,

  // Theming
  theme,
  injectStyle,

  // Plugins
  use: usePlugin,
  plugins,

  // Component Registry (direct access)
  components: componentRegistry
};

// Auto-detect and set theme based on system preference
if (Platform.isWeb && window.matchMedia) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  theme.current = prefersDark.matches ? 'dark' : 'light';
  prefersDark.addEventListener('change', (e) => theme.set(e.matches ? 'dark' : 'light'));
}

export {
  verena as default,
  VERSION,
  Platform,
  EventBus,
  Store,
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  getComponentMeta,
  createElement,
  reactive,
  dom,
  theme,
  injectStyle,
  events,
  store,
  usePlugin,
  componentRegistry
};
