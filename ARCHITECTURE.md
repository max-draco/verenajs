# verenajs Architecture

## Core Philosophy

verenajs is built on the principle that modern web frameworks have become unnecessarily complex. We return to fundamentals:

- **Vanilla JavaScript** - No transpilation required for components
- **Real DOM** - Direct manipulation, no virtual DOM overhead
- **Explicit APIs** - No magic, predictable behavior
- **Platform Abstraction** - Write once, compile to web/mobile/desktop
- **Visual-First Development** - Build with the Visual Builder, export clean code

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Visual Builder Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Component  │  │   Canvas    │  │     Property Editor     │  │
│  │   Palette   │  │  Workspace  │  │  (Styles/Events/Data)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Router    │  │    Store    │  │      Event Bus          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Component Layer                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   1000+ Components                           ││
│  │  Layout | Form | Display | Data | Charts | Trading | AI     ││
│  │  DevOps | Real-time | Commerce | Auth | Maps | Animation    ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         Core Runtime                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │   DOM     │  │  Theme    │  │ Registry  │  │  Reactive   │  │
│  │ Utilities │  │  System   │  │           │  │   Bindings  │  │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      API & Plugin Layer                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │    API    │  │  Webhook  │  │  Backend  │  │   Plugin    │  │
│  │  Manager  │  │  Manager  │  │ Connector │  │  Manager    │  │
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
├─────────────────────────────────────────────────────────────────┤
│                      Deployment Layer                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Docker   │  │   K8s     │  │   CI/CD   │  │   Cloud     │  │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
verenajs/
├── core/                    # Core runtime
│   ├── core.js             # Main runtime: events, store, theme, DOM
│   ├── registry.js         # Component auto-discovery and registration
│   ├── component-manifest.js # 1000+ component definitions
│   ├── component-generator.js # Dynamic component generation
│   ├── api-manager.js      # API client, webhooks, backend connectors
│   ├── plugin-manager.js   # Plugin lifecycle and marketplace
│   ├── docker-integration.js # Docker/K8s deployment
│   ├── project-integration.js # External project integration
│   ├── zeromq.js           # ZeroMQ communication layer
│   ├── opencv.js           # OpenCV visual processing
│   └── bridges/
│       └── qt.js           # Qt C++ native bridge
│
├── components/              # 1000+ UI components
│   ├── buttons/            # Button variants
│   ├── input/              # Form inputs
│   ├── Card/               # Card container
│   ├── Modal/              # Modal dialogs
│   ├── DataTable/          # Data tables
│   ├── OrderBook/          # Trading components
│   └── ...                 # All component categories
│
├── builder/                 # Visual Builder
│   ├── index.js            # Basic builder
│   ├── AdvancedBuilder.js  # Professional builder with all features
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
├── docs/                    # Documentation
│   └── index.html          # Interactive documentation
│
├── index.js                 # Main entry point with all exports
├── package.json
└── webpack.config.js
```

## Visual Builder Architecture

The Visual Builder is the centerpiece of verenajs, enabling no-code/low-code development with professional output.

### Builder Components

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Top Toolbar                                │
│  [Save] [Undo] [Redo] | [Desktop] [Tablet] [Mobile] | [Preview] [Code] │
├─────────────┬────────────────────────────────────┬─────────────────────┤
│   Left      │           Canvas Area              │        Right        │
│   Panel     │                                    │        Panel        │
│             │   ┌──────────────────────────┐     │                     │
│  Components │   │                          │     │   Properties        │
│  by Category│   │     Drop Zone            │     │   - Styles          │
│             │   │     (Page Preview)       │     │   - Layout          │
│  Layers     │   │                          │     │   - Events          │
│  Tree View  │   │                          │     │   - Data Bindings   │
│             │   └──────────────────────────┘     │                     │
│  Pages      │                                    │   Settings          │
│             │                                    │   - Component Props │
├─────────────┴────────────────────────────────────┴─────────────────────┤
│                            Bottom Panel                                 │
│  [Console] [Network] [Performance] [State]                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Tree Representation

Components in the builder are represented as a tree structure:

```javascript
class ComponentNode {
  id: string;           // Unique identifier
  type: string;         // Component name (e.g., 'Button', 'Card')
  props: object;        // Component properties
  styles: object;       // Inline styles
  events: object;       // Event handlers
  dataBindings: object; // Data binding configuration
  children: ComponentNode[];
  parent: ComponentNode | null;
}
```

### Code Generation Pipeline

```
Component Tree
     │
     ▼
┌─────────────┐
│  Analyzer   │  Resolve dependencies, validate tree
└─────────────┘
     │
     ▼
┌─────────────┐
│ Transformer │  Convert to target format AST
└─────────────┘
     │
     ▼
┌─────────────┐
│  Generator  │  Output code string
└─────────────┘
     │
     ├─► verenajs (native)
     ├─► React JSX
     ├─► Vue SFC
     └─► HTML + CSS + JS
```

### Visual Builder API

```javascript
import { createAdvancedBuilder, builderState, generateCode } from 'verenajs/builder';

// Create builder instance
const builder = createAdvancedBuilder();

// Access current state
console.log(builderState.componentTree);    // Current component hierarchy
console.log(builderState.selectedComponent); // Currently selected component
console.log(builderState.history);          // Undo/redo history

// Generate code
const code = generateCode(builderState.componentTree, 'verenajs');

// Export to different formats
const reactCode = generateCode(builderState.componentTree, 'react');
const vueCode = generateCode(builderState.componentTree, 'vue');
const htmlCode = generateCode(builderState.componentTree, 'html');
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

### Component Categories (40+)

```javascript
import { COMPONENT_CATEGORIES } from 'verenajs/core/component-manifest';

// Categories include:
// layout, form, buttons, display, feedback, navigation, data,
// charts, trading, realtime, media, communication, commerce,
// auth, maps, ai, developer, admin, api, devops, social,
// mobile, animation, threeDimensions, accessibility, print,
// i18n, gamification, scheduling, ...
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

## API Manager Architecture

### API Client with Caching

```javascript
import { ApiClient } from 'verenajs/core/api-manager';

const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' },
  cache: { ttl: 300000, maxSize: 100 },
  retry: { maxRetries: 3, delay: 1000 }
});

// Request with automatic caching
const data = await api.get('/users');
```

### Webhook Management

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

const webhooks = new WebhookManager({
  secret: 'your-hmac-secret',
  timeout: 30000
});

// Register webhook
webhooks.register({
  id: 'order-events',
  url: 'https://your-app.com/webhooks/orders',
  events: ['order.created', 'order.updated', 'order.cancelled']
});

// Trigger webhook
await webhooks.trigger('order.created', { orderId: '123', total: 99.99 });
```

### Backend Connectors

```javascript
import { BackendConnector } from 'verenajs/core/api-manager';

const backend = new BackendConnector();

// Connect to multiple backends
await backend.connect('node', { host: 'localhost', port: 3000 });
await backend.connect('python', { host: 'localhost', port: 5000 });
await backend.connect('go', { host: 'localhost', port: 8080 });
await backend.connect('php', { host: 'localhost', port: 9000 });

// Execute on specific backend
const result = await backend.execute('python', 'analyze_data', { data: [...] });
```

## Plugin System Architecture

### Plugin Lifecycle

```
┌──────────────┐
│   Install    │  Download, validate, extract
└──────────────┘
       │
       ▼
┌──────────────┐
│    Init      │  Load dependencies, register hooks
└──────────────┘
       │
       ▼
┌──────────────┐
│   Activate   │  Start plugin, expose API
└──────────────┘
       │
       ▼
┌──────────────┐
│   Running    │  Plugin active, handling events
└──────────────┘
       │
       ▼
┌──────────────┐
│  Deactivate  │  Cleanup, remove hooks
└──────────────┘
       │
       ▼
┌──────────────┐
│  Uninstall   │  Remove files, clear storage
└──────────────┘
```

### Hook System

```javascript
import { PluginManager, HOOKS } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

// Available hooks
HOOKS.BEFORE_INIT     // Before app initialization
HOOKS.AFTER_INIT      // After app initialization
HOOKS.BEFORE_RENDER   // Before component render
HOOKS.AFTER_RENDER    // After component render
HOOKS.STATE_CHANGE    // On state change
HOOKS.ROUTE_CHANGE    // On route change
HOOKS.BEFORE_DESTROY  // Before component destruction
HOOKS.AFTER_DESTROY   // After component destruction
```

## Docker Integration

### Dockerfile Generation

```javascript
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

const generator = new DockerfileGenerator();

const dockerfile = generator.generate({
  type: 'fullstack',
  nodeVersion: '20',
  port: 3000,
  buildCommand: 'npm run build',
  startCommand: 'npm start'
});
```

### Docker Compose

```javascript
import { DockerComposeGenerator } from 'verenajs/core/docker-integration';

const compose = new DockerComposeGenerator();

const config = compose.generate({
  template: 'fullStack',
  services: {
    app: { port: 3000, replicas: 3 },
    database: { type: 'postgres' },
    cache: { type: 'redis' }
  }
});
```

### Kubernetes Manifests

```javascript
import { KubernetesGenerator } from 'verenajs/core/docker-integration';

const k8s = new KubernetesGenerator();

const manifests = k8s.generate({
  name: 'my-app',
  replicas: 3,
  port: 3000,
  resources: {
    cpu: '500m',
    memory: '512Mi'
  }
});
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
- HMAC signature verification for webhooks

### Recommendations

- Use Content Security Policy headers
- Validate all user input server-side
- Use HTTPS for ZeroMQ WebSocket bridges
- Store secrets securely (environment variables)
