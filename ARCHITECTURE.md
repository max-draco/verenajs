# verenajs Architecture

## Core Philosophy

verenajs is built on the principle that modern web frameworks have become unnecessarily complex. We return to fundamentals:

- **Vanilla JavaScript** - No transpilation required for components
- **Real DOM** - Direct manipulation, no virtual DOM overhead
- **Explicit APIs** - No magic, predictable behavior
- **Platform Abstraction** - Write once, compile to web/mobile/desktop

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Router    │  │    Store    │  │      Event Bus          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Component Layer                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   257 Components                             ││
│  │  Layout | Form | Display | Data | Navigation | Trading      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         Core Runtime                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │   DOM     │  │  Theme    │  │ Registry  │  │  Reactive   │  │
│  │ Utilities │  │  System   │  │           │  │   Bindings  │  │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Platform Bridges                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │    Web    │  │  Electron │  │    Qt     │  │  Capacitor  │  │
│  │  (DOM)    │  │ (Desktop) │  │ (Native)  │  │  (Mobile)   │  │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Communication Layer                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        ZeroMQ                                ││
│  │          Pub/Sub | Request/Reply | Push/Pull                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
verenajs/
├── core/                    # Core runtime
│   ├── core.js             # Main runtime: events, store, theme, DOM
│   ├── registry.js         # Component auto-discovery and registration
│   ├── zeromq.js           # ZeroMQ communication layer
│   ├── opencv.js           # OpenCV visual processing
│   └── bridges/
│       └── qt.js           # Qt C++ native bridge
│
├── components/              # 257 UI components
│   ├── buttons/            # Button variants
│   ├── input/              # Form inputs
│   ├── Card/               # Card container
│   ├── Modal/              # Modal dialogs
│   ├── DataTable/          # Data tables
│   ├── OrderBook/          # Trading components
│   └── ...
│
├── builder/                 # Visual Builder
│   ├── index.js            # Builder core logic
│   └── styles.js           # Builder CSS
│
├── compiler/                # Multi-target compiler
│   ├── index.js            # Compiler orchestration
│   ├── parser.js           # JavaScript AST parser
│   ├── analyzer.js         # Dependency analysis
│   ├── optimizer.js        # Tree shaking, DCE, minification
│   └── generators/
│       ├── web.js          # Web bundle generator
│       ├── mobile.js       # Capacitor mobile generator
│       └── desktop.js      # Electron/Qt desktop generator
│
├── index.js                 # Main entry point with all exports
├── package.json
└── webpack.config.js
```

## Core Runtime

### Event Bus

Global event system for decoupled communication:

```javascript
import { events } from 'verenajs';

// Subscribe
const unsubscribe = events.on('user:login', (user) => {
  console.log('User logged in:', user);
});

// Emit
events.emit('user:login', { id: 1, name: 'John' });

// One-time listener
events.once('init', () => console.log('Initialized'));
```

### Store

Reactive state management:

```javascript
import { store, Store } from 'verenajs';

// Global store
store.setState({ count: 0 });
store.subscribe((state) => console.log(state));

// Custom stores
const userStore = new Store({ user: null, preferences: {} });
userStore.use((prev, next) => console.log('State changed'));
```

### Theme System

Runtime theming with design tokens:

```javascript
import { theme } from 'verenajs';

// Built-in themes: 'light', 'dark'
theme.set('dark');

// Access tokens
const primary = theme.get('primary'); // #60a5fa

// Custom themes
theme.extend('corporate', {
  primary: '#1e40af',
  secondary: '#7c3aed'
});
```

### DOM Utilities

Efficient DOM manipulation:

```javascript
import { dom, createElement } from 'verenajs';

// Query
const el = dom.query('.container');
const all = dom.queryAll('button');

// Create
const div = createElement('div', { className: 'card' }, 'Content');

// Manipulate
dom.addClass(el, 'active', 'visible');
dom.css(el, { backgroundColor: '#fff', padding: '1rem' });
dom.on(el, 'click', handleClick);
```

## Component System

### Factory Pattern

Every component is a factory function that returns a DOM element:

```javascript
export function createButton({ type = 'primary', label, onClick }) {
  const button = document.createElement('button');
  button.classList.add(styles.button, styles[type]);
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}
```

### Component Registration

Components are registered in the central registry:

```javascript
import { registerComponent, getComponent, loadComponent } from 'verenajs';

// Register
registerComponent('CustomWidget', createCustomWidget, {
  category: 'custom',
  props: { title: 'string', count: 'number' }
});

// Get sync
const factory = getComponent('CustomWidget');

// Load async
const widget = await loadComponent('DataTable');
```

### CSS Modules

Scoped styling without runtime overhead:

```css
/* index.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.buttonPrimary {
  background: var(--primary);
  color: white;
}
```

```javascript
import styles from './index.module.css';
button.classList.add(styles.button, styles.buttonPrimary);
```

## Visual Builder

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Visual Builder                          │
├──────────────┬─────────────────────────┬───────────────────┤
│   Palette    │         Canvas          │    Inspector      │
│              │                         │                   │
│  Components  │   ┌─────────────────┐  │   Properties      │
│  by category │   │   Dropzone      │  │   Styles          │
│              │   │   (drag-drop)   │  │   Events          │
│  Search      │   │                 │  │   Actions         │
│              │   └─────────────────┘  │                   │
├──────────────┴─────────────────────────┴───────────────────┤
│                        Toolbar                              │
│   Undo | Redo | Grid | Zoom | Edit | Preview | Code        │
└─────────────────────────────────────────────────────────────┘
```

### Component Tree

Components are represented as a tree structure:

```javascript
class ComponentNode {
  id: string;
  type: string;        // Component name
  props: object;       // Component properties
  children: ComponentNode[];
  parent: ComponentNode | null;
}
```

### Code Generation

Export to verenajs code:

```javascript
const code = generateCode(componentTree);
// Output:
// import { createButton, createCard } from 'verenajs';
// const card = createCard({ title: 'Hello' });
// card.appendChild(createButton({ label: 'Click' }));
```

## Compiler

### Pipeline

```
Source Files
     │
     ▼
┌─────────────┐
│   Parser    │  Tokenize → AST
└─────────────┘
     │
     ▼
┌─────────────┐
│  Analyzer   │  Dependencies, tree shaking analysis
└─────────────┘
     │
     ▼
┌─────────────┐
│  Optimizer  │  DCE, constant folding, minification
└─────────────┘
     │
     ▼
┌─────────────┐
│ Generators  │  Platform-specific output
└─────────────┘
     │
     ├─► Web (JS bundles)
     ├─► Mobile (Capacitor)
     └─► Desktop (Electron/Qt)
```

### Optimization Features

- **Tree Shaking** - Remove unused exports
- **Dead Code Elimination** - Remove unreachable code
- **Constant Folding** - Evaluate compile-time constants
- **Component Inlining** - Inline small components
- **Code Splitting** - Async chunks for lazy loading

## Platform Bridges

### Qt Bridge

Native Qt rendering for desktop:

```
JavaScript (verenajs)
        │
        ▼
┌───────────────────┐
│    Qt Bridge      │
│   (WebChannel)    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Qt Widgets      │
│  QPushButton      │
│  QLineEdit        │
│  QTableView       │
└───────────────────┘
```

### Capacitor Bridge

Mobile native features:

```
JavaScript (verenajs)
        │
        ▼
┌───────────────────┐
│  Capacitor Core   │
└───────────────────┘
        │
        ├─► iOS (Swift/ObjC)
        └─► Android (Kotlin/Java)
```

## ZeroMQ Communication

### Patterns Supported

1. **Pub/Sub** - Broadcast messages to subscribers
2. **Request/Reply** - RPC-style communication
3. **Push/Pull** - Work distribution pipeline

### Use Cases

- Visual Builder ↔ Running Application
- Desktop (Qt) ↔ JavaScript Runtime
- Hot Module Replacement
- State synchronization across processes

## OpenCV Integration

### Capabilities

1. **Layout Recognition** - Convert sketches to components
2. **Design Parsing** - Import Draw.io, Adobe files
3. **Gesture Recognition** - Touch/pen gesture detection
4. **Contour Analysis** - UI element detection

### Pipeline

```
Image Input
     │
     ▼
┌─────────────┐
│ Preprocess  │  Grayscale, blur, threshold
└─────────────┘
     │
     ▼
┌─────────────┐
│  Contours   │  Find and classify shapes
└─────────────┘
     │
     ▼
┌─────────────┐
│ Hierarchy   │  Build parent-child tree
└─────────────┘
     │
     ▼
┌─────────────┐
│ Components  │  Map to verenajs components
└─────────────┘
```

## Performance Considerations

### Bundle Size

- Core runtime: ~15KB minified
- Components: Tree-shakable, only include what you use
- Lazy loading for heavy components (charts, editors)

### Runtime Performance

- No virtual DOM reconciliation
- Direct DOM manipulation
- CSS Modules compiled at build time
- Event delegation where appropriate

### Memory

- Components are plain DOM elements
- No framework overhead per component
- Explicit lifecycle management

## Security

### Built-in Protections

- XSS prevention via DOM APIs (no innerHTML)
- CSP-compatible (no inline scripts)
- Input sanitization in form components

### Recommendations

- Use Content Security Policy headers
- Validate all user input server-side
- Use HTTPS for ZeroMQ WebSocket bridges
