/**
 * verenajs Plugin Manager
 * Extensible plugin system for the Visual Builder and Framework
 *
 * Features:
 * - Plugin discovery and installation
 * - Dependency management
 * - Lifecycle hooks
 * - Configuration management
 * - Hot reloading
 * - Plugin marketplace integration
 *
 * @version 2.0.0
 */

import { events, store, registerComponent } from './core.js';

// ============================================
// PLUGIN SYSTEM CONSTANTS
// ============================================

const PLUGIN_STATES = {
  INSTALLED: 'installed',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ERROR: 'error',
  UPDATING: 'updating'
};

const PLUGIN_TYPES = {
  COMPONENT: 'component',      // Adds new components
  THEME: 'theme',              // Theme/styling plugins
  INTEGRATION: 'integration',  // Third-party integrations
  TOOL: 'tool',                // Builder tools
  EXTENSION: 'extension',      // General extensions
  DATA: 'data',                // Data source plugins
  AUTH: 'auth',                // Authentication plugins
  ANALYTICS: 'analytics',      // Analytics plugins
  PAYMENT: 'payment',          // Payment integrations
  COMMUNICATION: 'communication' // Chat/email plugins
};

const HOOK_TYPES = {
  // Lifecycle hooks
  BEFORE_INIT: 'beforeInit',
  AFTER_INIT: 'afterInit',
  BEFORE_DESTROY: 'beforeDestroy',
  AFTER_DESTROY: 'afterDestroy',

  // Builder hooks
  BEFORE_RENDER: 'beforeRender',
  AFTER_RENDER: 'afterRender',
  BEFORE_SAVE: 'beforeSave',
  AFTER_SAVE: 'afterSave',
  BEFORE_EXPORT: 'beforeExport',
  AFTER_EXPORT: 'afterExport',

  // Component hooks
  COMPONENT_CREATE: 'componentCreate',
  COMPONENT_UPDATE: 'componentUpdate',
  COMPONENT_DELETE: 'componentDelete',

  // Data hooks
  BEFORE_FETCH: 'beforeFetch',
  AFTER_FETCH: 'afterFetch',
  BEFORE_SUBMIT: 'beforeSubmit',
  AFTER_SUBMIT: 'afterSubmit'
};

// ============================================
// PLUGIN CLASS
// ============================================

class Plugin {
  constructor(manifest) {
    this.id = manifest.id;
    this.name = manifest.name;
    this.version = manifest.version;
    this.description = manifest.description || '';
    this.author = manifest.author || '';
    this.type = manifest.type || PLUGIN_TYPES.EXTENSION;
    this.dependencies = manifest.dependencies || [];
    this.peerDependencies = manifest.peerDependencies || [];
    this.config = manifest.config || {};
    this.permissions = manifest.permissions || [];
    this.icon = manifest.icon || '';
    this.homepage = manifest.homepage || '';
    this.repository = manifest.repository || '';
    this.license = manifest.license || 'MIT';

    this.state = PLUGIN_STATES.INSTALLED;
    this.instance = null;
    this.error = null;
    this.installedAt = Date.now();
    this.activatedAt = null;

    // Plugin implementation
    this.install = manifest.install || (() => {});
    this.activate = manifest.activate || (() => {});
    this.deactivate = manifest.deactivate || (() => {});
    this.uninstall = manifest.uninstall || (() => {});
    this.configure = manifest.configure || (() => {});
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      type: this.type,
      state: this.state,
      config: this.config,
      installedAt: this.installedAt,
      activatedAt: this.activatedAt,
      error: this.error
    };
  }
}

// ============================================
// PLUGIN MANAGER
// ============================================

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.api = this.createPluginAPI();
    this.settings = {
      autoActivate: true,
      allowRemote: true,
      trustedSources: ['https://plugins.verenajs.com'],
      maxPlugins: 100
    };

    // Initialize hook registries
    Object.values(HOOK_TYPES).forEach(hook => {
      this.hooks.set(hook, new Set());
    });
  }

  // Create API available to plugins
  createPluginAPI() {
    return {
      // Component registration
      registerComponent: (name, factory, meta) => {
        registerComponent(name, factory, meta);
        events.emit('plugin:component-registered', { name, meta });
      },

      // Event system
      on: (event, handler) => events.on(event, handler),
      off: (event, handler) => events.off(event, handler),
      emit: (event, data) => events.emit(event, data),

      // Store access
      getState: () => store.getState(),
      setState: (partial) => store.setState(partial),
      subscribe: (callback) => store.subscribe(callback),

      // Hook system
      addHook: (type, handler) => this.addHook(type, handler),
      removeHook: (type, handler) => this.removeHook(type, handler),

      // UI extension points
      addToolbarButton: (config) => this.addToolbarButton(config),
      addPanelTab: (config) => this.addPanelTab(config),
      addContextMenuItem: (config) => this.addContextMenuItem(config),
      addKeyboardShortcut: (config) => this.addKeyboardShortcut(config),

      // Data
      registerDataSource: (id, config) => this.registerDataSource(id, config),

      // Utilities
      log: (message, level = 'info') => this.log(message, level),
      showNotification: (config) => this.showNotification(config),
      openModal: (config) => this.openModal(config)
    };
  }

  // ============================================
  // PLUGIN LIFECYCLE
  // ============================================

  // Install plugin
  async install(manifest, options = {}) {
    if (this.plugins.size >= this.settings.maxPlugins) {
      throw new Error('Maximum number of plugins reached');
    }

    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already installed`);
    }

    // Check dependencies
    await this.checkDependencies(manifest);

    // Create plugin instance
    const plugin = new Plugin(manifest);

    // Run install hook
    try {
      await this.runHook(HOOK_TYPES.BEFORE_INIT, { plugin });
      await plugin.install(this.api);
      this.plugins.set(plugin.id, plugin);
      await this.runHook(HOOK_TYPES.AFTER_INIT, { plugin });

      events.emit('plugin:installed', plugin.toJSON());

      // Auto-activate if enabled
      if (this.settings.autoActivate && !options.noActivate) {
        await this.activate(plugin.id);
      }

      return plugin;

    } catch (error) {
      plugin.state = PLUGIN_STATES.ERROR;
      plugin.error = error.message;
      events.emit('plugin:install-error', { plugin: plugin.toJSON(), error: error.message });
      throw error;
    }
  }

  // Activate plugin
  async activate(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.state === PLUGIN_STATES.ACTIVE) {
      return plugin;
    }

    try {
      plugin.instance = await plugin.activate(this.api);
      plugin.state = PLUGIN_STATES.ACTIVE;
      plugin.activatedAt = Date.now();
      plugin.error = null;

      events.emit('plugin:activated', plugin.toJSON());
      return plugin;

    } catch (error) {
      plugin.state = PLUGIN_STATES.ERROR;
      plugin.error = error.message;
      events.emit('plugin:activate-error', { plugin: plugin.toJSON(), error: error.message });
      throw error;
    }
  }

  // Deactivate plugin
  async deactivate(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.state !== PLUGIN_STATES.ACTIVE) {
      return plugin;
    }

    try {
      await this.runHook(HOOK_TYPES.BEFORE_DESTROY, { plugin });
      await plugin.deactivate(this.api);
      plugin.state = PLUGIN_STATES.DISABLED;
      plugin.instance = null;
      await this.runHook(HOOK_TYPES.AFTER_DESTROY, { plugin });

      events.emit('plugin:deactivated', plugin.toJSON());
      return plugin;

    } catch (error) {
      plugin.state = PLUGIN_STATES.ERROR;
      plugin.error = error.message;
      events.emit('plugin:deactivate-error', { plugin: plugin.toJSON(), error: error.message });
      throw error;
    }
  }

  // Uninstall plugin
  async uninstall(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Deactivate first if active
    if (plugin.state === PLUGIN_STATES.ACTIVE) {
      await this.deactivate(pluginId);
    }

    try {
      await plugin.uninstall(this.api);
      this.plugins.delete(pluginId);

      // Remove all hooks registered by this plugin
      this.removePluginHooks(pluginId);

      events.emit('plugin:uninstalled', { pluginId });

    } catch (error) {
      events.emit('plugin:uninstall-error', { pluginId, error: error.message });
      throw error;
    }
  }

  // Update plugin configuration
  async configure(pluginId, config) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const oldConfig = { ...plugin.config };
    plugin.config = { ...plugin.config, ...config };

    try {
      await plugin.configure(this.api, config);
      events.emit('plugin:configured', { plugin: plugin.toJSON(), oldConfig, newConfig: plugin.config });
    } catch (error) {
      plugin.config = oldConfig;
      throw error;
    }
  }

  // ============================================
  // DEPENDENCY MANAGEMENT
  // ============================================

  async checkDependencies(manifest) {
    for (const dep of manifest.dependencies || []) {
      const [id, version] = dep.split('@');
      const plugin = this.plugins.get(id);

      if (!plugin) {
        throw new Error(`Missing dependency: ${id}`);
      }

      if (version && !this.checkVersion(plugin.version, version)) {
        throw new Error(`Dependency version mismatch: ${id}@${version} required, ${plugin.version} installed`);
      }
    }
  }

  checkVersion(installed, required) {
    // Simple semver check (could be more sophisticated)
    const installedParts = installed.split('.').map(Number);
    const requiredParts = required.replace(/[^0-9.]/g, '').split('.').map(Number);

    for (let i = 0; i < requiredParts.length; i++) {
      if (installedParts[i] < requiredParts[i]) return false;
      if (installedParts[i] > requiredParts[i]) return true;
    }
    return true;
  }

  // ============================================
  // HOOK SYSTEM
  // ============================================

  addHook(type, handler, pluginId = null) {
    if (!this.hooks.has(type)) {
      this.hooks.set(type, new Set());
    }

    const hookEntry = { handler, pluginId };
    this.hooks.get(type).add(hookEntry);

    return () => this.removeHook(type, handler);
  }

  removeHook(type, handler) {
    const hooks = this.hooks.get(type);
    if (hooks) {
      for (const entry of hooks) {
        if (entry.handler === handler) {
          hooks.delete(entry);
          break;
        }
      }
    }
  }

  removePluginHooks(pluginId) {
    for (const [type, hooks] of this.hooks) {
      for (const entry of hooks) {
        if (entry.pluginId === pluginId) {
          hooks.delete(entry);
        }
      }
    }
  }

  async runHook(type, context = {}) {
    const hooks = this.hooks.get(type);
    if (!hooks) return;

    const results = [];
    for (const { handler } of hooks) {
      try {
        const result = await handler(context);
        results.push(result);
      } catch (error) {
        this.log(`Hook error in ${type}: ${error.message}`, 'error');
      }
    }
    return results;
  }

  // ============================================
  // UI EXTENSION POINTS
  // ============================================

  addToolbarButton(config) {
    events.emit('ui:add-toolbar-button', config);
  }

  addPanelTab(config) {
    events.emit('ui:add-panel-tab', config);
  }

  addContextMenuItem(config) {
    events.emit('ui:add-context-menu-item', config);
  }

  addKeyboardShortcut(config) {
    events.emit('ui:add-keyboard-shortcut', config);
  }

  // ============================================
  // DATA EXTENSION
  // ============================================

  registerDataSource(id, config) {
    events.emit('data:register-source', { id, config });
  }

  // ============================================
  // UTILITIES
  // ============================================

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console[level](`[Plugin Manager] ${timestamp}: ${message}`);
    events.emit('plugin:log', { message, level, timestamp });
  }

  showNotification(config) {
    events.emit('ui:show-notification', config);
  }

  openModal(config) {
    events.emit('ui:open-modal', config);
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  get(pluginId) {
    return this.plugins.get(pluginId);
  }

  list(filter = {}) {
    let plugins = Array.from(this.plugins.values());

    if (filter.type) {
      plugins = plugins.filter(p => p.type === filter.type);
    }

    if (filter.state) {
      plugins = plugins.filter(p => p.state === filter.state);
    }

    if (filter.active !== undefined) {
      plugins = plugins.filter(p => (p.state === PLUGIN_STATES.ACTIVE) === filter.active);
    }

    return plugins.map(p => p.toJSON());
  }

  getActive() {
    return this.list({ state: PLUGIN_STATES.ACTIVE });
  }

  isInstalled(pluginId) {
    return this.plugins.has(pluginId);
  }

  isActive(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return plugin && plugin.state === PLUGIN_STATES.ACTIVE;
  }
}

// ============================================
// BUILT-IN PLUGINS
// ============================================

const BuiltInPlugins = {
  // Analytics Plugin
  analytics: {
    id: 'verena-analytics',
    name: 'Analytics',
    version: '1.0.0',
    description: 'Add analytics tracking to your projects',
    type: PLUGIN_TYPES.ANALYTICS,
    icon: '\u{1F4CA}',

    config: {
      provider: 'google', // google, plausible, fathom, custom
      trackingId: '',
      anonymizeIp: true,
      trackClicks: true,
      trackScrollDepth: true
    },

    install(api) {
      api.log('Analytics plugin installed');
    },

    activate(api) {
      const config = this.config;

      // Add tracking script
      if (config.provider === 'google' && config.trackingId) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', config.trackingId, { anonymize_ip: config.anonymizeIp });
      }

      // Track page views
      api.on('router:navigate', (data) => {
        if (window.gtag) {
          window.gtag('event', 'page_view', { page_path: data.path });
        }
      });

      api.log('Analytics plugin activated');
    },

    deactivate(api) {
      api.log('Analytics plugin deactivated');
    }
  },

  // Authentication Plugin
  auth: {
    id: 'verena-auth',
    name: 'Authentication',
    version: '1.0.0',
    description: 'Authentication and user management',
    type: PLUGIN_TYPES.AUTH,
    icon: '\u{1F512}',

    config: {
      providers: ['email', 'google', 'github'],
      sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      requireEmailVerification: true
    },

    install(api) {
      // Register auth components
      api.registerComponent('LoginForm', createLoginForm, { category: 'auth' });
      api.registerComponent('SignupForm', createSignupForm, { category: 'auth' });
      api.registerComponent('ForgotPassword', createForgotPassword, { category: 'auth' });
      api.registerComponent('UserProfile', createUserProfile, { category: 'auth' });
    },

    activate(api) {
      // Initialize auth state
      api.setState({
        auth: {
          user: null,
          isAuthenticated: false,
          loading: true
        }
      });

      // Check for existing session
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Validate token
        api.setState({ auth: { loading: false } });
      }

      api.log('Auth plugin activated');
    },

    deactivate(api) {
      api.log('Auth plugin deactivated');
    }
  },

  // Payments Plugin
  payments: {
    id: 'verena-payments',
    name: 'Payments',
    version: '1.0.0',
    description: 'Stripe and PayPal integration',
    type: PLUGIN_TYPES.PAYMENT,
    icon: '\u{1F4B3}',

    config: {
      stripePublicKey: '',
      paypalClientId: '',
      currency: 'USD'
    },

    install(api) {
      api.registerComponent('PaymentForm', createPaymentForm, { category: 'payments' });
      api.registerComponent('PricingTable', createPricingTable, { category: 'payments' });
      api.registerComponent('CheckoutButton', createCheckoutButton, { category: 'payments' });
    },

    activate(api) {
      const config = this.config;

      // Load Stripe
      if (config.stripePublicKey) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
          window.stripe = Stripe(config.stripePublicKey);
        };
        document.head.appendChild(script);
      }

      api.log('Payments plugin activated');
    },

    deactivate(api) {
      api.log('Payments plugin deactivated');
    }
  },

  // Email Plugin
  email: {
    id: 'verena-email',
    name: 'Email',
    version: '1.0.0',
    description: 'Email templates and sending',
    type: PLUGIN_TYPES.COMMUNICATION,
    icon: '\u{1F4E7}',

    config: {
      provider: 'sendgrid', // sendgrid, mailgun, ses
      apiKey: '',
      fromEmail: '',
      fromName: ''
    },

    install(api) {
      api.registerComponent('EmailComposer', createEmailComposer, { category: 'email' });
      api.registerComponent('NewsletterSignup', createNewsletterSignup, { category: 'email' });
      api.registerComponent('ContactForm', createContactForm, { category: 'email' });
    },

    activate(api) {
      api.log('Email plugin activated');
    },

    deactivate(api) {
      api.log('Email plugin deactivated');
    }
  },

  // Charts Plugin
  charts: {
    id: 'verena-charts',
    name: 'Advanced Charts',
    version: '1.0.0',
    description: 'Interactive data visualization',
    type: PLUGIN_TYPES.COMPONENT,
    icon: '\u{1F4C8}',

    install(api) {
      // Register chart components
      const chartTypes = [
        'LineChart', 'BarChart', 'PieChart', 'DoughnutChart',
        'AreaChart', 'ScatterChart', 'RadarChart', 'PolarChart',
        'BubbleChart', 'CandlestickChart', 'HeatmapChart', 'TreemapChart',
        'SankeyChart', 'FunnelChart', 'GaugeChart', 'SparklineChart'
      ];

      chartTypes.forEach(type => {
        api.registerComponent(type, createGenericChart(type), { category: 'charts' });
      });
    },

    activate(api) {
      api.log('Charts plugin activated');
    },

    deactivate(api) {
      api.log('Charts plugin deactivated');
    }
  },

  // Maps Plugin
  maps: {
    id: 'verena-maps',
    name: 'Maps',
    version: '1.0.0',
    description: 'Interactive maps and geolocation',
    type: PLUGIN_TYPES.COMPONENT,
    icon: '\u{1F5FA}',

    config: {
      provider: 'mapbox', // mapbox, google, leaflet
      apiKey: '',
      defaultCenter: [0, 0],
      defaultZoom: 10
    },

    install(api) {
      api.registerComponent('Map', createMap, { category: 'maps' });
      api.registerComponent('MapMarker', createMapMarker, { category: 'maps' });
      api.registerComponent('MapPolygon', createMapPolygon, { category: 'maps' });
      api.registerComponent('MapRoute', createMapRoute, { category: 'maps' });
      api.registerComponent('StoreLocator', createStoreLocator, { category: 'maps' });
    },

    activate(api) {
      api.log('Maps plugin activated');
    },

    deactivate(api) {
      api.log('Maps plugin deactivated');
    }
  }
};

// Placeholder component factories for built-in plugins
function createLoginForm(props) {
  return document.createElement('div');
}

function createSignupForm(props) {
  return document.createElement('div');
}

function createForgotPassword(props) {
  return document.createElement('div');
}

function createUserProfile(props) {
  return document.createElement('div');
}

function createPaymentForm(props) {
  return document.createElement('div');
}

function createPricingTable(props) {
  return document.createElement('div');
}

function createCheckoutButton(props) {
  return document.createElement('div');
}

function createEmailComposer(props) {
  return document.createElement('div');
}

function createNewsletterSignup(props) {
  return document.createElement('div');
}

function createContactForm(props) {
  return document.createElement('div');
}

function createGenericChart(type) {
  return (props) => document.createElement('div');
}

function createMap(props) {
  return document.createElement('div');
}

function createMapMarker(props) {
  return document.createElement('div');
}

function createMapPolygon(props) {
  return document.createElement('div');
}

function createMapRoute(props) {
  return document.createElement('div');
}

function createStoreLocator(props) {
  return document.createElement('div');
}

// ============================================
// PLUGIN MARKETPLACE
// ============================================

class PluginMarketplace {
  constructor(baseUrl = 'https://plugins.verenajs.com') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async search(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      type: options.type || '',
      sort: options.sort || 'popular',
      page: options.page || 1,
      limit: options.limit || 20
    });

    const response = await fetch(`${this.baseUrl}/api/search?${params}`);
    return response.json();
  }

  async getPlugin(pluginId) {
    if (this.cache.has(pluginId)) {
      return this.cache.get(pluginId);
    }

    const response = await fetch(`${this.baseUrl}/api/plugins/${pluginId}`);
    const plugin = await response.json();
    this.cache.set(pluginId, plugin);
    return plugin;
  }

  async getCategories() {
    const response = await fetch(`${this.baseUrl}/api/categories`);
    return response.json();
  }

  async getFeatured() {
    const response = await fetch(`${this.baseUrl}/api/featured`);
    return response.json();
  }

  async getPopular(limit = 10) {
    const response = await fetch(`${this.baseUrl}/api/popular?limit=${limit}`);
    return response.json();
  }

  async installFromMarketplace(pluginId, pluginManager) {
    const pluginData = await this.getPlugin(pluginId);

    // Download plugin code
    const response = await fetch(pluginData.downloadUrl);
    const code = await response.text();

    // Create plugin manifest from marketplace data
    const manifest = {
      id: pluginData.id,
      name: pluginData.name,
      version: pluginData.version,
      description: pluginData.description,
      author: pluginData.author,
      type: pluginData.type,
      dependencies: pluginData.dependencies,
      config: pluginData.defaultConfig,

      // Execute downloaded code to get plugin implementation
      ...new Function('return ' + code)()
    };

    return pluginManager.install(manifest);
  }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

const pluginManager = new PluginManager();
const marketplace = new PluginMarketplace();

// Pre-register built-in plugins (not installed by default)
const availablePlugins = Object.values(BuiltInPlugins);

// ============================================
// EXPORTS
// ============================================

export {
  Plugin,
  PluginManager,
  PluginMarketplace,
  PLUGIN_STATES,
  PLUGIN_TYPES,
  HOOK_TYPES,
  BuiltInPlugins,
  pluginManager,
  marketplace,
  availablePlugins
};

export default {
  Plugin,
  PluginManager,
  PluginMarketplace,
  pluginManager,
  marketplace,
  availablePlugins
};
