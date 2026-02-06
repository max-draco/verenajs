# Usage Guide

Complete API reference and usage patterns for verenajs.

## Table of Contents

- [Importing Components](#importing-components)
- [Core API](#core-api)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Routing](#routing)
- [Theming](#theming)
- [Visual Builder](#visual-builder)
- [API Management](#api-management)
- [Plugin System](#plugin-system)
- [Docker Deployment](#docker-deployment)
- [Platform Bridges](#platform-bridges)

---

## Importing Components

### Named Imports (Recommended)

```javascript
import {
  createButton,
  createCard,
  createInput,
  createModal,
  Router,
  theme,
  store,
  events
} from 'verenajs';
```

### Namespace Import

```javascript
import verenajs from 'verenajs';

const { Button, Card, Input } = verenajs.components;
const button = Button({ label: 'Click' });
```

### Dynamic Loading

```javascript
import { loadComponent } from 'verenajs';

const DataTable = await loadComponent('DataTable');
const table = DataTable({ data: myData });
```

---

## Core API

### createElement

Create DOM elements with props:

```javascript
import { createElement } from 'verenajs';

const div = createElement('div', {
  className: 'container',
  style: { padding: '1rem' },
  onClick: () => console.log('clicked')
}, 'Hello World');
```

### dom Utilities

```javascript
import { dom } from 'verenajs';

// Query
const el = dom.query('.container');
const all = dom.queryAll('button');

// Manipulation
dom.addClass(el, 'active', 'visible');
dom.removeClass(el, 'hidden');
dom.toggleClass(el, 'expanded');
dom.css(el, { backgroundColor: '#fff' });

// Events
const off = dom.on(el, 'click', handler);
off(); // Remove listener

// DOM operations
dom.append(parent, child1, child2);
dom.prepend(parent, child);
dom.remove(el);
dom.empty(container);
```

### reactive

Create reactive objects:

```javascript
import { reactive } from 'verenajs';

const state = reactive({ count: 0 });

state.subscribe('count', (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} -> ${newVal}`);
});

state.count = 5; // Triggers subscriber
```

---

## Component Patterns

### Basic Component

```javascript
import { createButton } from 'verenajs';

const button = createButton({
  type: 'primary',    // 'primary' | 'secondary' | 'danger'
  label: 'Click Me',
  onClick: () => console.log('Clicked!')
});

document.body.appendChild(button);
```

### Form Components

```javascript
import {
  createInput,
  createSelect,
  createCheckbox,
  createSmartForm
} from 'verenajs';

const form = createSmartForm({
  onSubmit: (data) => {
    console.log('Form data:', data);
  }
});

form.appendChild(createInput({
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  placeholder: 'you@example.com'
}));

form.appendChild(createSelect({
  name: 'country',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ke', label: 'Kenya' }
  ]
}));

form.appendChild(createCheckbox({
  name: 'terms',
  label: 'I agree to terms',
  required: true
}));
```

### Layout Components

```javascript
import {
  createContainer,
  createGrid,
  createStack,
  createSplitter
} from 'verenajs';

// Grid layout
const grid = createGrid({
  columns: 3,
  gap: '1rem'
});

// Stack (vertical)
const stack = createStack({
  direction: 'vertical',
  gap: '0.5rem'
});

// Splitter
const splitter = createSplitter({
  direction: 'horizontal',
  sizes: [30, 70] // percentages
});
```

### Data Components

```javascript
import { createDataTable, createList, createTreeView } from 'verenajs';

// Data table
const table = createDataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ],
  data: users,
  pagination: true,
  pageSize: 10
});

// List
const list = createList({
  items: ['Item 1', 'Item 2', 'Item 3'],
  onSelect: (item) => console.log('Selected:', item)
});

// Tree view
const tree = createTreeView({
  data: [
    {
      label: 'Root',
      children: [
        { label: 'Child 1' },
        { label: 'Child 2', children: [...] }
      ]
    }
  ]
});
```

---

## State Management

### Global Store

```javascript
import { store } from 'verenajs';

// Set state
store.setState({
  user: null,
  theme: 'dark',
  notifications: []
});

// Get state
const currentState = store.getState();

// Subscribe to changes
const unsubscribe = store.subscribe((state, prevState) => {
  if (state.user !== prevState.user) {
    console.log('User changed:', state.user);
  }
});

// Update state
store.setState({ user: { name: 'John' } });

// Functional update
store.setState(prev => ({
  notifications: [...prev.notifications, newNotification]
}));

// Unsubscribe
unsubscribe();
```

### Event Bus

```javascript
import { events } from 'verenajs';

// Subscribe
const off = events.on('user:login', (user) => {
  console.log('User logged in:', user);
});

// One-time subscription
events.once('app:ready', () => {
  console.log('App initialized');
});

// Emit
events.emit('user:login', { id: 1, name: 'John' });

// Unsubscribe
off();
```

---

## Routing

### Basic Setup

```javascript
import { Router } from 'verenajs';

const router = new Router({
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/users/:id', component: UserProfile },
    { path: '*', component: NotFound }
  ]
});
```

### Route Guards

```javascript
const authGuard = (to, from, next) => {
  const isAuthenticated = store.getState().user !== null;

  if (isAuthenticated) {
    next(); // Continue
  } else {
    next('/login'); // Redirect
  }
};

const router = new Router({
  routes: [
    { path: '/dashboard', component: Dashboard, guard: authGuard }
  ]
});
```

### Navigation

```javascript
// Programmatic navigation
router.navigate('/users/123');
router.navigate('/search', { query: { q: 'test' } });

// Go back/forward
router.back();
router.forward();

// Listen to route changes
router.on('routeChange', ({ path, params, query }) => {
  console.log('Route:', path);
  console.log('Params:', params);  // { id: '123' }
  console.log('Query:', query);    // { q: 'test' }
});
```

---

## Theming

### Switch Themes

```javascript
import { theme } from 'verenajs';

// Built-in themes
theme.set('light');
theme.set('dark');

// Get current theme
console.log(theme.current); // 'dark'
```

### Design Tokens

```javascript
// Get token value
const primary = theme.get('primary');      // #3b82f6
const background = theme.get('background'); // #0f172a

// All tokens
const tokens = theme.tokens[theme.current];
```

### Custom Themes

```javascript
theme.extend('brand', {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155'
});

theme.set('brand');
```

---

## Visual Builder

### Open Builder

```javascript
import { toggleBuilder, openBuilder, closeBuilder } from 'verenajs/builder';

// Toggle with Ctrl+B
toggleBuilder();

// Or programmatically
openBuilder();
closeBuilder();
```

### Advanced Builder

```javascript
import { createAdvancedBuilder } from 'verenajs/builder';

// Create full-featured builder
const builder = createAdvancedBuilder();
document.body.appendChild(builder);
```

### Builder Panels

The Advanced Builder includes:

1. **Left Panel**
   - Component Palette (1000+ components in 40+ categories)
   - Layers Tree (component hierarchy)
   - Pages List (multi-page support)

2. **Center Canvas**
   - Device Preview (Desktop/Tablet/Mobile)
   - Drag & Drop Zone
   - Zoom Controls

3. **Right Panel**
   - Style Editor (colors, typography, spacing)
   - Settings (component properties)
   - Data Bindings (API connections)
   - Event Handlers

4. **Bottom Panel**
   - Console (logs)
   - Network (API calls)
   - Performance (metrics)
   - State Inspector

### Builder API

```javascript
import { builderState, generateCode } from 'verenajs/builder';

// Access builder state
console.log(builderState.componentTree);
console.log(builderState.selectedComponent);

// Generate code from builder
const code = generateCode(builderState.componentTree);

// Export to different formats
const reactCode = generateCode(builderState.componentTree, 'react');
const vueCode = generateCode(builderState.componentTree, 'vue');
const htmlCode = generateCode(builderState.componentTree, 'html');
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+B | Toggle Visual Builder |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy component |
| Ctrl+V | Paste component |
| Delete | Remove selected component |
| Ctrl+S | Save project |
| Ctrl+E | Export code |

---

## API Management

### API Client

```javascript
import { ApiClient } from 'verenajs/core/api-manager';

const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' },
  cache: { ttl: 300000 },
  retry: { maxRetries: 3 }
});

// GET request
const users = await api.get('/users');

// POST request
const newUser = await api.post('/users', { name: 'John' });

// With query params
const filtered = await api.get('/users', { role: 'admin' });
```

### Webhook Manager

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

const webhooks = new WebhookManager({
  secret: 'your-hmac-secret'
});

// Register webhook
webhooks.register({
  id: 'orders',
  url: 'https://your-app.com/webhooks/orders',
  events: ['order.created', 'order.updated']
});

// Trigger webhook
await webhooks.trigger('order.created', { orderId: '123' });

// Verify incoming webhook
const isValid = webhooks.verify(signature, payload);
```

### Backend Connector

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

// Disconnect
await backend.disconnect('python');
```

### GraphQL Client

```javascript
import { GraphQLClient } from 'verenajs/core/api-manager';

const graphql = new GraphQLClient({
  endpoint: 'https://api.example.com/graphql'
});

// Query
const result = await graphql.query(`
  query GetUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      email
    }
  }
`, { limit: 10 });

// Mutation
await graphql.mutate(`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
    }
  }
`, { input: { name: 'John', email: 'john@example.com' } });
```

---

## Plugin System

### Plugin Manager

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

// Install plugin
await plugins.install('analytics');

// Activate plugin
await plugins.activate('analytics');

// Use plugin API
const analytics = plugins.getApi('analytics');
analytics.track('page_view', { page: '/dashboard' });

// Deactivate plugin
await plugins.deactivate('analytics');

// Uninstall plugin
await plugins.uninstall('analytics');
```

### Available Built-in Plugins

```javascript
// Analytics
await plugins.install('analytics');
const analytics = plugins.getApi('analytics');
analytics.track('event', { data: 'value' });

// Authentication
await plugins.install('auth');
const auth = plugins.getApi('auth');
await auth.login({ email, password });

// Payments
await plugins.install('payments');
const payments = plugins.getApi('payments');
await payments.createCheckout({ items: [...] });

// Email
await plugins.install('email');
const email = plugins.getApi('email');
await email.send({ to: 'user@example.com', subject: 'Hello' });

// Charts
await plugins.install('charts');
const charts = plugins.getApi('charts');
charts.registerType('custom', CustomChartRenderer);

// Maps
await plugins.install('maps');
const maps = plugins.getApi('maps');
maps.setProvider('mapbox', { apiKey: 'your-key' });
```

### Plugin Marketplace

```javascript
import { PluginMarketplace } from 'verenajs/core/plugin-manager';

const marketplace = new PluginMarketplace({
  registryUrl: 'https://plugins.verenajs.dev'
});

// Search plugins
const results = await marketplace.search('analytics');

// Get plugin info
const info = await marketplace.getPlugin('analytics');

// Install from marketplace
await marketplace.installPlugin('analytics');
```

---

## Docker Deployment

### Generate Dockerfile

```javascript
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

const generator = new DockerfileGenerator();

// Basic verenajs app
const dockerfile = generator.generate({
  type: 'verenajs',
  nodeVersion: '20',
  port: 3000
});

// Fullstack app
const fullstackDockerfile = generator.generate({
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

// Basic setup
const basic = compose.generate({ template: 'basic' });

// With database
const withDb = compose.generate({
  template: 'withDatabase',
  database: 'postgres'
});

// Full stack
const fullStack = compose.generate({
  template: 'fullStack',
  services: {
    app: { port: 3000, replicas: 3 },
    db: { type: 'postgres' },
    cache: { type: 'redis' }
  }
});
```

### CI/CD Configuration

```javascript
import { CICDGenerator } from 'verenajs/core/docker-integration';

const cicd = new CICDGenerator();

// GitHub Actions
const githubActions = cicd.generateGitHubActions();

// GitLab CI
const gitlabCI = cicd.generateGitLabCI();

// Jenkins
const jenkinsfile = cicd.generateJenkinsfile();
```

### Kubernetes Deployment

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

---

## Platform Bridges

### ZeroMQ

```javascript
import zmq from 'verenajs/core/zeromq';

// Initialize
await zmq.initialize({
  wsUrl: 'ws://localhost:5555'
});

// Create channel
const channel = await zmq.createChannel('my-channel');

// Pub/Sub
channel.subscribe('topic', (data) => {
  console.log('Received:', data);
});

channel.publish('topic', { message: 'Hello!' });

// Request/Reply
const response = await zmq.request('endpoint', { data: 'request' });
```

### Qt Bridge

```javascript
import { initQtBridge, QtDialogs, QtWindow } from 'verenajs/core/bridges/qt';

// Initialize (only in Qt environment)
await initQtBridge();

// Dialogs
const file = await QtDialogs.openFile({
  title: 'Select File',
  filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]
});

// Window controls
QtWindow.minimize();
QtWindow.maximize();
QtWindow.setTitle('My App');
```

### OpenCV

```javascript
import OpenCV from 'verenajs/core/opencv';

// Load OpenCV.js
await OpenCV.load();

// Layout recognition
const components = await OpenCV.recognizeLayout(imageElement);

// Parse Draw.io
const tree = await OpenCV.parseDrawIO(xmlString);
```

---

## Next Steps

- See [Examples](EXAMPLES.md) for complete code samples
- Explore the [Visual Builder](docs/VISUAL-BUILDER.md) guide
- Read [Architecture](ARCHITECTURE.md) for internals
- Check [Troubleshooting](TROUBLESHOOTING.md) for common issues
