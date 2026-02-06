# Examples

Comprehensive code examples for verenajs.

## Table of Contents

- [Quick Start](#quick-start)
- [Forms](#forms)
- [Data Display](#data-display)
- [Dashboard](#dashboard)
- [Trading Application](#trading-application)
- [Visual Builder](#visual-builder)
- [API Management](#api-management)
- [Plugin Usage](#plugin-usage)
- [Docker Deployment](#docker-deployment)
- [Mobile App](#mobile-app)
- [Desktop App](#desktop-app)

---

## Quick Start

### Hello World

```javascript
import { createButton, createCard } from 'verenajs';

const card = createCard({ title: 'Hello verenajs!' });

const button = createButton({
  type: 'primary',
  label: 'Click Me',
  onClick: () => alert('Welcome to verenajs!')
});

card.appendChild(button);
document.getElementById('app').appendChild(card);
```

### With Theming

```javascript
import { createCard, createButton, theme } from 'verenajs';

// Enable dark mode
theme.set('dark');

const app = document.getElementById('app');
app.style.backgroundColor = theme.get('background');
app.style.color = theme.get('text');
app.style.minHeight = '100vh';
app.style.padding = '2rem';

const card = createCard({ title: 'Dark Theme Demo' });
card.appendChild(createButton({ label: 'Primary', type: 'primary' }));
card.appendChild(createButton({ label: 'Secondary', type: 'secondary' }));

app.appendChild(card);
```

---

## Forms

### Login Form

```javascript
import {
  createCard,
  createInput,
  createButton,
  createCheckbox
} from 'verenajs';

const loginCard = createCard({ title: 'Sign In' });

const emailInput = createInput({
  name: 'email',
  label: 'Email Address',
  type: 'email',
  placeholder: 'you@example.com',
  required: true
});

const passwordInput = createInput({
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
});

const rememberMe = createCheckbox({
  name: 'remember',
  label: 'Remember me'
});

const submitButton = createButton({
  type: 'primary',
  label: 'Sign In',
  onClick: () => {
    const email = emailInput.querySelector('input').value;
    const password = passwordInput.querySelector('input').value;
    console.log('Login:', { email, password });
  }
});

loginCard.appendChild(emailInput);
loginCard.appendChild(passwordInput);
loginCard.appendChild(rememberMe);
loginCard.appendChild(submitButton);

document.body.appendChild(loginCard);
```

### Registration Form with Validation

```javascript
import {
  createSmartForm,
  createInput,
  createSelect,
  createButton,
  createCard
} from 'verenajs';

const form = createSmartForm({
  onSubmit: async (data) => {
    console.log('Registration data:', data);
    // Send to API
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  onError: (error) => {
    console.error('Registration failed:', error);
  }
});

form.appendChild(createInput({
  name: 'firstName',
  label: 'First Name',
  required: true,
  validation: { minLength: 2, maxLength: 50 }
}));

form.appendChild(createInput({
  name: 'lastName',
  label: 'Last Name',
  required: true
}));

form.appendChild(createInput({
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
}));

form.appendChild(createInput({
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  validation: { minLength: 8 }
}));

form.appendChild(createSelect({
  name: 'country',
  label: 'Country',
  options: [
    { value: '', label: 'Select country...' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ke', label: 'Kenya' },
    { value: 'de', label: 'Germany' }
  ]
}));

form.appendChild(createButton({
  type: 'primary',
  label: 'Create Account'
}));

const card = createCard({ title: 'Create Account' });
card.appendChild(form);
document.body.appendChild(card);
```

---

## Data Display

### Data Table with Pagination

```javascript
import { createDataTable, createCard } from 'verenajs';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User' },
  // ... more data
];

const table = createDataTable({
  columns: [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role' }
  ],
  data: users,
  pagination: true,
  pageSize: 10,
  onRowClick: (row) => console.log('Clicked:', row)
});

const card = createCard({ title: 'Users' });
card.appendChild(table);
document.body.appendChild(card);
```

### Tree View

```javascript
import { createTreeView, createCard } from 'verenajs';

const fileSystem = [
  {
    label: 'src',
    icon: 'folder',
    children: [
      {
        label: 'components',
        icon: 'folder',
        children: [
          { label: 'Button.js', icon: 'file' },
          { label: 'Card.js', icon: 'file' }
        ]
      },
      { label: 'index.js', icon: 'file' }
    ]
  },
  {
    label: 'package.json',
    icon: 'file'
  }
];

const tree = createTreeView({
  data: fileSystem,
  onSelect: (node) => console.log('Selected:', node.label)
});

const card = createCard({ title: 'Project Files' });
card.appendChild(tree);
document.body.appendChild(card);
```

---

## Dashboard

### Analytics Dashboard

```javascript
import {
  createContainer,
  createGrid,
  createCard,
  createStat,
  createLineChart,
  createBarChart,
  createDataTable
} from 'verenajs';

// Create main container
const dashboard = createContainer({ className: 'dashboard' });
dashboard.style.padding = '2rem';

// Stats row
const statsGrid = createGrid({ columns: 4, gap: '1rem' });
statsGrid.appendChild(createStat({
  label: 'Total Users',
  value: '12,543',
  change: '+12%',
  trend: 'up'
}));
statsGrid.appendChild(createStat({
  label: 'Revenue',
  value: '$45,231',
  change: '+8%',
  trend: 'up'
}));
statsGrid.appendChild(createStat({
  label: 'Orders',
  value: '1,234',
  change: '-3%',
  trend: 'down'
}));
statsGrid.appendChild(createStat({
  label: 'Conversion',
  value: '3.2%',
  change: '+0.5%',
  trend: 'up'
}));

// Charts row
const chartsGrid = createGrid({ columns: 2, gap: '1rem' });

const revenueCard = createCard({ title: 'Revenue Over Time' });
revenueCard.appendChild(createLineChart({
  data: [
    { label: 'Jan', value: 4000 },
    { label: 'Feb', value: 3000 },
    { label: 'Mar', value: 5000 },
    { label: 'Apr', value: 4500 },
    { label: 'May', value: 6000 },
    { label: 'Jun', value: 5500 }
  ]
}));

const ordersCard = createCard({ title: 'Orders by Category' });
ordersCard.appendChild(createBarChart({
  data: [
    { label: 'Electronics', value: 450 },
    { label: 'Clothing', value: 320 },
    { label: 'Books', value: 180 },
    { label: 'Home', value: 240 }
  ]
}));

chartsGrid.appendChild(revenueCard);
chartsGrid.appendChild(ordersCard);

// Recent orders table
const ordersTableCard = createCard({ title: 'Recent Orders' });
ordersTableCard.appendChild(createDataTable({
  columns: [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ],
  data: [
    { id: '#1234', customer: 'John Doe', amount: '$125.00', status: 'Completed' },
    { id: '#1235', customer: 'Jane Smith', amount: '$89.00', status: 'Pending' },
    { id: '#1236', customer: 'Bob Wilson', amount: '$245.00', status: 'Shipped' }
  ]
}));

// Assemble dashboard
dashboard.appendChild(statsGrid);
dashboard.appendChild(chartsGrid);
dashboard.appendChild(ordersTableCard);

document.body.appendChild(dashboard);
```

---

## Trading Application

### Crypto Trading Interface

```javascript
import {
  createGrid,
  createOrderBook,
  createMarketChart,
  createTradeHistory,
  createOrderForm,
  createContainer
} from 'verenajs';

const tradingLayout = createGrid({ columns: 3, gap: '1rem' });
tradingLayout.style.padding = '1rem';
tradingLayout.style.height = '100vh';

// Order Book
const orderBook = createOrderBook({
  symbol: 'BTC/USD',
  bids: [
    { price: 42150.00, amount: 1.5 },
    { price: 42145.00, amount: 2.3 },
    { price: 42140.00, amount: 0.8 }
  ],
  asks: [
    { price: 42155.00, amount: 1.2 },
    { price: 42160.00, amount: 3.1 },
    { price: 42165.00, amount: 0.5 }
  ]
});

// Market Chart
const chart = createMarketChart({
  symbol: 'BTC/USD',
  type: 'candlestick',
  data: [
    { time: '09:00', open: 42100, high: 42200, low: 42050, close: 42150 },
    { time: '10:00', open: 42150, high: 42300, low: 42100, close: 42250 },
    // ... more candles
  ]
});

// Trade Panel
const tradePanel = createContainer();

const orderForm = createOrderForm({
  symbol: 'BTC/USD',
  onSubmit: (order) => {
    console.log('Order submitted:', order);
  }
});

const tradeHistory = createTradeHistory({
  trades: [
    { time: '10:15:32', price: 42155.00, amount: 0.5, side: 'buy' },
    { time: '10:15:28', price: 42150.00, amount: 1.2, side: 'sell' },
    { time: '10:15:20', price: 42148.00, amount: 0.3, side: 'buy' }
  ]
});

tradePanel.appendChild(orderForm);
tradePanel.appendChild(tradeHistory);

// Assemble layout
tradingLayout.appendChild(orderBook);
tradingLayout.appendChild(chart);
tradingLayout.appendChild(tradePanel);

document.body.appendChild(tradingLayout);
```

---

## Visual Builder

### Launch Visual Builder

```javascript
import { createAdvancedBuilder, toggleBuilder } from 'verenajs/builder';
import { events } from 'verenajs';

// Enable keyboard shortcut (Ctrl+B)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'b') {
    toggleBuilder();
  }
});

// Or create the advanced builder directly
const builder = createAdvancedBuilder();
document.body.appendChild(builder);

// Listen for builder events
events.on('builder:component-added', ({ node }) => {
  console.log('Component added:', node.type);
});

events.on('builder:component-selected', (component) => {
  console.log('Selected:', component?.type);
});

events.on('builder:save', (state) => {
  console.log('Project saved:', state);
});
```

### Export Builder Code

```javascript
import { builderState, generateCode } from 'verenajs/builder';

function exportProject() {
  // Export to verenajs code
  const verenajsCode = generateCode(builderState.componentTree, 'verenajs');
  downloadFile('app.js', verenajsCode, 'text/javascript');

  // Export to React
  const reactCode = generateCode(builderState.componentTree, 'react');
  downloadFile('App.jsx', reactCode, 'text/javascript');

  // Export to Vue
  const vueCode = generateCode(builderState.componentTree, 'vue');
  downloadFile('App.vue', vueCode, 'text/plain');

  // Export to HTML
  const htmlCode = generateCode(builderState.componentTree, 'html');
  downloadFile('index.html', htmlCode, 'text/html');
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Visual Builder with External Project

```javascript
import { NavigatorIntegration, LiveEditorBridge } from 'verenajs/core/project-integration';

// Initialize project integration
const integration = new NavigatorIntegration('/path/to/your/project');
await integration.initialize();

// Scan for verenajs components
const components = await integration.scanForComponents();
console.log('Found components:', components);

// Enable live editing (Ctrl+E to toggle)
integration.enableLiveEditing();

// Listen for changes
integration.on('component:updated', (component) => {
  console.log('Component updated:', component);
});
```

---

## API Management

### Complete API Client Example

```javascript
import { ApiClient, WebhookManager, BackendConnector } from 'verenajs/core/api-manager';

// Create API client with full configuration
const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  cache: {
    ttl: 300000, // 5 minutes
    maxSize: 100
  },
  retry: {
    maxRetries: 3,
    delay: 1000
  }
});

// Add request interceptor
api.addInterceptor('request', (config) => {
  config.headers['X-Request-ID'] = generateUUID();
  return config;
});

// Add response interceptor
api.addInterceptor('response', (response) => {
  if (response.status === 401) {
    // Handle unauthorized
    window.location.href = '/login';
  }
  return response;
});

// Make API calls
async function fetchUsers() {
  const users = await api.get('/users', { limit: 10, offset: 0 });
  return users;
}

async function createUser(userData) {
  const user = await api.post('/users', userData);
  return user;
}

async function updateUser(id, userData) {
  const user = await api.put(`/users/${id}`, userData);
  return user;
}

async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}
```

### Webhook Management

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

// Create webhook manager
const webhooks = new WebhookManager({
  secret: process.env.WEBHOOK_SECRET,
  timeout: 30000
});

// Register webhooks
webhooks.register({
  id: 'order-events',
  url: 'https://your-app.com/webhooks/orders',
  events: ['order.created', 'order.updated', 'order.cancelled'],
  headers: {
    'X-Custom-Header': 'value'
  }
});

webhooks.register({
  id: 'user-events',
  url: 'https://your-app.com/webhooks/users',
  events: ['user.created', 'user.updated']
});

// Trigger webhooks
async function onOrderCreated(order) {
  await webhooks.trigger('order.created', {
    orderId: order.id,
    total: order.total,
    items: order.items,
    customer: order.customerId
  });
}

// Verify incoming webhook (in your webhook handler)
function handleIncomingWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const isValid = webhooks.verify(signature, req.body);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  const { event, data } = req.body;
  console.log('Received webhook:', event, data);

  res.json({ received: true });
}
```

### Multi-Backend Connection

```javascript
import { BackendConnector } from 'verenajs/core/api-manager';

const backend = new BackendConnector();

// Connect to Node.js backend
await backend.connect('node', {
  host: 'localhost',
  port: 3000,
  protocol: 'http'
});

// Connect to Python backend (Flask/FastAPI)
await backend.connect('python', {
  host: 'localhost',
  port: 5000,
  protocol: 'http'
});

// Connect to Go backend
await backend.connect('go', {
  host: 'localhost',
  port: 8080,
  protocol: 'http'
});

// Execute functions on different backends
async function processData() {
  // Use Python for data analysis
  const analysis = await backend.execute('python', 'analyze', {
    data: rawData
  });

  // Use Go for performance-critical operations
  const processed = await backend.execute('go', 'process', {
    analysis
  });

  // Use Node.js for final formatting
  const result = await backend.execute('node', 'format', {
    processed
  });

  return result;
}

// Health check all backends
async function checkBackends() {
  const statuses = {};
  for (const [name, connection] of backend.connections) {
    try {
      await backend.execute(name, 'health');
      statuses[name] = 'healthy';
    } catch (error) {
      statuses[name] = 'unhealthy';
    }
  }
  return statuses;
}
```

---

## Plugin Usage

### Analytics Plugin

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

// Install and activate analytics
await plugins.install('analytics');
await plugins.activate('analytics');

const analytics = plugins.getApi('analytics');

// Track page views
analytics.track('page_view', {
  page: window.location.pathname,
  referrer: document.referrer
});

// Track events
analytics.track('button_click', {
  button: 'signup',
  location: 'header'
});

// Track user actions
analytics.identify('user123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});
```

### Authentication Plugin

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

await plugins.install('auth');
await plugins.activate('auth');

const auth = plugins.getApi('auth');

// Configure auth
auth.configure({
  providers: ['email', 'google', 'github'],
  tokenStorage: 'localStorage',
  refreshToken: true
});

// Login
async function login(email, password) {
  try {
    const user = await auth.login({ email, password });
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// OAuth login
async function loginWithGoogle() {
  const user = await auth.loginWithProvider('google');
  console.log('Google login:', user);
}

// Logout
async function logout() {
  await auth.logout();
}

// Check auth status
const isAuthenticated = auth.isAuthenticated();
const currentUser = auth.getCurrentUser();
```

### Payments Plugin

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

await plugins.install('payments');
await plugins.activate('payments');

const payments = plugins.getApi('payments');

// Configure Stripe
payments.configure({
  provider: 'stripe',
  publicKey: 'pk_test_...'
});

// Create checkout session
async function checkout(items) {
  const session = await payments.createCheckout({
    items: items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    successUrl: '/success',
    cancelUrl: '/cancel'
  });

  // Redirect to checkout
  await payments.redirectToCheckout(session.id);
}

// Handle subscription
async function subscribe(planId) {
  const subscription = await payments.createSubscription({
    planId,
    customerId: currentUser.stripeCustomerId
  });
  return subscription;
}
```

---

## Docker Deployment

### Complete Docker Setup

```javascript
import {
  DockerfileGenerator,
  DockerComposeGenerator,
  KubernetesGenerator,
  CICDGenerator
} from 'verenajs/core/docker-integration';

// Generate Dockerfile
const dockerfile = new DockerfileGenerator();

const dockerfileContent = dockerfile.generate({
  type: 'fullstack',
  nodeVersion: '20-alpine',
  port: 3000,
  buildCommand: 'npm run build',
  startCommand: 'npm start',
  env: {
    NODE_ENV: 'production'
  }
});

// Generate Docker Compose
const compose = new DockerComposeGenerator();

const composeContent = compose.generate({
  template: 'fullStack',
  services: {
    app: {
      port: 3000,
      replicas: 3,
      healthcheck: '/health'
    },
    db: {
      type: 'postgres',
      version: '15',
      volume: './data/postgres'
    },
    cache: {
      type: 'redis',
      version: '7'
    },
    nginx: {
      upstream: 'app:3000'
    }
  }
});

// Generate Kubernetes manifests
const k8s = new KubernetesGenerator();

const k8sManifests = k8s.generate({
  name: 'my-verenajs-app',
  namespace: 'production',
  replicas: 3,
  port: 3000,
  resources: {
    requests: { cpu: '250m', memory: '256Mi' },
    limits: { cpu: '500m', memory: '512Mi' }
  },
  ingress: {
    host: 'app.example.com',
    tls: true
  },
  autoscaling: {
    minReplicas: 3,
    maxReplicas: 10,
    targetCPU: 70
  }
});

// Generate CI/CD config
const cicd = new CICDGenerator();

const githubActions = cicd.generateGitHubActions({
  branches: ['main', 'develop'],
  registry: 'ghcr.io',
  imageName: 'my-org/my-app'
});
```

---

## Mobile App

### Capacitor Integration

```javascript
// index.js
import { createContainer, createButton, createCard } from 'verenajs';

// Check if running in Capacitor
const isNative = window.Capacitor !== undefined;

const app = createContainer();

const card = createCard({
  title: isNative ? 'Mobile App' : 'Web App'
});

// Native camera button
if (isNative) {
  const cameraButton = createButton({
    label: 'Take Photo',
    onClick: async () => {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: 'uri'
      });
      console.log('Photo:', photo);
    }
  });
  card.appendChild(cameraButton);
}

// Native share
const shareButton = createButton({
  label: 'Share',
  onClick: async () => {
    if (isNative) {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: 'Check this out',
        url: 'https://verenajs.dev'
      });
    } else {
      navigator.share?.({ title: 'Check this out', url: 'https://verenajs.dev' });
    }
  }
});

card.appendChild(shareButton);
app.appendChild(card);
document.getElementById('app').appendChild(app);
```

---

## Desktop App

### Electron Integration

```javascript
// renderer.js
import { createCard, createButton, theme } from 'verenajs';

// Use Electron API via preload
const { electronAPI } = window;

theme.set('dark');

const card = createCard({ title: 'Desktop App' });

// Open file dialog
const openButton = createButton({
  label: 'Open File',
  onClick: async () => {
    const result = await electronAPI.openFile({
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] }
      ]
    });
    console.log('Selected:', result);
  }
});

// Save file dialog
const saveButton = createButton({
  label: 'Save File',
  onClick: async () => {
    const result = await electronAPI.saveFile({
      defaultPath: 'document.txt'
    });
    console.log('Save path:', result);
  }
});

// Window controls
const minimizeButton = createButton({
  label: 'Minimize',
  onClick: () => electronAPI.minimize()
});

const maximizeButton = createButton({
  label: 'Maximize',
  onClick: () => electronAPI.maximize()
});

card.appendChild(openButton);
card.appendChild(saveButton);
card.appendChild(minimizeButton);
card.appendChild(maximizeButton);

document.getElementById('app').appendChild(card);

// Listen for theme changes
electronAPI.onThemeChange((newTheme) => {
  theme.set(newTheme);
});
```

---

## Next Steps

- Read the [Usage Guide](USAGE.md) for API details
- Explore the [Visual Builder](docs/VISUAL-BUILDER.md) guide
- Check [Architecture](ARCHITECTURE.md) for internals
- See [Contributing](CONTRIBUTING.md) to add examples
