/**
 * verenajs Visual Builder
 * Zero-configuration drag-and-drop component builder
 * Available automatically when verenajs is installed
 */

import { dom, events, theme, injectStyle } from '../core/core.js';
import { getComponentNames, getComponentsByCategory, getCategories, loadComponent } from '../core/registry.js';
import { createBuilderChannel } from '../core/zeromq.js';
import { builderStyles } from './styles.js';

// Builder State
const builderState = {
  isOpen: false,
  selectedComponent: null,
  componentTree: [],
  draggedComponent: null,
  zoom: 1,
  showGrid: true,
  mode: 'edit', // 'edit' | 'preview' | 'code'
  history: [],
  historyIndex: -1
};

/**
 * Component Tree Node
 */
class ComponentNode {
  constructor(type, props = {}, children = []) {
    this.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.props = props;
    this.children = children;
    this.parent = null;
  }

  addChild(node) {
    node.parent = this;
    this.children.push(node);
    return this;
  }

  removeChild(nodeId) {
    const index = this.children.findIndex(c => c.id === nodeId);
    if (index !== -1) {
      this.children[index].parent = null;
      this.children.splice(index, 1);
    }
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      props: this.props,
      children: this.children.map(c => c.toJSON())
    };
  }

  static fromJSON(json, parent = null) {
    const node = new ComponentNode(json.type, json.props);
    node.id = json.id;
    node.parent = parent;
    node.children = (json.children || []).map(c => ComponentNode.fromJSON(c, node));
    return node;
  }
}

/**
 * Component Palette - Shows available components
 */
function createPalette() {
  const palette = dom.create('div', { className: 'vb-palette' });

  const header = dom.create('div', { className: 'vb-palette-header' },
    dom.create('span', {}, 'Components'),
    dom.create('input', {
      type: 'search',
      placeholder: 'Search...',
      className: 'vb-search'
    })
  );

  const categories = dom.create('div', { className: 'vb-categories' });

  // Group components by category
  getCategories().forEach(category => {
    const section = dom.create('div', { className: 'vb-category' });
    const sectionHeader = dom.create('div', {
      className: 'vb-category-header',
      onClick: () => section.classList.toggle('collapsed')
    }, category);

    const componentList = dom.create('div', { className: 'vb-component-list' });

    getComponentsByCategory(category).forEach(name => {
      const item = dom.create('div', {
        className: 'vb-component-item',
        draggable: 'true',
        dataset: { component: name }
      }, name);

      item.addEventListener('dragstart', (e) => {
        builderState.draggedComponent = name;
        e.dataTransfer.setData('text/plain', name);
        e.dataTransfer.effectAllowed = 'copy';
      });

      item.addEventListener('dragend', () => {
        builderState.draggedComponent = null;
      });

      componentList.appendChild(item);
    });

    section.appendChild(sectionHeader);
    section.appendChild(componentList);
    categories.appendChild(section);
  });

  // Search functionality
  header.querySelector('input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    categories.querySelectorAll('.vb-component-item').forEach(item => {
      const name = item.dataset.component.toLowerCase();
      item.style.display = name.includes(query) ? '' : 'none';
    });
  });

  palette.appendChild(header);
  palette.appendChild(categories);
  return palette;
}

/**
 * Canvas - Main workspace for building
 */
function createCanvas() {
  const canvas = dom.create('div', { className: 'vb-canvas' });

  const toolbar = dom.create('div', { className: 'vb-canvas-toolbar' },
    dom.create('button', {
      className: 'vb-tool-btn',
      title: 'Undo',
      onClick: () => undo()
    }, '\u21A9'),
    dom.create('button', {
      className: 'vb-tool-btn',
      title: 'Redo',
      onClick: () => redo()
    }, '\u21AA'),
    dom.create('span', { className: 'vb-divider' }),
    dom.create('button', {
      className: 'vb-tool-btn',
      title: 'Toggle Grid',
      onClick: () => toggleGrid()
    }, '\u229E'),
    dom.create('select', {
      className: 'vb-zoom-select',
      onChange: (e) => setZoom(parseFloat(e.target.value))
    },
      dom.create('option', { value: '0.5' }, '50%'),
      dom.create('option', { value: '0.75' }, '75%'),
      dom.create('option', { value: '1', selected: true }, '100%'),
      dom.create('option', { value: '1.25' }, '125%'),
      dom.create('option', { value: '1.5' }, '150%')
    ),
    dom.create('span', { className: 'vb-divider' }),
    dom.create('button', {
      className: 'vb-tool-btn vb-mode-edit active',
      title: 'Edit Mode',
      onClick: () => setMode('edit')
    }, '\u270E'),
    dom.create('button', {
      className: 'vb-tool-btn vb-mode-preview',
      title: 'Preview Mode',
      onClick: () => setMode('preview')
    }, '\u25B6'),
    dom.create('button', {
      className: 'vb-tool-btn vb-mode-code',
      title: 'Code View',
      onClick: () => setMode('code')
    }, '</>'),
    dom.create('span', { style: { flex: '1' } }),
    dom.create('button', {
      className: 'vb-tool-btn vb-export-btn',
      title: 'Export',
      onClick: () => exportProject()
    }, '\u2913 Export')
  );

  const workspace = dom.create('div', { className: 'vb-workspace' });
  const dropzone = dom.create('div', {
    className: 'vb-dropzone',
    dataset: { empty: 'true' }
  }, dom.create('span', { className: 'vb-dropzone-hint' }, 'Drag components here'));

  // Drop handling
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');

    const componentName = e.dataTransfer.getData('text/plain');
    if (componentName) {
      await addComponentToCanvas(componentName, dropzone);
    }
  });

  workspace.appendChild(dropzone);
  canvas.appendChild(toolbar);
  canvas.appendChild(workspace);

  return canvas;
}

/**
 * Property Inspector - Edit selected component
 */
function createInspector() {
  const inspector = dom.create('div', { className: 'vb-inspector' });

  const header = dom.create('div', { className: 'vb-inspector-header' }, 'Properties');

  const content = dom.create('div', { className: 'vb-inspector-content' });

  const placeholder = dom.create('div', { className: 'vb-inspector-empty' },
    'Select a component to edit its properties'
  );

  content.appendChild(placeholder);
  inspector.appendChild(header);
  inspector.appendChild(content);

  // Update inspector when component is selected
  events.on('builder:component-selected', (component) => {
    updateInspector(inspector, component);
  });

  return inspector;
}

/**
 * Update inspector with component properties
 */
function updateInspector(inspector, component) {
  const content = inspector.querySelector('.vb-inspector-content');
  dom.empty(content);

  if (!component) {
    content.appendChild(dom.create('div', { className: 'vb-inspector-empty' },
      'Select a component to edit its properties'
    ));
    return;
  }

  // Component name header
  content.appendChild(dom.create('div', { className: 'vb-prop-header' }, component.type));

  // ID field
  const idGroup = createPropGroup('ID', 'text', component.id, (value) => {
    // ID is read-only for now
  }, true);
  content.appendChild(idGroup);

  // Dynamic props based on component type
  const props = component.props || {};
  Object.entries(props).forEach(([key, value]) => {
    const type = typeof value === 'boolean' ? 'checkbox' :
                 typeof value === 'number' ? 'number' : 'text';

    const group = createPropGroup(key, type, value, (newValue) => {
      component.props[key] = newValue;
      events.emit('builder:props-changed', { component, key, value: newValue });
      rerenderComponent(component);
    });
    content.appendChild(group);
  });

  // Style section
  content.appendChild(dom.create('div', { className: 'vb-prop-section' }, 'Styles'));

  ['width', 'height', 'margin', 'padding', 'backgroundColor', 'color'].forEach(prop => {
    const group = createPropGroup(prop, 'text', '', (value) => {
      events.emit('builder:style-changed', { component, prop, value });
    });
    content.appendChild(group);
  });

  // Actions
  content.appendChild(dom.create('div', { className: 'vb-prop-section' }, 'Actions'));
  content.appendChild(dom.create('button', {
    className: 'vb-delete-btn',
    onClick: () => deleteComponent(component)
  }, 'Delete Component'));
}

/**
 * Create a property input group
 */
function createPropGroup(label, type, value, onChange, disabled = false) {
  const group = dom.create('div', { className: 'vb-prop-group' });

  const labelEl = dom.create('label', { className: 'vb-prop-label' }, label);

  let input;
  if (type === 'checkbox') {
    input = dom.create('input', {
      type: 'checkbox',
      className: 'vb-prop-checkbox',
      checked: value,
      disabled
    });
    input.addEventListener('change', () => onChange(input.checked));
  } else if (type === 'select') {
    input = dom.create('select', { className: 'vb-prop-select', disabled });
    input.addEventListener('change', () => onChange(input.value));
  } else {
    input = dom.create('input', {
      type,
      className: 'vb-prop-input',
      value: value ?? '',
      disabled
    });
    input.addEventListener('input', () => {
      const val = type === 'number' ? parseFloat(input.value) : input.value;
      onChange(val);
    });
  }

  group.appendChild(labelEl);
  group.appendChild(input);
  return group;
}

/**
 * Add component to canvas
 */
async function addComponentToCanvas(componentName, container) {
  try {
    const factory = await loadComponent(componentName);
    const node = new ComponentNode(componentName, {});

    // Create wrapper for builder interactions
    const wrapper = dom.create('div', {
      className: 'vb-component-wrapper',
      dataset: { nodeId: node.id }
    });

    // Create the actual component
    const element = factory({});
    wrapper.appendChild(element);

    // Add selection overlay
    const overlay = dom.create('div', { className: 'vb-component-overlay' });
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      selectComponent(node, wrapper);
    });
    wrapper.appendChild(overlay);

    // Add resize handles
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => {
      return dom.create('div', {
        className: `vb-resize-handle vb-resize-${dir}`,
        dataset: { direction: dir }
      });
    });
    handles.forEach(h => wrapper.appendChild(h));

    // Make droppable for nesting
    wrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper.classList.add('drag-over');
    });

    wrapper.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      wrapper.classList.remove('drag-over');
    });

    wrapper.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper.classList.remove('drag-over');

      const childName = e.dataTransfer.getData('text/plain');
      if (childName && childName !== componentName) {
        await addComponentToCanvas(childName, wrapper);
      }
    });

    container.appendChild(wrapper);
    container.dataset.empty = 'false';

    // Add to tree
    builderState.componentTree.push(node);
    pushHistory();

    events.emit('builder:component-added', { node, element: wrapper });

    return { node, element: wrapper };
  } catch (error) {
    console.error(`Failed to add component ${componentName}:`, error);
  }
}

/**
 * Select a component
 */
function selectComponent(node, element) {
  // Deselect previous
  document.querySelectorAll('.vb-component-wrapper.selected').forEach(el => {
    el.classList.remove('selected');
  });

  builderState.selectedComponent = node;
  element.classList.add('selected');

  events.emit('builder:component-selected', node);
}

/**
 * Delete a component
 */
function deleteComponent(node) {
  const element = document.querySelector(`[data-node-id="${node.id}"]`);
  if (element) {
    element.remove();
  }

  const index = builderState.componentTree.findIndex(n => n.id === node.id);
  if (index !== -1) {
    builderState.componentTree.splice(index, 1);
  }

  builderState.selectedComponent = null;
  events.emit('builder:component-deleted', node);
  events.emit('builder:component-selected', null);
  pushHistory();
}

/**
 * Re-render a component after prop changes
 */
async function rerenderComponent(node) {
  const wrapper = document.querySelector(`[data-node-id="${node.id}"]`);
  if (!wrapper) return;

  const factory = await loadComponent(node.type);
  const oldComponent = wrapper.querySelector(':not(.vb-component-overlay):not(.vb-resize-handle)');

  if (oldComponent) {
    const newComponent = factory(node.props);
    wrapper.replaceChild(newComponent, oldComponent);
  }
}

/**
 * History management
 */
function pushHistory() {
  const state = JSON.stringify(builderState.componentTree.map(n => n.toJSON()));
  builderState.history = builderState.history.slice(0, builderState.historyIndex + 1);
  builderState.history.push(state);
  builderState.historyIndex = builderState.history.length - 1;
}

function undo() {
  if (builderState.historyIndex > 0) {
    builderState.historyIndex--;
    restoreHistory();
  }
}

function redo() {
  if (builderState.historyIndex < builderState.history.length - 1) {
    builderState.historyIndex++;
    restoreHistory();
  }
}

function restoreHistory() {
  const state = JSON.parse(builderState.history[builderState.historyIndex]);
  builderState.componentTree = state.map(json => ComponentNode.fromJSON(json));
  // Re-render canvas would go here
  events.emit('builder:history-restored');
}

/**
 * Mode switching
 */
function setMode(mode) {
  builderState.mode = mode;
  document.querySelectorAll('.vb-mode-edit, .vb-mode-preview, .vb-mode-code').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.vb-mode-${mode}`)?.classList.add('active');
  events.emit('builder:mode-changed', mode);
}

/**
 * Zoom control
 */
function setZoom(level) {
  builderState.zoom = level;
  const workspace = document.querySelector('.vb-workspace');
  if (workspace) {
    workspace.style.transform = `scale(${level})`;
  }
}

/**
 * Grid toggle
 */
function toggleGrid() {
  builderState.showGrid = !builderState.showGrid;
  const workspace = document.querySelector('.vb-workspace');
  if (workspace) {
    workspace.classList.toggle('show-grid', builderState.showGrid);
  }
}

/**
 * Export project
 */
function exportProject() {
  const code = generateCode(builderState.componentTree);
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'verena-project.js';
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Generate code from component tree
 */
function generateCode(tree) {
  const imports = new Set();
  const components = [];

  function processNode(node, indent = '') {
    imports.add(`create${node.type}`);

    const propsStr = Object.entries(node.props)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');

    let code = `${indent}create${node.type}({ ${propsStr} })`;

    if (node.children.length > 0) {
      const childrenCode = node.children.map(c => processNode(c, indent + '  ')).join(',\n');
      code = `${indent}(() => {
${indent}  const el = create${node.type}({ ${propsStr} });
${childrenCode.split('\n').map(line => `${indent}  el.appendChild(${line.trim()});`).join('\n')}
${indent}  return el;
${indent}})()`;
    }

    return code;
  }

  tree.forEach(node => {
    components.push(processNode(node));
  });

  return `// Generated by verenajs Visual Builder
import { ${Array.from(imports).join(', ')} } from 'verenajs';

export function render(container) {
${components.map(c => `  container.appendChild(${c});`).join('\n')}
}
`;
}

/**
 * Create the main builder interface
 */
function createBuilder() {
  injectStyle('verena-builder', builderStyles);

  const builder = dom.create('div', { className: 'vb-builder' });

  const palette = createPalette();
  const canvas = createCanvas();
  const inspector = createInspector();

  builder.appendChild(palette);
  builder.appendChild(canvas);
  builder.appendChild(inspector);

  return builder;
}

/**
 * Open the Visual Builder
 */
function openBuilder(targetElement = document.body) {
  if (builderState.isOpen) return;

  const builder = createBuilder();
  targetElement.appendChild(builder);
  builderState.isOpen = true;

  // Initialize ZMQ channel for live sync
  createBuilderChannel().then(channel => {
    builderState.channel = channel;
  }).catch(() => {
    // ZMQ not available, continue without sync
  });

  events.emit('builder:opened');
  return builder;
}

/**
 * Close the Visual Builder
 */
function closeBuilder() {
  const builder = document.querySelector('.vb-builder');
  if (builder) {
    builder.remove();
    builderState.isOpen = false;
    events.emit('builder:closed');
  }
}

/**
 * Toggle the Visual Builder
 */
function toggleBuilder(targetElement) {
  if (builderState.isOpen) {
    closeBuilder();
  } else {
    openBuilder(targetElement);
  }
}

// Keyboard shortcuts
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + B = Toggle builder
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleBuilder();
    }

    // Only when builder is open
    if (!builderState.isOpen) return;

    // Ctrl/Cmd + Z = Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Ctrl/Cmd + Shift + Z = Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
    }

    // Delete = Delete selected component
    if (e.key === 'Delete' && builderState.selectedComponent) {
      e.preventDefault();
      deleteComponent(builderState.selectedComponent);
    }

    // Escape = Deselect
    if (e.key === 'Escape') {
      builderState.selectedComponent = null;
      document.querySelectorAll('.vb-component-wrapper.selected').forEach(el => {
        el.classList.remove('selected');
      });
      events.emit('builder:component-selected', null);
    }
  });
}

export {
  openBuilder,
  closeBuilder,
  toggleBuilder,
  createBuilder,
  ComponentNode,
  builderState,
  generateCode
};

export default {
  open: openBuilder,
  close: closeBuilder,
  toggle: toggleBuilder,
  create: createBuilder,
  state: builderState
};
