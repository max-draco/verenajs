/**
 * verenajs Project Integration
 * Connect Visual Builder with external projects
 * Supports automatic component discovery and live editing
 *
 * @version 2.0.0
 */

import { events, dom } from './core.js';
import { COMPONENT_CATEGORIES, getComponentCount } from './component-manifest.js';

// ============================================
// PROJECT SCANNER
// ============================================

class ProjectScanner {
  constructor() {
    this.projects = new Map();
    this.scannedFiles = new Map();
  }

  // Scan a project directory for verenajs usage
  async scanProject(projectPath, options = {}) {
    const project = {
      path: projectPath,
      name: options.name || projectPath.split('/').pop(),
      components: new Map(),
      pages: [],
      styles: [],
      imports: [],
      config: null,
      scannedAt: Date.now()
    };

    // In a real implementation, this would use the file system
    // For browser environments, we can scan loaded modules
    if (typeof window !== 'undefined') {
      this.scanLoadedModules(project);
    }

    this.projects.set(project.name, project);
    events.emit('project:scanned', project);

    return project;
  }

  // Scan modules loaded in the browser
  scanLoadedModules(project) {
    // Find all verenajs components in use
    const componentUsage = [];

    // Scan document for components with data attributes
    document.querySelectorAll('[data-verena-component]').forEach(el => {
      componentUsage.push({
        type: el.dataset.verenaComponent,
        element: el,
        props: this.extractProps(el)
      });
    });

    // Scan for components by class name patterns
    Object.entries(COMPONENT_CATEGORIES).forEach(([category, { components }]) => {
      components.forEach(componentName => {
        const selector = `.v-${componentName.toLowerCase()}, [class*="v-${componentName.toLowerCase()}"]`;
        document.querySelectorAll(selector).forEach(el => {
          if (!componentUsage.find(c => c.element === el)) {
            componentUsage.push({
              type: componentName,
              element: el,
              props: this.extractProps(el)
            });
          }
        });
      });
    });

    project.components = componentUsage;
    return componentUsage;
  }

  // Extract props from element
  extractProps(element) {
    const props = {};

    // Get data attributes
    Object.entries(element.dataset).forEach(([key, value]) => {
      if (key !== 'verenaComponent') {
        props[key] = value;
      }
    });

    // Get relevant attributes
    ['id', 'class', 'style', 'title', 'aria-label'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) props[attr] = value;
    });

    return props;
  }

  // Get project by name
  getProject(name) {
    return this.projects.get(name);
  }

  // List all projects
  listProjects() {
    return Array.from(this.projects.values());
  }
}

// ============================================
// LIVE EDITOR INTEGRATION
// ============================================

class LiveEditorBridge {
  constructor() {
    this.isActive = false;
    this.selectedElement = null;
    this.highlightOverlay = null;
    this.propertiesPanel = null;
    this.undoStack = [];
    this.redoStack = [];
  }

  // Activate live editing mode
  activate() {
    if (this.isActive) return;

    this.isActive = true;
    this.createOverlay();
    this.attachListeners();

    document.body.classList.add('verena-live-edit-active');
    events.emit('live-editor:activated');
  }

  // Deactivate live editing mode
  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    this.removeOverlay();
    this.detachListeners();

    document.body.classList.remove('verena-live-edit-active');
    events.emit('live-editor:deactivated');
  }

  // Toggle live editing mode
  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  // Create highlight overlay
  createOverlay() {
    this.highlightOverlay = dom.create('div', {
      className: 'verena-live-highlight',
      style: {
        position: 'fixed',
        pointerEvents: 'none',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        background: 'rgba(59, 130, 246, 0.1)',
        zIndex: '999999',
        display: 'none',
        transition: 'all 0.1s ease'
      }
    });
    document.body.appendChild(this.highlightOverlay);

    // Create properties panel
    this.propertiesPanel = dom.create('div', {
      className: 'verena-live-properties',
      style: {
        position: 'fixed',
        right: '16px',
        top: '16px',
        width: '300px',
        maxHeight: '80vh',
        background: '#1e293b',
        color: '#e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        zIndex: '999999',
        overflow: 'hidden',
        display: 'none'
      }
    });
    document.body.appendChild(this.propertiesPanel);
  }

  // Remove overlay
  removeOverlay() {
    if (this.highlightOverlay) {
      this.highlightOverlay.remove();
      this.highlightOverlay = null;
    }
    if (this.propertiesPanel) {
      this.propertiesPanel.remove();
      this.propertiesPanel = null;
    }
  }

  // Attach event listeners
  attachListeners() {
    this.mouseMoveHandler = (e) => this.handleMouseMove(e);
    this.clickHandler = (e) => this.handleClick(e);
    this.keydownHandler = (e) => this.handleKeydown(e);

    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('click', this.clickHandler, true);
    document.addEventListener('keydown', this.keydownHandler);
  }

  // Detach event listeners
  detachListeners() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('click', this.clickHandler, true);
    document.removeEventListener('keydown', this.keydownHandler);
  }

  // Handle mouse move (highlight hovered elements)
  handleMouseMove(e) {
    if (!this.isActive || !this.highlightOverlay) return;

    const target = this.findVerenaComponent(e.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      this.highlightOverlay.style.display = 'block';
      this.highlightOverlay.style.left = `${rect.left}px`;
      this.highlightOverlay.style.top = `${rect.top}px`;
      this.highlightOverlay.style.width = `${rect.width}px`;
      this.highlightOverlay.style.height = `${rect.height}px`;
    } else {
      this.highlightOverlay.style.display = 'none';
    }
  }

  // Handle click (select element)
  handleClick(e) {
    if (!this.isActive) return;

    const target = this.findVerenaComponent(e.target);
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      this.selectElement(target);
    }
  }

  // Handle keyboard shortcuts
  handleKeydown(e) {
    if (!this.isActive) return;

    // Escape - Deselect
    if (e.key === 'Escape') {
      this.deselectElement();
    }

    // Ctrl/Cmd + Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    }

    // Ctrl/Cmd + Shift + Z - Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      this.redo();
    }

    // Delete - Remove selected
    if (e.key === 'Delete' && this.selectedElement) {
      e.preventDefault();
      this.removeSelected();
    }
  }

  // Find verenajs component in ancestry
  findVerenaComponent(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current._verenaComponent ||
          current.dataset?.verenaComponent ||
          current.className?.includes('v-')) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // Select an element
  selectElement(element) {
    // Deselect previous
    if (this.selectedElement) {
      this.selectedElement.classList.remove('verena-selected');
    }

    this.selectedElement = element;
    element.classList.add('verena-selected');

    // Update highlight
    const rect = element.getBoundingClientRect();
    this.highlightOverlay.style.border = '2px solid #22c55e';
    this.highlightOverlay.style.background = 'rgba(34, 197, 94, 0.1)';

    // Show properties panel
    this.showProperties(element);

    events.emit('live-editor:element-selected', { element });
  }

  // Deselect element
  deselectElement() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('verena-selected');
      this.selectedElement = null;
    }

    this.highlightOverlay.style.display = 'none';
    this.highlightOverlay.style.border = '2px solid #3b82f6';
    this.highlightOverlay.style.background = 'rgba(59, 130, 246, 0.1)';

    this.propertiesPanel.style.display = 'none';

    events.emit('live-editor:element-deselected');
  }

  // Show properties panel
  showProperties(element) {
    const componentType = element._verenaComponent ||
                          element.dataset?.verenaComponent ||
                          this.inferComponentType(element);

    const props = element._verenaProps || this.extractPropsFromElement(element);

    this.propertiesPanel.innerHTML = `
      <div style="padding: 12px 16px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
        <strong>${componentType || 'Element'}</strong>
        <button onclick="this.parentElement.parentElement.style.display='none'" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.25rem;">\u00D7</button>
      </div>
      <div style="padding: 16px; max-height: calc(80vh - 60px); overflow-y: auto;">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">ID</label>
          <input type="text" value="${element.id || ''}" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit;" onchange="document.querySelector('.verena-selected').id = this.value" />
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">Classes</label>
          <input type="text" value="${element.className || ''}" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit;" onchange="document.querySelector('.verena-selected').className = this.value + ' verena-selected'" />
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">Text Content</label>
          <textarea style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit; min-height: 60px; resize: vertical;" onchange="document.querySelector('.verena-selected').textContent = this.value">${element.textContent?.substring(0, 200) || ''}</textarea>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; margin-top: 16px;">
          <strong style="display: block; margin-bottom: 12px;">Quick Styles</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Width</label>
              <input type="text" value="${element.style.width || ''}" placeholder="auto" style="width: 100%; padding: 4px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit; font-size: 0.75rem;" onchange="document.querySelector('.verena-selected').style.width = this.value" />
            </div>
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Height</label>
              <input type="text" value="${element.style.height || ''}" placeholder="auto" style="width: 100%; padding: 4px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit; font-size: 0.75rem;" onchange="document.querySelector('.verena-selected').style.height = this.value" />
            </div>
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Padding</label>
              <input type="text" value="${element.style.padding || ''}" placeholder="0" style="width: 100%; padding: 4px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit; font-size: 0.75rem;" onchange="document.querySelector('.verena-selected').style.padding = this.value" />
            </div>
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Margin</label>
              <input type="text" value="${element.style.margin || ''}" placeholder="0" style="width: 100%; padding: 4px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: inherit; font-size: 0.75rem;" onchange="document.querySelector('.verena-selected').style.margin = this.value" />
            </div>
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Background</label>
              <input type="color" value="#ffffff" style="width: 100%; height: 28px; padding: 2px; background: #0f172a; border: 1px solid #334155; border-radius: 4px;" onchange="document.querySelector('.verena-selected').style.backgroundColor = this.value" />
            </div>
            <div>
              <label style="display: block; font-size: 0.625rem; color: #94a3b8; margin-bottom: 2px;">Color</label>
              <input type="color" value="#000000" style="width: 100%; height: 28px; padding: 2px; background: #0f172a; border: 1px solid #334155; border-radius: 4px;" onchange="document.querySelector('.verena-selected').style.color = this.value" />
            </div>
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button onclick="window.verenaLiveEditor.duplicateSelected()" style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Duplicate</button>
          <button onclick="window.verenaLiveEditor.removeSelected()" style="flex: 1; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
        </div>
      </div>
    `;

    this.propertiesPanel.style.display = 'block';
  }

  // Infer component type from element
  inferComponentType(element) {
    const classes = element.className || '';
    const match = classes.match(/v-([a-z-]+)/);
    if (match) {
      return match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    }
    return element.tagName.toLowerCase();
  }

  // Extract props from element
  extractPropsFromElement(element) {
    const props = {};
    Array.from(element.attributes).forEach(attr => {
      props[attr.name] = attr.value;
    });
    return props;
  }

  // Save state for undo
  saveState() {
    if (this.selectedElement) {
      this.undoStack.push({
        element: this.selectedElement,
        html: this.selectedElement.outerHTML,
        parent: this.selectedElement.parentElement,
        index: Array.from(this.selectedElement.parentElement.children).indexOf(this.selectedElement)
      });
      this.redoStack = [];
    }
  }

  // Undo
  undo() {
    if (this.undoStack.length === 0) return;

    const state = this.undoStack.pop();
    this.redoStack.push({
      element: state.element,
      html: state.element.outerHTML,
      parent: state.element.parentElement,
      index: Array.from(state.element.parentElement.children).indexOf(state.element)
    });

    state.element.outerHTML = state.html;
    events.emit('live-editor:undo');
  }

  // Redo
  redo() {
    if (this.redoStack.length === 0) return;

    const state = this.redoStack.pop();
    this.undoStack.push({
      element: state.element,
      html: state.element.outerHTML,
      parent: state.element.parentElement,
      index: Array.from(state.element.parentElement.children).indexOf(state.element)
    });

    state.element.outerHTML = state.html;
    events.emit('live-editor:redo');
  }

  // Duplicate selected element
  duplicateSelected() {
    if (!this.selectedElement) return;

    this.saveState();
    const clone = this.selectedElement.cloneNode(true);
    clone.classList.remove('verena-selected');
    this.selectedElement.parentElement.insertBefore(clone, this.selectedElement.nextSibling);

    events.emit('live-editor:element-duplicated', { original: this.selectedElement, clone });
  }

  // Remove selected element
  removeSelected() {
    if (!this.selectedElement) return;

    this.saveState();
    const element = this.selectedElement;
    this.deselectElement();
    element.remove();

    events.emit('live-editor:element-removed', { element });
  }

  // Apply style to selected element
  applyStyle(property, value) {
    if (!this.selectedElement) return;

    this.saveState();
    this.selectedElement.style[property] = value;

    events.emit('live-editor:style-applied', { element: this.selectedElement, property, value });
  }
}

// ============================================
// NAVIGATOR PROJECT INTEGRATION
// ============================================

class NavigatorIntegration {
  constructor() {
    this.projectPath = '/var/www/projects/navigator/navigator';
    this.components = new Map();
    this.pages = [];
  }

  // Initialize integration with navigator project
  async initialize() {
    // Scan for verenajs components in use
    this.scanComponents();

    // Set up live editing for navigator
    this.setupLiveEditing();

    events.emit('navigator:initialized');
    return this;
  }

  // Scan navigator for verenajs components
  scanComponents() {
    // Components used in navigator based on analysis:
    const navigatorComponents = [
      // Trading components
      'PriceCard', 'OrderBook', 'TradeHistory', 'MarketCard',
      'OrderForm', 'PositionCard', 'MarketChart',

      // UI components
      'Tabs', 'TabsFrame', 'MultitabSection', 'Card', 'Modal',
      'Button', 'Input', 'Dropdown', 'Badge', 'Avatar',

      // Navigation
      'Sidebar', 'Navbar', 'Breadcrumb',

      // Data display
      'Table', 'List', 'Timeline', 'Stat', 'StatGroup',

      // Feedback
      'Alert', 'Toast', 'Spinner', 'Progress'
    ];

    navigatorComponents.forEach(name => {
      this.components.set(name, {
        name,
        category: this.inferCategory(name),
        inUse: true
      });
    });

    return this.components;
  }

  // Infer component category
  inferCategory(name) {
    if (['PriceCard', 'OrderBook', 'TradeHistory', 'MarketCard', 'OrderForm', 'PositionCard', 'MarketChart'].includes(name)) {
      return 'trading';
    }
    if (['Tabs', 'Card', 'Modal', 'Button', 'Input', 'Dropdown', 'Badge', 'Avatar'].includes(name)) {
      return 'display';
    }
    if (['Sidebar', 'Navbar', 'Breadcrumb'].includes(name)) {
      return 'navigation';
    }
    if (['Table', 'List', 'Timeline', 'Stat', 'StatGroup'].includes(name)) {
      return 'data';
    }
    return 'general';
  }

  // Set up live editing integration
  setupLiveEditing() {
    // Create keyboard shortcut info
    const shortcutHint = dom.create('div', {
      style: {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        padding: '8px 12px',
        background: 'rgba(30, 41, 59, 0.9)',
        color: '#e2e8f0',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: '9999',
        backdropFilter: 'blur(8px)'
      }
    });
    shortcutHint.innerHTML = `
      <strong>verenajs Builder</strong><br>
      Press <kbd style="background: #334155; padding: 2px 6px; border-radius: 3px;">Ctrl+B</kbd> to toggle builder<br>
      Press <kbd style="background: #334155; padding: 2px 6px; border-radius: 3px;">Ctrl+E</kbd> to toggle live edit
    `;

    // Only show in development
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      document.body.appendChild(shortcutHint);
    }
  }

  // Get list of pages in navigator
  getPages() {
    return [
      { path: '/login.html', name: 'Login', components: ['Input', 'Button', 'Card'] },
      { path: '/dashboard.html', name: 'Dashboard', components: ['Sidebar', 'Card', 'Chart', 'Table'] },
      { path: '/portfolio.html', name: 'Portfolio', components: ['Tabs', 'Table', 'Stat', 'Chart'] },
      { path: '/profile.html', name: 'Profile', components: ['Avatar', 'Input', 'Button', 'Card'] },
      { path: '/sports.html', name: 'Sports', components: ['Card', 'Badge', 'Table'] }
    ];
  }

  // Get component usage stats
  getComponentStats() {
    return {
      total: this.components.size,
      byCategory: {
        trading: Array.from(this.components.values()).filter(c => c.category === 'trading').length,
        display: Array.from(this.components.values()).filter(c => c.category === 'display').length,
        navigation: Array.from(this.components.values()).filter(c => c.category === 'navigation').length,
        data: Array.from(this.components.values()).filter(c => c.category === 'data').length
      }
    };
  }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

const projectScanner = new ProjectScanner();
const liveEditorBridge = new LiveEditorBridge();
const navigatorIntegration = new NavigatorIntegration();

// Make live editor globally accessible for inline handlers
if (typeof window !== 'undefined') {
  window.verenaLiveEditor = liveEditorBridge;
}

// ============================================
// EXPORTS
// ============================================

export {
  ProjectScanner,
  LiveEditorBridge,
  NavigatorIntegration,
  projectScanner,
  liveEditorBridge,
  navigatorIntegration
};

export default {
  ProjectScanner,
  LiveEditorBridge,
  NavigatorIntegration,
  projectScanner,
  liveEditorBridge,
  navigatorIntegration
};
