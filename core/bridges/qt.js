/**
 * verenajs Qt Bridge
 * Native Qt C++ backend integration for desktop rendering
 *
 * This bridge allows verenajs components to:
 * - Render using Qt widgets for native look and feel
 * - Access native system APIs (file dialogs, notifications, etc.)
 * - Achieve near-native performance
 * - Use system theming
 */

import { Platform, events, registerComponent } from '../core.js';
import zmq from '../zeromq.js';

// Qt WebChannel for communication with C++ backend
let qtChannel = null;
let qtBackend = null;

/**
 * Component mapping from verenajs to Qt widgets
 */
const QT_WIDGET_MAP = {
  // Basic Widgets
  Button: 'QPushButton',
  Input: 'QLineEdit',
  Textarea: 'QTextEdit',
  Label: 'QLabel',
  Checkbox: 'QCheckBox',
  RadioButton: 'QRadioButton',
  Switch: 'QCheckBox', // Styled as toggle
  Slider: 'QSlider',
  ProgressBar: 'QProgressBar',
  Spinner: 'QProgressIndicator',

  // Containers
  Container: 'QWidget',
  Card: 'QFrame',
  Modal: 'QDialog',
  Drawer: 'QDockWidget',
  Tabs: 'QTabWidget',
  Accordion: 'QToolBox',
  Collapsible: 'QGroupBox',

  // Layout Widgets
  Grid: 'QGridLayout',
  Stack: 'QStackedWidget',
  Splitter: 'QSplitter',

  // Data Display
  Table: 'QTableWidget',
  DataTable: 'QTableView',
  List: 'QListWidget',
  TreeView: 'QTreeView',

  // Selection
  Dropdown: 'QComboBox',
  MultiSelect: 'QListWidget', // Multi-select mode
  DatePicker: 'QDateEdit',
  ColorPicker: 'QColorDialog',

  // Complex
  RichTextEditor: 'QTextEdit',
  FileUploader: 'QFileDialog',
  Menu: 'QMenu',
  Toolbar: 'QToolBar',
  StatusBar: 'QStatusBar'
};

/**
 * Property mapping from verenajs props to Qt properties
 */
const QT_PROP_MAP = {
  label: 'text',
  value: 'value',
  placeholder: 'placeholderText',
  disabled: 'enabled', // Inverted
  checked: 'checked',
  min: 'minimum',
  max: 'maximum',
  step: 'singleStep',
  readonly: 'readOnly',
  visible: 'visible'
};

/**
 * Style mapping from CSS to Qt StyleSheet
 */
function cssToQss(styles) {
  const qss = [];

  const mappings = {
    'background-color': 'background-color',
    'background': 'background',
    'color': 'color',
    'border': 'border',
    'border-radius': 'border-radius',
    'padding': 'padding',
    'margin': 'margin',
    'font-size': 'font-size',
    'font-weight': 'font-weight',
    'font-family': 'font-family'
  };

  for (const [cssProp, value] of Object.entries(styles)) {
    const qssProp = mappings[cssProp];
    if (qssProp) {
      qss.push(`${qssProp}: ${value};`);
    }
  }

  return qss.join(' ');
}

/**
 * Qt Backend Interface
 */
class QtBackendInterface {
  constructor(channel) {
    this.channel = channel;
    this.widgets = new Map();
    this.eventHandlers = new Map();
    this.nextId = 1;
  }

  /**
   * Create a Qt widget
   */
  async createWidget(type, props = {}) {
    const qtType = QT_WIDGET_MAP[type] || 'QWidget';
    const id = `widget_${this.nextId++}`;

    // Map props to Qt properties
    const qtProps = {};
    for (const [key, value] of Object.entries(props)) {
      const qtProp = QT_PROP_MAP[key];
      if (qtProp) {
        // Handle inverted props
        if (key === 'disabled') {
          qtProps[qtProp] = !value;
        } else {
          qtProps[qtProp] = value;
        }
      } else {
        qtProps[key] = value;
      }
    }

    // Send create command to Qt backend
    await this.channel.invoke('createWidget', {
      id,
      type: qtType,
      props: qtProps
    });

    this.widgets.set(id, { type, qtType, props: qtProps });
    return id;
  }

  /**
   * Update widget properties
   */
  async updateWidget(id, props) {
    const widget = this.widgets.get(id);
    if (!widget) return;

    const qtProps = {};
    for (const [key, value] of Object.entries(props)) {
      const qtProp = QT_PROP_MAP[key] || key;
      if (key === 'disabled') {
        qtProps[qtProp] = !value;
      } else {
        qtProps[qtProp] = value;
      }
    }

    await this.channel.invoke('updateWidget', { id, props: qtProps });
    Object.assign(widget.props, qtProps);
  }

  /**
   * Set widget style
   */
  async setWidgetStyle(id, styles) {
    const qss = cssToQss(styles);
    await this.channel.invoke('setWidgetStyle', { id, styleSheet: qss });
  }

  /**
   * Add widget to parent
   */
  async addChild(parentId, childId, options = {}) {
    await this.channel.invoke('addChild', {
      parentId,
      childId,
      ...options
    });
  }

  /**
   * Remove widget
   */
  async removeWidget(id) {
    await this.channel.invoke('removeWidget', { id });
    this.widgets.delete(id);
    this.eventHandlers.delete(id);
  }

  /**
   * Connect event handler
   */
  async connectEvent(widgetId, eventName, handler) {
    const handlerId = `${widgetId}_${eventName}`;

    if (!this.eventHandlers.has(widgetId)) {
      this.eventHandlers.set(widgetId, new Map());
    }
    this.eventHandlers.get(widgetId).set(eventName, handler);

    await this.channel.invoke('connectEvent', {
      widgetId,
      eventName,
      handlerId
    });

    return () => this.disconnectEvent(widgetId, eventName);
  }

  /**
   * Disconnect event handler
   */
  async disconnectEvent(widgetId, eventName) {
    if (this.eventHandlers.has(widgetId)) {
      this.eventHandlers.get(widgetId).delete(eventName);
    }
    await this.channel.invoke('disconnectEvent', { widgetId, eventName });
  }

  /**
   * Handle event from Qt backend
   */
  handleEvent(widgetId, eventName, data) {
    const handlers = this.eventHandlers.get(widgetId);
    if (handlers && handlers.has(eventName)) {
      handlers.get(eventName)(data);
    }
  }

  /**
   * Show native dialog
   */
  async showDialog(type, options = {}) {
    return this.channel.invoke('showDialog', { type, options });
  }

  /**
   * Show native notification
   */
  async showNotification(title, message, options = {}) {
    return this.channel.invoke('showNotification', { title, message, options });
  }

  /**
   * Get system theme
   */
  async getSystemTheme() {
    return this.channel.invoke('getSystemTheme');
  }

  /**
   * Get window info
   */
  async getWindowInfo() {
    return this.channel.invoke('getWindowInfo');
  }

  /**
   * Set window properties
   */
  async setWindowProps(props) {
    return this.channel.invoke('setWindowProps', props);
  }
}

/**
 * Initialize Qt Bridge
 */
async function initQtBridge() {
  if (!Platform.isElectron && typeof qt === 'undefined') {
    console.warn('Qt WebChannel not available');
    return false;
  }

  return new Promise((resolve) => {
    // Wait for Qt WebChannel to be ready
    if (typeof QWebChannel !== 'undefined') {
      new QWebChannel(qt.webChannelTransport, (channel) => {
        qtChannel = channel;
        qtBackend = new QtBackendInterface({
          invoke: (method, params) => {
            return new Promise((res, rej) => {
              if (channel.objects.backend && channel.objects.backend[method]) {
                channel.objects.backend[method](params, res);
              } else {
                rej(new Error(`Qt method ${method} not found`));
              }
            });
          }
        });

        // Listen for events from Qt
        if (channel.objects.backend) {
          channel.objects.backend.eventReceived.connect((widgetId, eventName, data) => {
            qtBackend.handleEvent(widgetId, eventName, JSON.parse(data));
          });
        }

        Platform.isQt = true;
        events.emit('qt:ready');
        resolve(true);
      });
    } else {
      // Try ZeroMQ bridge as fallback
      initZmqQtBridge().then(resolve);
    }
  });
}

/**
 * ZeroMQ-based Qt Bridge for separate Qt process
 */
async function initZmqQtBridge() {
  try {
    await zmq.initialize({ wsUrl: 'ws://localhost:5555' });

    const channel = await zmq.createChannel('qt-bridge');

    qtBackend = new QtBackendInterface({
      invoke: async (method, params) => {
        return zmq.request(`qt.${method}`, params);
      }
    });

    // Subscribe to Qt events
    channel.subscribe('widget-event', ({ widgetId, eventName, data }) => {
      qtBackend.handleEvent(widgetId, eventName, data);
    });

    Platform.isQt = true;
    events.emit('qt:ready');
    return true;
  } catch (error) {
    console.warn('ZMQ Qt bridge not available:', error.message);
    return false;
  }
}

/**
 * Create a Qt-rendered component
 */
function createQtComponent(type) {
  return async function(props = {}) {
    if (!qtBackend) {
      throw new Error('Qt bridge not initialized');
    }

    const widgetId = await qtBackend.createWidget(type, props);

    // Return a proxy object that mimics DOM element API
    return {
      _qtWidgetId: widgetId,
      _type: type,

      // Property access
      set(key, value) {
        return qtBackend.updateWidget(widgetId, { [key]: value });
      },

      get(key) {
        return qtBackend.widgets.get(widgetId)?.props[key];
      },

      // Style access
      setStyle(styles) {
        return qtBackend.setWidgetStyle(widgetId, styles);
      },

      // Event handling
      on(event, handler) {
        return qtBackend.connectEvent(widgetId, event, handler);
      },

      off(event) {
        return qtBackend.disconnectEvent(widgetId, event);
      },

      // DOM-like methods
      appendChild(child) {
        if (child._qtWidgetId) {
          return qtBackend.addChild(widgetId, child._qtWidgetId);
        }
      },

      remove() {
        return qtBackend.removeWidget(widgetId);
      },

      // Focus
      focus() {
        return qtBackend.updateWidget(widgetId, { focus: true });
      },

      blur() {
        return qtBackend.updateWidget(widgetId, { focus: false });
      }
    };
  };
}

/**
 * Register Qt versions of all components
 */
function registerQtComponents() {
  for (const [verenajsType] of Object.entries(QT_WIDGET_MAP)) {
    const factory = createQtComponent(verenajsType);
    registerComponent(`Qt${verenajsType}`, factory, {
      category: 'qt',
      platform: 'qt'
    });
  }
}

/**
 * Native dialogs
 */
const QtDialogs = {
  async openFile(options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('openFile', options);
  },

  async saveFile(options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('saveFile', options);
  },

  async selectDirectory(options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('selectDirectory', options);
  },

  async colorPicker(options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('colorPicker', options);
  },

  async fontPicker(options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('fontPicker', options);
  },

  async messageBox(title, message, buttons = ['OK']) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showDialog('messageBox', { title, message, buttons });
  }
};

/**
 * Native window controls
 */
const QtWindow = {
  async minimize() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ minimized: true });
  },

  async maximize() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ maximized: true });
  },

  async restore() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ minimized: false, maximized: false });
  },

  async close() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ close: true });
  },

  async setTitle(title) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ title });
  },

  async setSize(width, height) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ width, height });
  },

  async setPosition(x, y) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ x, y });
  },

  async setFullscreen(fullscreen = true) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ fullscreen });
  },

  async setAlwaysOnTop(onTop = true) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.setWindowProps({ alwaysOnTop: onTop });
  },

  async getInfo() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.getWindowInfo();
  }
};

/**
 * System integration
 */
const QtSystem = {
  async notify(title, message, options = {}) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.showNotification(title, message, options);
  },

  async getTheme() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.getSystemTheme();
  },

  async setClipboard(text) {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.invoke('setClipboard', { text });
  },

  async getClipboard() {
    if (!qtBackend) throw new Error('Qt not initialized');
    return qtBackend.invoke('getClipboard');
  }
};

export {
  initQtBridge,
  initZmqQtBridge,
  createQtComponent,
  registerQtComponents,
  QtDialogs,
  QtWindow,
  QtSystem,
  QT_WIDGET_MAP,
  QT_PROP_MAP,
  cssToQss,
  qtBackend
};

export default {
  init: initQtBridge,
  dialogs: QtDialogs,
  window: QtWindow,
  system: QtSystem,
  createComponent: createQtComponent,
  registerComponents: registerQtComponents
};
