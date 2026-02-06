/**
 * verenajs Advanced Visual Builder
 * Professional-grade drag-and-drop UI builder
 * Better than Elementor/WordPress Builder
 *
 * Features:
 * - Real-time preview
 * - Component-level styling
 * - Responsive design tools
 * - Theme customization
 * - Code export
 * - API integration
 * - Docker deployment
 * - Plugin system
 *
 * @version 2.0.0
 */

import { dom, events, theme, injectStyle, store, reactive } from '../core/core.js';
import { COMPONENT_CATEGORIES, getComponentCount } from '../core/component-manifest.js';
import generatedComponents from '../core/component-generator.js';

// ============================================
// BUILDER STATE MANAGEMENT
// ============================================

const BuilderState = {
  // Canvas state
  canvas: {
    nodes: [],
    selectedNode: null,
    hoveredNode: null,
    clipboard: null,
    zoom: 1,
    showGrid: true,
    showOutlines: false,
    mode: 'edit', // edit | preview | code | responsive
    device: 'desktop', // desktop | tablet | mobile
    breakpoint: 1920
  },

  // History for undo/redo
  history: {
    past: [],
    future: [],
    maxSize: 50
  },

  // UI state
  ui: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    leftPanelTab: 'components', // components | layers | pages
    rightPanelTab: 'style', // style | settings | data | events
    bottomPanelOpen: false,
    bottomPanelTab: 'console', // console | network | performance
    searchQuery: '',
    componentFilter: null
  },

  // Project state
  project: {
    name: 'Untitled Project',
    pages: [{ id: 'page-1', name: 'Home', path: '/', nodes: [] }],
    currentPage: 'page-1',
    globalStyles: {},
    globalVariables: {},
    assets: [],
    fonts: []
  },

  // API/Data state
  data: {
    endpoints: [],
    webhooks: [],
    dataSources: [],
    bindings: []
  },

  // Plugin state
  plugins: {
    installed: [],
    active: []
  }
};

// Make state reactive
const state = reactive(BuilderState);

// ============================================
// BUILDER NODE CLASS
// ============================================

class BuilderNode {
  constructor(type, props = {}, children = []) {
    this.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.props = { ...props };
    this.children = children;
    this.parent = null;
    this.styles = {
      desktop: {},
      tablet: {},
      mobile: {}
    };
    this.animations = [];
    this.events = [];
    this.bindings = [];
    this.conditions = [];
    this.locked = false;
    this.hidden = false;
    this.name = props.name || type;
  }

  clone() {
    const cloned = new BuilderNode(this.type, { ...this.props }, []);
    cloned.styles = JSON.parse(JSON.stringify(this.styles));
    cloned.animations = [...this.animations];
    cloned.events = [...this.events];
    cloned.bindings = [...this.bindings];
    cloned.conditions = [...this.conditions];
    cloned.children = this.children.map(c => {
      const childClone = c.clone();
      childClone.parent = cloned;
      return childClone;
    });
    return cloned;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      props: this.props,
      styles: this.styles,
      animations: this.animations,
      events: this.events,
      bindings: this.bindings,
      conditions: this.conditions,
      locked: this.locked,
      hidden: this.hidden,
      children: this.children.map(c => c.toJSON())
    };
  }

  static fromJSON(json, parent = null) {
    const node = new BuilderNode(json.type, json.props);
    Object.assign(node, {
      id: json.id,
      name: json.name,
      styles: json.styles || { desktop: {}, tablet: {}, mobile: {} },
      animations: json.animations || [],
      events: json.events || [],
      bindings: json.bindings || [],
      conditions: json.conditions || [],
      locked: json.locked || false,
      hidden: json.hidden || false,
      parent
    });
    node.children = (json.children || []).map(c => BuilderNode.fromJSON(c, node));
    return node;
  }
}

// ============================================
// ADVANCED VISUAL BUILDER UI
// ============================================

function createAdvancedBuilder() {
  injectStyle('advanced-builder', BUILDER_STYLES);

  const builder = dom.create('div', { className: 'vb-advanced' });

  // Top Toolbar
  builder.appendChild(createTopToolbar());

  // Main Content Area
  const main = dom.create('div', { className: 'vb-main' });

  // Left Panel (Components/Layers)
  main.appendChild(createLeftPanel());

  // Center (Canvas)
  main.appendChild(createCanvasArea());

  // Right Panel (Properties/Style)
  main.appendChild(createRightPanel());

  builder.appendChild(main);

  // Bottom Panel (Console/Debug)
  builder.appendChild(createBottomPanel());

  // Initialize keyboard shortcuts
  initKeyboardShortcuts(builder);

  // Initialize drag and drop
  initDragAndDrop(builder);

  return builder;
}

// ============================================
// TOP TOOLBAR
// ============================================

function createTopToolbar() {
  const toolbar = dom.create('div', { className: 'vb-toolbar' });

  // Left section - Logo and project name
  const left = dom.create('div', { className: 'vb-toolbar-left' });
  left.appendChild(dom.create('div', { className: 'vb-logo' }, 'verenajs'));
  left.appendChild(dom.create('input', {
    type: 'text',
    className: 'vb-project-name',
    value: state.project.name,
    onInput: (e) => { state.project.name = e.target.value; }
  }));

  // Center section - Device/Viewport controls
  const center = dom.create('div', { className: 'vb-toolbar-center' });

  // Undo/Redo
  center.appendChild(createToolbarButton('\u21A9', 'Undo (Ctrl+Z)', () => undo()));
  center.appendChild(createToolbarButton('\u21AA', 'Redo (Ctrl+Y)', () => redo()));
  center.appendChild(dom.create('span', { className: 'vb-toolbar-divider' }));

  // Device toggle
  const devices = [
    { id: 'desktop', icon: '\u{1F5A5}', label: 'Desktop', width: 1920 },
    { id: 'tablet', icon: '\u{1F4F1}', label: 'Tablet', width: 768 },
    { id: 'mobile', icon: '\u{1F4F1}', label: 'Mobile', width: 375 }
  ];

  devices.forEach(device => {
    const btn = createToolbarButton(device.icon, device.label, () => {
      state.canvas.device = device.id;
      state.canvas.breakpoint = device.width;
      updateDeviceButtons();
    });
    btn.dataset.device = device.id;
    btn.classList.add('vb-device-btn');
    if (device.id === state.canvas.device) btn.classList.add('active');
    center.appendChild(btn);
  });

  function updateDeviceButtons() {
    toolbar.querySelectorAll('.vb-device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === state.canvas.device);
    });
    events.emit('builder:device-changed', state.canvas.device);
  }

  center.appendChild(dom.create('span', { className: 'vb-toolbar-divider' }));

  // Zoom controls
  const zoomSelect = dom.create('select', {
    className: 'vb-zoom-select',
    onChange: (e) => setZoom(parseFloat(e.target.value))
  });
  [50, 75, 100, 125, 150, 200].forEach(z => {
    zoomSelect.appendChild(dom.create('option', {
      value: z / 100,
      selected: z === 100
    }, `${z}%`));
  });
  center.appendChild(zoomSelect);

  center.appendChild(dom.create('span', { className: 'vb-toolbar-divider' }));

  // View toggles
  center.appendChild(createToolbarButton('\u229E', 'Toggle Grid', () => {
    state.canvas.showGrid = !state.canvas.showGrid;
  }, state.canvas.showGrid));

  center.appendChild(createToolbarButton('\u25A1', 'Toggle Outlines', () => {
    state.canvas.showOutlines = !state.canvas.showOutlines;
  }));

  // Right section - Mode and actions
  const right = dom.create('div', { className: 'vb-toolbar-right' });

  // Mode toggle
  const modes = [
    { id: 'edit', icon: '\u270E', label: 'Edit' },
    { id: 'preview', icon: '\u25B6', label: 'Preview' },
    { id: 'code', icon: '</>', label: 'Code' }
  ];

  modes.forEach(mode => {
    const btn = createToolbarButton(mode.icon, mode.label, () => {
      state.canvas.mode = mode.id;
      updateModeButtons();
    });
    btn.dataset.mode = mode.id;
    btn.classList.add('vb-mode-btn');
    if (mode.id === state.canvas.mode) btn.classList.add('active');
    right.appendChild(btn);
  });

  function updateModeButtons() {
    toolbar.querySelectorAll('.vb-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.canvas.mode);
    });
    events.emit('builder:mode-changed', state.canvas.mode);
  }

  right.appendChild(dom.create('span', { className: 'vb-toolbar-divider' }));

  // Save/Export
  right.appendChild(createToolbarButton('\u{1F4BE}', 'Save (Ctrl+S)', saveProject));
  right.appendChild(createToolbarButton('\u2913', 'Export', showExportDialog));
  right.appendChild(createToolbarButton('\u{1F680}', 'Deploy', showDeployDialog));
  right.appendChild(createToolbarButton('\u2699', 'Settings', showSettings));

  toolbar.appendChild(left);
  toolbar.appendChild(center);
  toolbar.appendChild(right);

  return toolbar;
}

function createToolbarButton(icon, title, onClick, active = false) {
  const btn = dom.create('button', {
    className: `vb-toolbar-btn ${active ? 'active' : ''}`,
    title,
    onClick
  }, icon);
  return btn;
}

// ============================================
// LEFT PANEL - Components & Layers
// ============================================

function createLeftPanel() {
  const panel = dom.create('div', { className: 'vb-left-panel' });

  // Panel header with tabs
  const header = dom.create('div', { className: 'vb-panel-header' });
  const tabs = ['components', 'layers', 'pages'];
  tabs.forEach(tab => {
    const tabBtn = dom.create('button', {
      className: `vb-panel-tab ${tab === state.ui.leftPanelTab ? 'active' : ''}`,
      onClick: () => {
        state.ui.leftPanelTab = tab;
        updateLeftPanelTabs();
      }
    }, tab.charAt(0).toUpperCase() + tab.slice(1));
    tabBtn.dataset.tab = tab;
    header.appendChild(tabBtn);
  });
  panel.appendChild(header);

  function updateLeftPanelTabs() {
    panel.querySelectorAll('.vb-panel-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === state.ui.leftPanelTab);
    });
    panel.querySelectorAll('.vb-panel-content').forEach(c => {
      c.classList.toggle('active', c.dataset.tab === state.ui.leftPanelTab);
    });
  }

  // Components Tab
  panel.appendChild(createComponentsPanel());

  // Layers Tab
  panel.appendChild(createLayersPanel());

  // Pages Tab
  panel.appendChild(createPagesPanel());

  return panel;
}

function createComponentsPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content active',
    dataset: { tab: 'components' }
  });

  // Search
  const search = dom.create('input', {
    type: 'search',
    className: 'vb-search',
    placeholder: `Search ${getComponentCount()} components...`
  });
  search.addEventListener('input', (e) => {
    filterComponents(e.target.value);
  });
  content.appendChild(search);

  // Component categories
  const categories = dom.create('div', { className: 'vb-categories' });

  Object.entries(COMPONENT_CATEGORIES).forEach(([key, category]) => {
    const section = dom.create('div', { className: 'vb-category' });

    const header = dom.create('div', {
      className: 'vb-category-header',
      onClick: () => section.classList.toggle('collapsed')
    });
    header.innerHTML = `
      <span class="vb-category-icon">\u25BC</span>
      <span class="vb-category-name">${category.name}</span>
      <span class="vb-category-count">${category.components.length}</span>
    `;
    section.appendChild(header);

    const list = dom.create('div', { className: 'vb-component-list' });
    category.components.forEach(name => {
      const item = dom.create('div', {
        className: 'vb-component-item',
        draggable: 'true',
        dataset: { component: name, category: key }
      });
      item.innerHTML = `
        <span class="vb-component-icon">\u25A0</span>
        <span class="vb-component-name">${name}</span>
      `;

      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('component', name);
        e.dataTransfer.effectAllowed = 'copy';
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      list.appendChild(item);
    });

    section.appendChild(list);
    categories.appendChild(section);
  });

  content.appendChild(categories);

  function filterComponents(query) {
    const lower = query.toLowerCase();
    content.querySelectorAll('.vb-component-item').forEach(item => {
      const name = item.dataset.component.toLowerCase();
      item.style.display = name.includes(lower) ? '' : 'none';
    });

    // Show/hide empty categories
    content.querySelectorAll('.vb-category').forEach(cat => {
      const visible = cat.querySelectorAll('.vb-component-item[style=""]').length;
      cat.style.display = visible > 0 || !query ? '' : 'none';
    });
  }

  return content;
}

function createLayersPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content',
    dataset: { tab: 'layers' }
  });

  const tree = dom.create('div', { className: 'vb-layers-tree' });

  function renderTree() {
    dom.empty(tree);
    state.canvas.nodes.forEach(node => {
      tree.appendChild(createLayerItem(node, 0));
    });
  }

  function createLayerItem(node, depth) {
    const item = dom.create('div', {
      className: `vb-layer-item ${state.canvas.selectedNode?.id === node.id ? 'selected' : ''}`,
      style: { paddingLeft: `${depth * 16 + 8}px` },
      dataset: { nodeId: node.id }
    });

    const hasChildren = node.children.length > 0;

    item.innerHTML = `
      <span class="vb-layer-expand ${hasChildren ? '' : 'hidden'}">${hasChildren ? '\u25BC' : ''}</span>
      <span class="vb-layer-icon">\u25A0</span>
      <span class="vb-layer-name">${node.name}</span>
      <span class="vb-layer-type">${node.type}</span>
      <div class="vb-layer-actions">
        <button class="vb-layer-action" title="Toggle visibility">${node.hidden ? '\u{1F441}\u200D\u{1F5E8}' : '\u{1F441}'}</button>
        <button class="vb-layer-action" title="Lock">${node.locked ? '\u{1F512}' : '\u{1F513}'}</button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('vb-layer-action')) {
        selectNode(node);
      }
    });

    const wrapper = dom.create('div', { className: 'vb-layer-wrapper' });
    wrapper.appendChild(item);

    if (hasChildren) {
      const children = dom.create('div', { className: 'vb-layer-children' });
      node.children.forEach(child => {
        children.appendChild(createLayerItem(child, depth + 1));
      });
      wrapper.appendChild(children);
    }

    return wrapper;
  }

  events.on('builder:nodes-changed', renderTree);
  events.on('builder:selection-changed', renderTree);

  renderTree();
  content.appendChild(tree);

  return content;
}

function createPagesPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content',
    dataset: { tab: 'pages' }
  });

  const header = dom.create('div', { className: 'vb-pages-header' });
  header.appendChild(dom.create('button', {
    className: 'vb-add-page-btn',
    onClick: addNewPage
  }, '+ Add Page'));
  content.appendChild(header);

  const list = dom.create('div', { className: 'vb-pages-list' });

  function renderPages() {
    dom.empty(list);
    state.project.pages.forEach(page => {
      const item = dom.create('div', {
        className: `vb-page-item ${page.id === state.project.currentPage ? 'active' : ''}`,
        dataset: { pageId: page.id }
      });
      item.innerHTML = `
        <span class="vb-page-icon">\u{1F4C4}</span>
        <span class="vb-page-name">${page.name}</span>
        <span class="vb-page-path">${page.path}</span>
      `;
      item.addEventListener('click', () => switchPage(page.id));
      list.appendChild(item);
    });
  }

  function addNewPage() {
    const id = `page-${Date.now()}`;
    state.project.pages.push({
      id,
      name: `Page ${state.project.pages.length + 1}`,
      path: `/page-${state.project.pages.length + 1}`,
      nodes: []
    });
    renderPages();
  }

  function switchPage(pageId) {
    state.project.currentPage = pageId;
    const page = state.project.pages.find(p => p.id === pageId);
    if (page) {
      state.canvas.nodes = page.nodes;
      events.emit('builder:page-changed', page);
    }
    renderPages();
  }

  renderPages();
  content.appendChild(list);

  return content;
}

// ============================================
// CENTER - CANVAS AREA
// ============================================

function createCanvasArea() {
  const area = dom.create('div', { className: 'vb-canvas-area' });

  // Canvas toolbar
  const toolbar = dom.create('div', { className: 'vb-canvas-toolbar' });
  toolbar.innerHTML = `
    <div class="vb-breadcrumb">
      <span class="vb-breadcrumb-item">Page</span>
    </div>
    <div class="vb-canvas-info">
      <span class="vb-device-size">${state.canvas.breakpoint}px</span>
    </div>
  `;
  area.appendChild(toolbar);

  // Canvas wrapper with device frame
  const wrapper = dom.create('div', { className: 'vb-canvas-wrapper' });

  const frame = dom.create('div', {
    className: `vb-canvas-frame vb-device-${state.canvas.device}`,
    style: { transform: `scale(${state.canvas.zoom})` }
  });

  // Main canvas/dropzone
  const canvas = dom.create('div', {
    className: 'vb-canvas',
    dataset: { empty: 'true' }
  });

  canvas.innerHTML = `
    <div class="vb-empty-state">
      <div class="vb-empty-icon">\u{1F3A8}</div>
      <div class="vb-empty-title">Start Building</div>
      <div class="vb-empty-text">Drag components from the left panel</div>
    </div>
  `;

  // Drop handling
  canvas.addEventListener('dragover', handleDragOver);
  canvas.addEventListener('dragleave', handleDragLeave);
  canvas.addEventListener('drop', handleDrop);

  frame.appendChild(canvas);
  wrapper.appendChild(frame);
  area.appendChild(wrapper);

  // Update when device changes
  events.on('builder:device-changed', (device) => {
    frame.className = `vb-canvas-frame vb-device-${device}`;
    toolbar.querySelector('.vb-device-size').textContent = `${state.canvas.breakpoint}px`;
  });

  return area;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';

  const target = e.target.closest('.vb-canvas, .vb-node');
  if (target) {
    target.classList.add('drag-over');

    // Show drop indicator
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? 'before' : 'after';
    target.dataset.dropPosition = position;
  }
}

function handleDragLeave(e) {
  const target = e.target.closest('.vb-canvas, .vb-node');
  if (target) {
    target.classList.remove('drag-over');
    delete target.dataset.dropPosition;
  }
}

async function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest('.vb-canvas, .vb-node');
  if (target) {
    target.classList.remove('drag-over');
    delete target.dataset.dropPosition;
  }

  const componentName = e.dataTransfer.getData('component');
  if (!componentName) return;

  const canvas = document.querySelector('.vb-canvas');
  await addComponentToCanvas(componentName, canvas);
}

async function addComponentToCanvas(componentName, container) {
  const factoryName = `create${componentName.replace(/[^a-zA-Z0-9]/g, '')}`;
  const factory = generatedComponents[factoryName];

  if (!factory) {
    console.error(`Component factory not found: ${factoryName}`);
    return;
  }

  // Create node
  const node = new BuilderNode(componentName);
  state.canvas.nodes.push(node);

  // Create element
  const wrapper = dom.create('div', {
    className: 'vb-node',
    dataset: { nodeId: node.id, nodeType: componentName }
  });

  try {
    const element = factory({});
    wrapper.appendChild(element);
  } catch (err) {
    console.error(`Failed to create component ${componentName}:`, err);
    wrapper.innerHTML = `<div class="vb-node-error">Failed to render ${componentName}</div>`;
  }

  // Add builder controls
  const controls = dom.create('div', { className: 'vb-node-controls' });
  controls.innerHTML = `
    <button class="vb-node-action" data-action="move" title="Move">\u2630</button>
    <button class="vb-node-action" data-action="duplicate" title="Duplicate">\u2398</button>
    <button class="vb-node-action" data-action="delete" title="Delete">\u2715</button>
  `;
  wrapper.appendChild(controls);

  // Click to select
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!e.target.classList.contains('vb-node-action')) {
      selectNode(node);
    }
  });

  // Handle action buttons
  controls.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'delete') {
      deleteNode(node);
    } else if (action === 'duplicate') {
      duplicateNode(node);
    }
  });

  container.appendChild(wrapper);
  container.dataset.empty = 'false';

  // Push to history
  pushHistory();

  // Select the new node
  selectNode(node);

  events.emit('builder:component-added', { node, element: wrapper });
}

// ============================================
// RIGHT PANEL - Properties & Styles
// ============================================

function createRightPanel() {
  const panel = dom.create('div', { className: 'vb-right-panel' });

  // Panel header with tabs
  const header = dom.create('div', { className: 'vb-panel-header' });
  const tabs = ['style', 'settings', 'data', 'events'];
  tabs.forEach(tab => {
    const tabBtn = dom.create('button', {
      className: `vb-panel-tab ${tab === state.ui.rightPanelTab ? 'active' : ''}`,
      onClick: () => {
        state.ui.rightPanelTab = tab;
        updateRightPanelTabs();
      }
    }, tab.charAt(0).toUpperCase() + tab.slice(1));
    tabBtn.dataset.tab = tab;
    header.appendChild(tabBtn);
  });
  panel.appendChild(header);

  function updateRightPanelTabs() {
    panel.querySelectorAll('.vb-panel-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === state.ui.rightPanelTab);
    });
    panel.querySelectorAll('.vb-panel-content').forEach(c => {
      c.classList.toggle('active', c.dataset.tab === state.ui.rightPanelTab);
    });
  }

  // Style Tab
  panel.appendChild(createStylePanel());

  // Settings Tab
  panel.appendChild(createSettingsPanel());

  // Data Tab
  panel.appendChild(createDataPanel());

  // Events Tab
  panel.appendChild(createEventsPanel());

  return panel;
}

function createStylePanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content active',
    dataset: { tab: 'style' }
  });

  const placeholder = dom.create('div', { className: 'vb-panel-placeholder' });
  placeholder.innerHTML = `
    <div class="vb-placeholder-icon">\u{1F3A8}</div>
    <div class="vb-placeholder-text">Select a component to edit styles</div>
  `;
  content.appendChild(placeholder);

  const editor = dom.create('div', { className: 'vb-style-editor', style: { display: 'none' } });

  // Layout section
  editor.appendChild(createStyleSection('Layout', [
    { type: 'select', label: 'Display', prop: 'display', options: ['block', 'flex', 'grid', 'inline', 'inline-block', 'none'] },
    { type: 'select', label: 'Position', prop: 'position', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
    { type: 'fourSide', label: 'Margin', prop: 'margin' },
    { type: 'fourSide', label: 'Padding', prop: 'padding' }
  ]));

  // Sizing section
  editor.appendChild(createStyleSection('Size', [
    { type: 'size', label: 'Width', prop: 'width' },
    { type: 'size', label: 'Height', prop: 'height' },
    { type: 'size', label: 'Min Width', prop: 'minWidth' },
    { type: 'size', label: 'Max Width', prop: 'maxWidth' }
  ]));

  // Typography section
  editor.appendChild(createStyleSection('Typography', [
    { type: 'font', label: 'Font Family', prop: 'fontFamily' },
    { type: 'size', label: 'Font Size', prop: 'fontSize' },
    { type: 'select', label: 'Font Weight', prop: 'fontWeight', options: ['300', '400', '500', '600', '700', '800'] },
    { type: 'color', label: 'Color', prop: 'color' },
    { type: 'size', label: 'Line Height', prop: 'lineHeight' },
    { type: 'size', label: 'Letter Spacing', prop: 'letterSpacing' },
    { type: 'select', label: 'Text Align', prop: 'textAlign', options: ['left', 'center', 'right', 'justify'] }
  ]));

  // Background section
  editor.appendChild(createStyleSection('Background', [
    { type: 'color', label: 'Color', prop: 'backgroundColor' },
    { type: 'image', label: 'Image', prop: 'backgroundImage' },
    { type: 'select', label: 'Size', prop: 'backgroundSize', options: ['auto', 'cover', 'contain'] },
    { type: 'select', label: 'Position', prop: 'backgroundPosition', options: ['center', 'top', 'bottom', 'left', 'right'] },
    { type: 'select', label: 'Repeat', prop: 'backgroundRepeat', options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'] }
  ]));

  // Border section
  editor.appendChild(createStyleSection('Border', [
    { type: 'size', label: 'Width', prop: 'borderWidth' },
    { type: 'select', label: 'Style', prop: 'borderStyle', options: ['none', 'solid', 'dashed', 'dotted', 'double'] },
    { type: 'color', label: 'Color', prop: 'borderColor' },
    { type: 'size', label: 'Radius', prop: 'borderRadius' }
  ]));

  // Effects section
  editor.appendChild(createStyleSection('Effects', [
    { type: 'range', label: 'Opacity', prop: 'opacity', min: 0, max: 1, step: 0.01 },
    { type: 'shadow', label: 'Box Shadow', prop: 'boxShadow' },
    { type: 'text', label: 'Transform', prop: 'transform' },
    { type: 'text', label: 'Transition', prop: 'transition' }
  ]));

  content.appendChild(editor);

  // Update when selection changes
  events.on('builder:selection-changed', (node) => {
    if (node) {
      placeholder.style.display = 'none';
      editor.style.display = 'block';
      updateStyleEditor(editor, node);
    } else {
      placeholder.style.display = 'block';
      editor.style.display = 'none';
    }
  });

  return content;
}

function createStyleSection(title, fields) {
  const section = dom.create('div', { className: 'vb-style-section' });

  const header = dom.create('div', {
    className: 'vb-style-section-header',
    onClick: () => section.classList.toggle('collapsed')
  });
  header.innerHTML = `<span class="vb-section-icon">\u25BC</span> ${title}`;
  section.appendChild(header);

  const body = dom.create('div', { className: 'vb-style-section-body' });

  fields.forEach(field => {
    const group = dom.create('div', { className: 'vb-style-group' });
    group.appendChild(dom.create('label', { className: 'vb-style-label' }, field.label));

    switch (field.type) {
      case 'text':
        group.appendChild(dom.create('input', {
          type: 'text',
          className: 'vb-style-input',
          dataset: { prop: field.prop }
        }));
        break;

      case 'size':
        const sizeGroup = dom.create('div', { className: 'vb-size-group' });
        sizeGroup.appendChild(dom.create('input', {
          type: 'number',
          className: 'vb-style-input vb-size-value',
          dataset: { prop: field.prop }
        }));
        const unitSelect = dom.create('select', { className: 'vb-size-unit' });
        ['px', '%', 'em', 'rem', 'vw', 'vh', 'auto'].forEach(unit => {
          unitSelect.appendChild(dom.create('option', { value: unit }, unit));
        });
        sizeGroup.appendChild(unitSelect);
        group.appendChild(sizeGroup);
        break;

      case 'color':
        const colorGroup = dom.create('div', { className: 'vb-color-group' });
        colorGroup.appendChild(dom.create('input', {
          type: 'color',
          className: 'vb-style-color',
          dataset: { prop: field.prop }
        }));
        colorGroup.appendChild(dom.create('input', {
          type: 'text',
          className: 'vb-style-input vb-color-text',
          dataset: { prop: field.prop },
          placeholder: '#000000'
        }));
        group.appendChild(colorGroup);
        break;

      case 'select':
        const select = dom.create('select', {
          className: 'vb-style-select',
          dataset: { prop: field.prop }
        });
        field.options.forEach(opt => {
          select.appendChild(dom.create('option', { value: opt }, opt));
        });
        group.appendChild(select);
        break;

      case 'range':
        const rangeGroup = dom.create('div', { className: 'vb-range-group' });
        rangeGroup.appendChild(dom.create('input', {
          type: 'range',
          className: 'vb-style-range',
          min: field.min,
          max: field.max,
          step: field.step,
          dataset: { prop: field.prop }
        }));
        rangeGroup.appendChild(dom.create('span', { className: 'vb-range-value' }, '1'));
        group.appendChild(rangeGroup);
        break;

      case 'fourSide':
        const fourSide = dom.create('div', { className: 'vb-four-side' });
        ['top', 'right', 'bottom', 'left'].forEach(side => {
          fourSide.appendChild(dom.create('input', {
            type: 'text',
            className: 'vb-style-input vb-four-side-input',
            placeholder: side[0].toUpperCase(),
            dataset: { prop: `${field.prop}${side.charAt(0).toUpperCase() + side.slice(1)}` }
          }));
        });
        group.appendChild(fourSide);
        break;
    }

    body.appendChild(group);
  });

  section.appendChild(body);
  return section;
}

function updateStyleEditor(editor, node) {
  const device = state.canvas.device;
  const styles = node.styles[device] || {};

  editor.querySelectorAll('[data-prop]').forEach(input => {
    const prop = input.dataset.prop;
    const value = styles[prop] || '';

    if (input.type === 'color') {
      input.value = value || '#000000';
    } else if (input.type === 'range') {
      input.value = value || input.max || 1;
      const display = input.parentElement.querySelector('.vb-range-value');
      if (display) display.textContent = input.value;
    } else {
      input.value = value;
    }

    // Add change listener
    input.onchange = input.oninput = () => {
      applyStyle(node, prop, input.value);
    };
  });
}

function applyStyle(node, prop, value) {
  const device = state.canvas.device;
  if (!node.styles[device]) {
    node.styles[device] = {};
  }
  node.styles[device][prop] = value;

  // Apply to element
  const element = document.querySelector(`[data-node-id="${node.id}"]`);
  if (element) {
    element.style[prop] = value;
  }

  pushHistory();
  events.emit('builder:style-changed', { node, prop, value });
}

function createSettingsPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content',
    dataset: { tab: 'settings' }
  });

  content.innerHTML = `
    <div class="vb-panel-placeholder">
      <div class="vb-placeholder-icon">\u2699</div>
      <div class="vb-placeholder-text">Select a component to edit settings</div>
    </div>
  `;

  return content;
}

function createDataPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content',
    dataset: { tab: 'data' }
  });

  // Data bindings section
  const bindingsSection = dom.create('div', { className: 'vb-data-section' });
  bindingsSection.innerHTML = `
    <div class="vb-section-header">
      <span>Data Bindings</span>
      <button class="vb-add-btn">+ Add</button>
    </div>
    <div class="vb-section-body">
      <div class="vb-empty-state-small">No data bindings configured</div>
    </div>
  `;
  content.appendChild(bindingsSection);

  // API endpoints section
  const apiSection = dom.create('div', { className: 'vb-data-section' });
  apiSection.innerHTML = `
    <div class="vb-section-header">
      <span>API Endpoints</span>
      <button class="vb-add-btn" onclick="showApiManager()">+ Add</button>
    </div>
    <div class="vb-section-body">
      <div class="vb-empty-state-small">No API endpoints configured</div>
    </div>
  `;
  content.appendChild(apiSection);

  // Variables section
  const varsSection = dom.create('div', { className: 'vb-data-section' });
  varsSection.innerHTML = `
    <div class="vb-section-header">
      <span>Variables</span>
      <button class="vb-add-btn">+ Add</button>
    </div>
    <div class="vb-section-body">
      <div class="vb-empty-state-small">No variables defined</div>
    </div>
  `;
  content.appendChild(varsSection);

  return content;
}

function createEventsPanel() {
  const content = dom.create('div', {
    className: 'vb-panel-content',
    dataset: { tab: 'events' }
  });

  content.innerHTML = `
    <div class="vb-panel-placeholder">
      <div class="vb-placeholder-icon">\u26A1</div>
      <div class="vb-placeholder-text">Select a component to add events</div>
    </div>
  `;

  return content;
}

// ============================================
// BOTTOM PANEL - Console/Debug
// ============================================

function createBottomPanel() {
  const panel = dom.create('div', {
    className: 'vb-bottom-panel',
    style: { display: state.ui.bottomPanelOpen ? 'flex' : 'none' }
  });

  const header = dom.create('div', { className: 'vb-panel-header' });

  ['console', 'network', 'performance'].forEach(tab => {
    const tabBtn = dom.create('button', {
      className: `vb-panel-tab ${tab === state.ui.bottomPanelTab ? 'active' : ''}`,
      onClick: () => {
        state.ui.bottomPanelTab = tab;
        // Update tabs
      }
    }, tab.charAt(0).toUpperCase() + tab.slice(1));
    header.appendChild(tabBtn);
  });

  const closeBtn = dom.create('button', {
    className: 'vb-panel-close',
    onClick: () => {
      state.ui.bottomPanelOpen = false;
      panel.style.display = 'none';
    }
  }, '\u00D7');
  header.appendChild(closeBtn);

  panel.appendChild(header);

  const consoleContent = dom.create('div', { className: 'vb-console' });
  consoleContent.innerHTML = `
    <div class="vb-console-entry info">\u2139 verenajs Builder v2.0.0 initialized</div>
    <div class="vb-console-entry">\u2713 ${getComponentCount()} components loaded</div>
  `;
  panel.appendChild(consoleContent);

  return panel;
}

// ============================================
// NODE OPERATIONS
// ============================================

function selectNode(node) {
  state.canvas.selectedNode = node;

  // Update visual selection
  document.querySelectorAll('.vb-node.selected').forEach(el => el.classList.remove('selected'));
  if (node) {
    const element = document.querySelector(`[data-node-id="${node.id}"]`);
    if (element) element.classList.add('selected');
  }

  events.emit('builder:selection-changed', node);
}

function deleteNode(node) {
  const element = document.querySelector(`[data-node-id="${node.id}"]`);
  if (element) element.remove();

  const index = state.canvas.nodes.findIndex(n => n.id === node.id);
  if (index !== -1) {
    state.canvas.nodes.splice(index, 1);
  }

  if (state.canvas.selectedNode?.id === node.id) {
    selectNode(null);
  }

  pushHistory();
  events.emit('builder:nodes-changed');
}

function duplicateNode(node) {
  const cloned = node.clone();
  cloned.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const index = state.canvas.nodes.findIndex(n => n.id === node.id);
  state.canvas.nodes.splice(index + 1, 0, cloned);

  // Re-render canvas
  const canvas = document.querySelector('.vb-canvas');
  addComponentToCanvas(cloned.type, canvas);

  pushHistory();
  events.emit('builder:nodes-changed');
}

// ============================================
// HISTORY MANAGEMENT
// ============================================

function pushHistory() {
  const snapshot = JSON.stringify(state.canvas.nodes.map(n => n.toJSON()));

  state.history.past.push(snapshot);
  state.history.future = [];

  if (state.history.past.length > state.history.maxSize) {
    state.history.past.shift();
  }
}

function undo() {
  if (state.history.past.length === 0) return;

  const current = JSON.stringify(state.canvas.nodes.map(n => n.toJSON()));
  state.history.future.push(current);

  const previous = state.history.past.pop();
  restoreFromSnapshot(previous);
}

function redo() {
  if (state.history.future.length === 0) return;

  const current = JSON.stringify(state.canvas.nodes.map(n => n.toJSON()));
  state.history.past.push(current);

  const next = state.history.future.pop();
  restoreFromSnapshot(next);
}

function restoreFromSnapshot(snapshot) {
  const data = JSON.parse(snapshot);
  state.canvas.nodes = data.map(json => BuilderNode.fromJSON(json));
  rerenderCanvas();
  events.emit('builder:history-restored');
}

function rerenderCanvas() {
  const canvas = document.querySelector('.vb-canvas');
  if (!canvas) return;

  // Clear existing nodes
  canvas.querySelectorAll('.vb-node').forEach(el => el.remove());

  // Re-add all nodes
  state.canvas.nodes.forEach(node => {
    addComponentToCanvas(node.type, canvas);
  });

  canvas.dataset.empty = state.canvas.nodes.length === 0 ? 'true' : 'false';
}

// ============================================
// ZOOM & VIEW
// ============================================

function setZoom(level) {
  state.canvas.zoom = level;
  const frame = document.querySelector('.vb-canvas-frame');
  if (frame) {
    frame.style.transform = `scale(${level})`;
  }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function initKeyboardShortcuts(builder) {
  document.addEventListener('keydown', (e) => {
    // Only handle when builder is active
    if (!builder.contains(document.activeElement) && document.activeElement.tagName !== 'BODY') {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    // Undo: Ctrl/Cmd + Z
    if (cmdKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((cmdKey && e.key === 'z' && e.shiftKey) || (cmdKey && e.key === 'y')) {
      e.preventDefault();
      redo();
    }

    // Save: Ctrl/Cmd + S
    if (cmdKey && e.key === 's') {
      e.preventDefault();
      saveProject();
    }

    // Copy: Ctrl/Cmd + C
    if (cmdKey && e.key === 'c' && state.canvas.selectedNode) {
      e.preventDefault();
      state.canvas.clipboard = state.canvas.selectedNode.clone();
    }

    // Paste: Ctrl/Cmd + V
    if (cmdKey && e.key === 'v' && state.canvas.clipboard) {
      e.preventDefault();
      const pasted = state.canvas.clipboard.clone();
      state.canvas.nodes.push(pasted);
      const canvas = document.querySelector('.vb-canvas');
      addComponentToCanvas(pasted.type, canvas);
    }

    // Delete: Delete or Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.canvas.selectedNode) {
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        deleteNode(state.canvas.selectedNode);
      }
    }

    // Escape: Deselect
    if (e.key === 'Escape') {
      selectNode(null);
    }

    // Duplicate: Ctrl/Cmd + D
    if (cmdKey && e.key === 'd' && state.canvas.selectedNode) {
      e.preventDefault();
      duplicateNode(state.canvas.selectedNode);
    }
  });
}

// ============================================
// DRAG AND DROP
// ============================================

function initDragAndDrop(builder) {
  // Already initialized in component items and canvas
}

// ============================================
// SAVE & EXPORT
// ============================================

function saveProject() {
  const project = {
    ...state.project,
    pages: state.project.pages.map(page => ({
      ...page,
      nodes: page.id === state.project.currentPage
        ? state.canvas.nodes.map(n => n.toJSON())
        : page.nodes
    })),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(`verenajs-project-${project.name}`, JSON.stringify(project));

  // Show toast
  showToast('Project saved!', 'success');

  events.emit('builder:project-saved', project);
}

function showExportDialog() {
  const modal = createModal({
    title: 'Export Project',
    size: 'medium',
    content: createExportOptions()
  });
  document.body.appendChild(modal);
}

function createExportOptions() {
  const container = dom.create('div', { className: 'vb-export-options' });

  const options = [
    { id: 'html', icon: '\u{1F4C4}', label: 'HTML/CSS/JS', desc: 'Static website files' },
    { id: 'react', icon: '\u269B', label: 'React', desc: 'React components' },
    { id: 'vue', icon: '\u{1F49A}', label: 'Vue', desc: 'Vue components' },
    { id: 'verena', icon: '\u{1F4E6}', label: 'verenajs', desc: 'Native verenajs code' },
    { id: 'json', icon: '{}', label: 'JSON', desc: 'Project data' }
  ];

  options.forEach(opt => {
    const card = dom.create('div', {
      className: 'vb-export-option',
      onClick: () => exportAs(opt.id)
    });
    card.innerHTML = `
      <div class="vb-export-icon">${opt.icon}</div>
      <div class="vb-export-label">${opt.label}</div>
      <div class="vb-export-desc">${opt.desc}</div>
    `;
    container.appendChild(card);
  });

  return container;
}

function exportAs(format) {
  let content;
  let filename;

  switch (format) {
    case 'html':
      content = generateHtmlExport();
      filename = 'project.html';
      break;
    case 'react':
      content = generateReactExport();
      filename = 'App.jsx';
      break;
    case 'vue':
      content = generateVueExport();
      filename = 'App.vue';
      break;
    case 'verena':
      content = generateVerenaExport();
      filename = 'project.js';
      break;
    case 'json':
      content = JSON.stringify(state.project, null, 2);
      filename = 'project.json';
      break;
  }

  downloadFile(content, filename);
}

function generateHtmlExport() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.project.name}</title>
  <script type="module" src="https://unpkg.com/verenajs@2.0.0/index.js"></script>
  <style>
    ${generateStyles()}
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    ${generateVerenaExport()}
  </script>
</body>
</html>`;
}

function generateReactExport() {
  const imports = new Set();
  const components = [];

  state.canvas.nodes.forEach(node => {
    imports.add(node.type);
    components.push(nodeToReact(node));
  });

  return `import React from 'react';
import { ${Array.from(imports).join(', ')} } from 'verenajs/react';

export default function App() {
  return (
    <div className="app">
      ${components.join('\n      ')}
    </div>
  );
}`;
}

function generateVueExport() {
  const imports = new Set();
  const components = [];

  state.canvas.nodes.forEach(node => {
    imports.add(node.type);
    components.push(nodeToVue(node));
  });

  return `<template>
  <div class="app">
    ${components.join('\n    ')}
  </div>
</template>

<script setup>
import { ${Array.from(imports).join(', ')} } from 'verenajs/vue';
</script>`;
}

function generateVerenaExport() {
  const imports = new Set();
  const creates = [];

  state.canvas.nodes.forEach(node => {
    imports.add(`create${node.type}`);
    creates.push(nodeToVerena(node));
  });

  return `import { ${Array.from(imports).join(', ')} } from 'verenajs';

export function render(container) {
  ${creates.map(c => `container.appendChild(${c});`).join('\n  ')}
}

// Auto-mount
const app = document.getElementById('app');
if (app) render(app);`;
}

function generateStyles() {
  let css = '';
  state.canvas.nodes.forEach(node => {
    const styles = node.styles.desktop || {};
    if (Object.keys(styles).length > 0) {
      css += `[data-node-id="${node.id}"] { ${Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')} }\n`;
    }
  });
  return css;
}

function nodeToVerena(node, indent = '') {
  const props = Object.entries(node.props)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');

  if (node.children.length === 0) {
    return `create${node.type}({ ${props} })`;
  }

  const children = node.children.map(c => nodeToVerena(c, indent + '  ')).join(',\n' + indent + '    ');
  return `(() => {
${indent}  const el = create${node.type}({ ${props} });
${indent}  [${children}].forEach(c => el.appendChild(c));
${indent}  return el;
${indent}})()`;
}

function nodeToReact(node) {
  const props = Object.entries(node.props)
    .map(([k, v]) => `${k}={${JSON.stringify(v)}}`)
    .join(' ');

  if (node.children.length === 0) {
    return `<${node.type} ${props} />`;
  }

  const children = node.children.map(c => nodeToReact(c)).join('\n');
  return `<${node.type} ${props}>${children}</${node.type}>`;
}

function nodeToVue(node) {
  const props = Object.entries(node.props)
    .map(([k, v]) => `:${k}="${JSON.stringify(v)}"`)
    .join(' ');

  if (node.children.length === 0) {
    return `<${node.type} ${props} />`;
  }

  const children = node.children.map(c => nodeToVue(c)).join('\n');
  return `<${node.type} ${props}>${children}</${node.type}>`;
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// DEPLOY DIALOG
// ============================================

function showDeployDialog() {
  const modal = createModal({
    title: 'Deploy Project',
    size: 'large',
    content: createDeployOptions()
  });
  document.body.appendChild(modal);
}

function createDeployOptions() {
  const container = dom.create('div', { className: 'vb-deploy-options' });

  container.innerHTML = `
    <div class="vb-deploy-tabs">
      <button class="vb-deploy-tab active" data-tab="docker">Docker</button>
      <button class="vb-deploy-tab" data-tab="vercel">Vercel</button>
      <button class="vb-deploy-tab" data-tab="netlify">Netlify</button>
      <button class="vb-deploy-tab" data-tab="aws">AWS</button>
    </div>

    <div class="vb-deploy-content" data-tab="docker">
      <h3>Docker Deployment</h3>
      <p>Deploy your project using Docker containers</p>

      <div class="vb-form-group">
        <label>Image Name</label>
        <input type="text" value="${state.project.name.toLowerCase().replace(/\s+/g, '-')}" />
      </div>

      <div class="vb-form-group">
        <label>Port</label>
        <input type="number" value="3000" />
      </div>

      <div class="vb-form-group">
        <label>Environment</label>
        <select>
          <option>Production</option>
          <option>Staging</option>
          <option>Development</option>
        </select>
      </div>

      <div class="vb-code-preview">
        <pre>
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
        </pre>
      </div>

      <div class="vb-form-actions">
        <button class="vb-button vb-button-secondary">Download Dockerfile</button>
        <button class="vb-button vb-button-primary">Deploy to Docker</button>
      </div>
    </div>
  `;

  return container;
}

// ============================================
// SETTINGS DIALOG
// ============================================

function showSettings() {
  const modal = createModal({
    title: 'Builder Settings',
    size: 'large',
    content: createSettingsContent()
  });
  document.body.appendChild(modal);
}

function createSettingsContent() {
  const container = dom.create('div', { className: 'vb-settings' });

  container.innerHTML = `
    <div class="vb-settings-sidebar">
      <button class="vb-settings-nav active" data-section="general">General</button>
      <button class="vb-settings-nav" data-section="theme">Theme</button>
      <button class="vb-settings-nav" data-section="api">API Manager</button>
      <button class="vb-settings-nav" data-section="webhooks">Webhooks</button>
      <button class="vb-settings-nav" data-section="plugins">Plugins</button>
      <button class="vb-settings-nav" data-section="shortcuts">Shortcuts</button>
    </div>

    <div class="vb-settings-content">
      <div class="vb-settings-section active" data-section="general">
        <h2>General Settings</h2>

        <div class="vb-form-group">
          <label>Project Name</label>
          <input type="text" value="${state.project.name}" />
        </div>

        <div class="vb-form-group">
          <label>Auto-save</label>
          <label class="vb-switch">
            <input type="checkbox" checked />
            <span class="vb-switch-slider"></span>
          </label>
        </div>

        <div class="vb-form-group">
          <label>Show Grid</label>
          <label class="vb-switch">
            <input type="checkbox" ${state.canvas.showGrid ? 'checked' : ''} />
            <span class="vb-switch-slider"></span>
          </label>
        </div>
      </div>

      <div class="vb-settings-section" data-section="api">
        <h2>API Manager</h2>
        <p>Configure API endpoints and data sources</p>

        <button class="vb-button vb-button-primary">+ Add Endpoint</button>

        <div class="vb-api-list">
          <div class="vb-empty-state">No API endpoints configured</div>
        </div>
      </div>

      <div class="vb-settings-section" data-section="webhooks">
        <h2>Webhooks</h2>
        <p>Configure webhooks for events</p>

        <button class="vb-button vb-button-primary">+ Add Webhook</button>

        <div class="vb-webhook-list">
          <div class="vb-empty-state">No webhooks configured</div>
        </div>
      </div>

      <div class="vb-settings-section" data-section="plugins">
        <h2>Plugins</h2>
        <p>Extend builder functionality with plugins</p>

        <div class="vb-plugin-grid">
          <div class="vb-plugin-card">
            <div class="vb-plugin-icon">\u{1F4CA}</div>
            <div class="vb-plugin-name">Analytics</div>
            <div class="vb-plugin-desc">Add analytics tracking</div>
            <button class="vb-button vb-button-small">Install</button>
          </div>

          <div class="vb-plugin-card">
            <div class="vb-plugin-icon">\u{1F512}</div>
            <div class="vb-plugin-name">Auth</div>
            <div class="vb-plugin-desc">Authentication components</div>
            <button class="vb-button vb-button-small">Install</button>
          </div>

          <div class="vb-plugin-card">
            <div class="vb-plugin-icon">\u{1F4B3}</div>
            <div class="vb-plugin-name">Payments</div>
            <div class="vb-plugin-desc">Stripe & PayPal integration</div>
            <button class="vb-button vb-button-small">Install</button>
          </div>

          <div class="vb-plugin-card">
            <div class="vb-plugin-icon">\u{1F4E7}</div>
            <div class="vb-plugin-name">Email</div>
            <div class="vb-plugin-desc">Email sending & templates</div>
            <button class="vb-button vb-button-small">Install</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  container.querySelectorAll('.vb-settings-nav').forEach(nav => {
    nav.addEventListener('click', () => {
      container.querySelectorAll('.vb-settings-nav').forEach(n => n.classList.remove('active'));
      container.querySelectorAll('.vb-settings-section').forEach(s => s.classList.remove('active'));
      nav.classList.add('active');
      container.querySelector(`.vb-settings-section[data-section="${nav.dataset.section}"]`)?.classList.add('active');
    });
  });

  return container;
}

// ============================================
// UTILITIES
// ============================================

function createModal(options) {
  const overlay = dom.create('div', { className: 'vb-modal-overlay' });

  const modal = dom.create('div', {
    className: `vb-modal vb-modal-${options.size || 'medium'}`
  });

  const header = dom.create('div', { className: 'vb-modal-header' });
  header.appendChild(dom.create('h2', { className: 'vb-modal-title' }, options.title));
  header.appendChild(dom.create('button', {
    className: 'vb-modal-close',
    onClick: () => overlay.remove()
  }, '\u00D7'));
  modal.appendChild(header);

  const body = dom.create('div', { className: 'vb-modal-body' });
  if (options.content instanceof Node) {
    body.appendChild(options.content);
  } else {
    body.innerHTML = options.content;
  }
  modal.appendChild(body);

  if (options.footer) {
    const footer = dom.create('div', { className: 'vb-modal-footer' });
    if (options.footer instanceof Node) {
      footer.appendChild(options.footer);
    } else {
      footer.innerHTML = options.footer;
    }
    modal.appendChild(footer);
  }

  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  return overlay;
}

function showToast(message, type = 'info') {
  const toast = dom.create('div', {
    className: `vb-toast vb-toast-${type}`
  }, message);

  let container = document.querySelector('.vb-toast-container');
  if (!container) {
    container = dom.create('div', { className: 'vb-toast-container' });
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('dismissed');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// BUILDER STYLES
// ============================================

const BUILDER_STYLES = `
/* Advanced Builder Styles */
.vb-advanced {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--vb-bg, #0f172a);
  color: var(--vb-text, #e2e8f0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  z-index: 9999;
}

/* Toolbar */
.vb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 1rem;
  background: var(--vb-surface, #1e293b);
  border-bottom: 1px solid var(--vb-border, #334155);
}

.vb-toolbar-left,
.vb-toolbar-center,
.vb-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vb-logo {
  font-weight: 700;
  font-size: 1rem;
  color: var(--vb-primary, #3b82f6);
  margin-right: 1rem;
}

.vb-project-name {
  background: transparent;
  border: 1px solid transparent;
  color: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.vb-project-name:hover,
.vb-project-name:focus {
  border-color: var(--vb-border, #334155);
  background: var(--vb-bg, #0f172a);
  outline: none;
}

.vb-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s ease;
}

.vb-toolbar-btn:hover {
  background: var(--vb-border, #334155);
  color: var(--vb-text, #e2e8f0);
}

.vb-toolbar-btn.active {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--vb-border, #334155);
  margin: 0 0.5rem;
}

.vb-zoom-select {
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  color: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* Main Layout */
.vb-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Left Panel */
.vb-left-panel {
  width: 280px;
  background: var(--vb-surface, #1e293b);
  border-right: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Right Panel */
.vb-right-panel {
  width: 320px;
  background: var(--vb-surface, #1e293b);
  border-left: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Panel Header */
.vb-panel-header {
  display: flex;
  border-bottom: 1px solid var(--vb-border, #334155);
  background: var(--vb-bg, #0f172a);
}

.vb-panel-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--vb-text-muted, #94a3b8);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 2px solid transparent;
}

.vb-panel-tab:hover {
  color: var(--vb-text, #e2e8f0);
}

.vb-panel-tab.active {
  color: var(--vb-primary, #3b82f6);
  border-bottom-color: var(--vb-primary, #3b82f6);
}

/* Panel Content */
.vb-panel-content {
  display: none;
  flex: 1;
  overflow-y: auto;
}

.vb-panel-content.active {
  display: flex;
  flex-direction: column;
}

/* Search */
.vb-search {
  margin: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.375rem;
  color: inherit;
  font-size: 0.875rem;
}

.vb-search:focus {
  outline: none;
  border-color: var(--vb-primary, #3b82f6);
}

/* Categories */
.vb-categories {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.75rem 0.75rem;
}

.vb-category {
  margin-bottom: 0.5rem;
}

.vb-category.collapsed .vb-component-list {
  display: none;
}

.vb-category.collapsed .vb-category-icon {
  transform: rotate(-90deg);
}

.vb-category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vb-text-muted, #94a3b8);
}

.vb-category-header:hover {
  background: var(--vb-border, #334155);
}

.vb-category-icon {
  font-size: 0.625rem;
  transition: transform 0.15s ease;
}

.vb-category-name {
  flex: 1;
}

.vb-category-count {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: var(--vb-bg, #0f172a);
  border-radius: 9999px;
}

/* Component List */
.vb-component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.vb-component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.375rem;
  cursor: grab;
  transition: all 0.15s ease;
  font-size: 0.75rem;
  text-align: center;
}

.vb-component-item:hover {
  border-color: var(--vb-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.vb-component-item.dragging {
  opacity: 0.5;
}

.vb-component-icon {
  font-size: 1.25rem;
  color: var(--vb-primary, #3b82f6);
}

.vb-component-name {
  color: var(--vb-text, #e2e8f0);
  word-break: break-word;
}

/* Canvas Area */
.vb-canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--vb-bg, #0f172a);
  overflow: hidden;
}

.vb-canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--vb-surface, #1e293b);
  border-bottom: 1px solid var(--vb-border, #334155);
  font-size: 0.75rem;
  color: var(--vb-text-muted, #94a3b8);
}

.vb-canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.02) 20px,
    rgba(255,255,255,0.02) 21px
  ),
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.02) 20px,
    rgba(255,255,255,0.02) 21px
  );
}

.vb-canvas-frame {
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.vb-device-desktop {
  width: 1200px;
  min-height: 800px;
}

.vb-device-tablet {
  width: 768px;
  min-height: 1024px;
}

.vb-device-mobile {
  width: 375px;
  min-height: 667px;
  border-radius: 2rem;
}

.vb-canvas {
  min-height: 100%;
  padding: 1rem;
  position: relative;
}

.vb-canvas[data-empty="true"] {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.vb-empty-state {
  text-align: center;
  color: #64748b;
}

.vb-empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.vb-empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

.vb-empty-text {
  font-size: 0.875rem;
}

/* Canvas Node */
.vb-node {
  position: relative;
  cursor: pointer;
  transition: outline 0.15s ease;
}

.vb-node:hover {
  outline: 2px dashed rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

.vb-node.selected {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.vb-node.drag-over {
  outline: 2px dashed #22c55e;
}

.vb-node-controls {
  position: absolute;
  top: -32px;
  right: 0;
  display: none;
  gap: 2px;
  background: #1e293b;
  border-radius: 0.25rem;
  padding: 2px;
}

.vb-node.selected .vb-node-controls,
.vb-node:hover .vb-node-controls {
  display: flex;
}

.vb-node-action {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.vb-node-action:hover {
  background: #334155;
  color: white;
}

/* Style Editor */
.vb-style-editor {
  padding: 0.75rem;
}

.vb-style-section {
  margin-bottom: 0.5rem;
  background: var(--vb-bg, #0f172a);
  border-radius: 0.375rem;
  overflow: hidden;
}

.vb-style-section.collapsed .vb-style-section-body {
  display: none;
}

.vb-style-section.collapsed .vb-section-icon {
  transform: rotate(-90deg);
}

.vb-style-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vb-text, #e2e8f0);
}

.vb-style-section-header:hover {
  background: var(--vb-border, #334155);
}

.vb-section-icon {
  font-size: 0.625rem;
  transition: transform 0.15s ease;
}

.vb-style-section-body {
  padding: 0 0.75rem 0.75rem;
}

.vb-style-group {
  margin-bottom: 0.75rem;
}

.vb-style-label {
  display: block;
  font-size: 0.75rem;
  color: var(--vb-text-muted, #94a3b8);
  margin-bottom: 0.25rem;
}

.vb-style-input,
.vb-style-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  background: var(--vb-surface, #1e293b);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.25rem;
  color: inherit;
  font-size: 0.75rem;
}

.vb-style-input:focus,
.vb-style-select:focus {
  outline: none;
  border-color: var(--vb-primary, #3b82f6);
}

.vb-size-group,
.vb-color-group {
  display: flex;
  gap: 0.25rem;
}

.vb-size-value {
  flex: 1;
}

.vb-size-unit {
  width: 60px;
}

.vb-color-group .vb-style-color {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.vb-color-text {
  flex: 1;
}

.vb-four-side {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;
}

.vb-four-side-input {
  text-align: center;
  padding: 0.375rem 0.25rem;
}

.vb-range-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vb-style-range {
  flex: 1;
}

.vb-range-value {
  font-size: 0.75rem;
  color: var(--vb-text-muted, #94a3b8);
  min-width: 2rem;
  text-align: right;
}

/* Layers */
.vb-layers-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.vb-layer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.vb-layer-item:hover {
  background: var(--vb-border, #334155);
}

.vb-layer-item.selected {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-layer-expand {
  width: 12px;
  font-size: 0.5rem;
}

.vb-layer-expand.hidden {
  visibility: hidden;
}

.vb-layer-icon {
  color: var(--vb-primary, #3b82f6);
}

.vb-layer-name {
  flex: 1;
}

.vb-layer-type {
  font-size: 0.625rem;
  color: var(--vb-text-muted, #64748b);
}

.vb-layer-actions {
  display: none;
  gap: 0.25rem;
}

.vb-layer-item:hover .vb-layer-actions {
  display: flex;
}

.vb-layer-action {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.75rem;
  opacity: 0.6;
}

.vb-layer-action:hover {
  opacity: 1;
}

/* Pages */
.vb-pages-header {
  padding: 0.75rem;
}

.vb-add-page-btn {
  width: 100%;
  padding: 0.5rem;
  background: var(--vb-bg, #0f172a);
  border: 1px dashed var(--vb-border, #334155);
  border-radius: 0.375rem;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  font-size: 0.75rem;
}

.vb-add-page-btn:hover {
  border-color: var(--vb-primary, #3b82f6);
  color: var(--vb-primary, #3b82f6);
}

.vb-pages-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.75rem;
}

.vb-page-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.vb-page-item:hover {
  background: var(--vb-border, #334155);
}

.vb-page-item.active {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-page-icon {
  font-size: 1.25rem;
}

.vb-page-name {
  flex: 1;
  font-weight: 500;
}

.vb-page-path {
  font-size: 0.75rem;
  color: var(--vb-text-muted, #64748b);
}

.vb-page-item.active .vb-page-path {
  color: rgba(255,255,255,0.7);
}

/* Bottom Panel */
.vb-bottom-panel {
  height: 200px;
  background: var(--vb-surface, #1e293b);
  border-top: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
}

.vb-panel-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  padding: 0.5rem;
}

.vb-console {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
}

.vb-console-entry {
  padding: 0.25rem 0.5rem;
}

.vb-console-entry.info {
  color: var(--vb-primary, #3b82f6);
}

.vb-console-entry.error {
  color: var(--vb-error, #ef4444);
}

/* Modal */
.vb-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.vb-modal {
  background: var(--vb-surface, #1e293b);
  border-radius: 0.75rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vb-modal-small { width: 400px; }
.vb-modal-medium { width: 600px; }
.vb-modal-large { width: 900px; }

.vb-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vb-border, #334155);
}

.vb-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.vb-modal-close {
  background: none;
  border: none;
  color: var(--vb-text-muted, #94a3b8);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.vb-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.vb-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--vb-border, #334155);
}

/* Export Options */
.vb-export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.vb-export-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vb-export-option:hover {
  border-color: var(--vb-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.vb-export-icon {
  font-size: 2rem;
}

.vb-export-label {
  font-weight: 600;
}

.vb-export-desc {
  font-size: 0.75rem;
  color: var(--vb-text-muted, #94a3b8);
}

/* Settings */
.vb-settings {
  display: flex;
  gap: 1.5rem;
  min-height: 500px;
}

.vb-settings-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vb-settings-nav {
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.vb-settings-nav:hover {
  background: var(--vb-border, #334155);
}

.vb-settings-nav.active {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-settings-content {
  flex: 1;
}

.vb-settings-section {
  display: none;
}

.vb-settings-section.active {
  display: block;
}

.vb-settings-section h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.vb-form-group {
  margin-bottom: 1rem;
}

.vb-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--vb-text-muted, #94a3b8);
}

.vb-form-group input,
.vb-form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.375rem;
  color: inherit;
}

/* Switch */
.vb-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.vb-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.vb-switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--vb-border, #334155);
  border-radius: 24px;
  transition: 0.2s;
}

.vb-switch-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.vb-switch input:checked + .vb-switch-slider {
  background: var(--vb-primary, #3b82f6);
}

.vb-switch input:checked + .vb-switch-slider::before {
  transform: translateX(20px);
}

/* Plugins */
.vb-plugin-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.vb-plugin-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: var(--vb-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 0.5rem;
  text-align: center;
}

.vb-plugin-icon {
  font-size: 2rem;
}

.vb-plugin-name {
  font-weight: 600;
}

.vb-plugin-desc {
  font-size: 0.75rem;
  color: var(--vb-text-muted, #94a3b8);
}

/* Buttons */
.vb-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vb-button-primary {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-button-primary:hover {
  background: #2563eb;
}

.vb-button-secondary {
  background: var(--vb-border, #334155);
  color: var(--vb-text, #e2e8f0);
}

.vb-button-secondary:hover {
  background: #475569;
}

.vb-button-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Toast */
.vb-toast-container {
  position: fixed;
  top: 60px;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10001;
}

.vb-toast {
  padding: 0.75rem 1rem;
  background: var(--vb-surface, #1e293b);
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  animation: vb-toast-in 0.2s ease;
}

.vb-toast.dismissed {
  animation: vb-toast-out 0.2s ease forwards;
}

.vb-toast-success {
  border-left: 4px solid var(--vb-success, #22c55e);
}

.vb-toast-error {
  border-left: 4px solid var(--vb-error, #ef4444);
}

@keyframes vb-toast-in {
  from { opacity: 0; transform: translateX(100%); }
}

@keyframes vb-toast-out {
  to { opacity: 0; transform: translateX(100%); }
}

/* Placeholder */
.vb-panel-placeholder,
.vb-empty-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--vb-text-muted, #64748b);
}

.vb-placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.vb-placeholder-text {
  font-size: 0.875rem;
}

/* Data Section */
.vb-data-section {
  margin-bottom: 1rem;
}

.vb-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--vb-bg, #0f172a);
  border-radius: 0.375rem 0.375rem 0 0;
  font-weight: 600;
  font-size: 0.875rem;
}

.vb-section-body {
  padding: 0.75rem;
  background: var(--vb-bg, #0f172a);
  border-radius: 0 0 0.375rem 0.375rem;
  margin-top: 1px;
}

.vb-add-btn {
  background: none;
  border: none;
  color: var(--vb-primary, #3b82f6);
  cursor: pointer;
  font-size: 0.75rem;
}

.vb-add-btn:hover {
  text-decoration: underline;
}

/* Deploy content */
.vb-deploy-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.vb-deploy-tab {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--vb-border, #334155);
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  border-radius: 0.375rem;
}

.vb-deploy-tab.active {
  background: var(--vb-primary, #3b82f6);
  border-color: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-code-preview {
  background: var(--vb-bg, #0f172a);
  border-radius: 0.375rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.vb-code-preview pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
}

.vb-form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
`;

// ============================================
// EXPORTS
// ============================================

export {
  createAdvancedBuilder,
  BuilderState,
  BuilderNode,
  state
};

export default createAdvancedBuilder;
