# Frequently Asked Questions

Common questions about verenajs.

---

## General

### What is verenajs?

verenajs is a vanilla JavaScript framework for building web, mobile, and desktop applications from a single codebase. It provides 1000+ production-ready UI components, a professional Visual Builder, and multi-platform compilation.

### How is verenajs different from React/Vue?

| Feature | verenajs | React/Vue |
|---------|----------|-----------|
| Virtual DOM | No | Yes |
| Framework overhead | Minimal | Significant |
| Learning curve | Low | Medium-High |
| Bundle size | Small | Larger |
| Native DOM | Yes | No |
| Multi-platform | Built-in | Requires extras |
| Visual Builder | Built-in | Third-party |
| Components | 1000+ | Varies |

### Is verenajs production-ready?

Yes. verenajs 2.0 includes 1000+ battle-tested components and is suitable for production use. The framework is actively maintained with regular updates.

### What browsers are supported?

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Installation

### How do I install verenajs?

```bash
npm install verenajs
```

Or via CDN:
```html
<script type="module">
  import verenajs from 'https://unpkg.com/verenajs@2.0.0/index.js';
</script>
```

### What are the requirements?

- Node.js 18+
- Modern browser with ES Module support

### Do I need a build tool?

For development, you can use verenajs directly in the browser with ES modules. For production, we recommend using a bundler like Webpack or Vite for optimization.

---

## Components

### How many components are included?

verenajs includes 1000+ production-ready components across 40+ categories:

- Layout: Container, Grid, Masonry, Splitter, etc.
- Forms: Input, Select, DatePicker, FileUploader, etc.
- Data: DataTable, TreeView, Kanban, Timeline, etc.
- Charts: Line, Bar, Pie, Candlestick, Heatmap, etc.
- Trading: OrderBook, MarketChart, TradeHistory, etc.
- And many more...

### How do I create a component?

```javascript
import { createButton } from 'verenajs';

const button = createButton({
  type: 'primary',
  label: 'Click Me',
  onClick: () => console.log('Clicked!')
});

document.body.appendChild(button);
```

### How do I style components?

Components use CSS Modules internally. You can also apply inline styles:

```javascript
const button = createButton({ label: 'Styled' });
button.style.backgroundColor = '#8b5cf6';
button.style.borderRadius = '8px';
```

Or use the theme system:

```javascript
import { theme } from 'verenajs';
theme.set('dark');
```

### Can I create custom components?

Yes! Follow the factory pattern:

```javascript
export function createMyComponent({ label, onClick }) {
  const el = document.createElement('div');
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
}
```

---

## Visual Builder

### What is the Visual Builder?

The Visual Builder is a professional drag-and-drop interface for building applications without writing code. It's similar to WordPress Elementor or Webflow, but specifically designed for verenajs applications.

### How do I open the Visual Builder?

```javascript
import { toggleBuilder } from 'verenajs/builder';

// Press Ctrl+B or:
toggleBuilder();

// Or use the advanced builder
import { createAdvancedBuilder } from 'verenajs/builder';
const builder = createAdvancedBuilder();
document.body.appendChild(builder);
```

### What features does the Visual Builder have?

- Drag-and-drop component palette (1000+ components)
- Device preview (Desktop, Tablet, Mobile)
- Property inspector (styles, events, data bindings)
- Layers tree (component hierarchy)
- Multi-page support
- Undo/redo history (100 steps)
- Code export (verenajs, React, Vue, HTML)
- Docker deployment dialog
- Keyboard shortcuts

### Can I export code from the Visual Builder?

Yes! Click the Export button or use:

```javascript
import { generateCode, builderState } from 'verenajs/builder';

// Export to verenajs
const verenajsCode = generateCode(builderState.componentTree, 'verenajs');

// Export to React
const reactCode = generateCode(builderState.componentTree, 'react');

// Export to Vue
const vueCode = generateCode(builderState.componentTree, 'vue');

// Export to HTML
const htmlCode = generateCode(builderState.componentTree, 'html');
```

### Is the Visual Builder included in production builds?

The Visual Builder is in a separate module (`verenajs/builder`) and is tree-shaken out if not imported.

### Can I deploy directly from the Visual Builder?

Yes! The Visual Builder includes deployment options:
- Docker (generates Dockerfile)
- Kubernetes (generates K8s manifests)
- Download source code

---

## API Management

### Does verenajs include API management?

Yes! verenajs includes a comprehensive API management system:

```javascript
import { ApiClient, WebhookManager, BackendConnector } from 'verenajs/core/api-manager';

// API Client with caching and retries
const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  cache: { ttl: 300000 },
  retry: { maxRetries: 3 }
});

// Webhook management with HMAC signatures
const webhooks = new WebhookManager({ secret: 'your-secret' });

// Backend connections (Node.js, Python, Go, PHP)
const backend = new BackendConnector();
await backend.connect('python', { host: 'localhost', port: 5000 });
```

---

## Plugin System

### What plugins are available?

Built-in plugins include:
- **analytics**: Event tracking and user analytics
- **auth**: Authentication (email, OAuth)
- **payments**: Payment processing (Stripe)
- **email**: Email sending
- **charts**: Advanced charting
- **maps**: Map integrations

### How do I use plugins?

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

await plugins.install('analytics');
await plugins.activate('analytics');

const analytics = plugins.getApi('analytics');
analytics.track('page_view', { page: '/home' });
```

---

## Multi-Platform

### How do I build for mobile?

```bash
npm run build:mobile
```

This generates Capacitor-compatible output for iOS and Android.

### How do I build for desktop?

```bash
npm run build:desktop
```

This generates Electron and Qt configurations.

### Can I use native features?

Yes! Use the platform bridges:

```javascript
// Qt (desktop)
import { QtDialogs } from 'verenajs/core/bridges/qt';
const file = await QtDialogs.openFile();

// Capacitor (mobile)
import { Camera } from '@capacitor/camera';
const photo = await Camera.getPhoto();
```

---

## Docker & Deployment

### Does verenajs support Docker?

Yes! verenajs includes Docker integration:

```javascript
import { DockerfileGenerator, DockerComposeGenerator } from 'verenajs/core/docker-integration';

const dockerfile = new DockerfileGenerator();
const dockerfileContent = dockerfile.generate({
  type: 'verenajs',
  nodeVersion: '20',
  port: 3000
});
```

### Can I generate Kubernetes manifests?

Yes!

```javascript
import { KubernetesGenerator } from 'verenajs/core/docker-integration';

const k8s = new KubernetesGenerator();
const manifests = k8s.generate({
  name: 'my-app',
  replicas: 3,
  port: 3000
});
```

---

## State Management

### How do I manage global state?

```javascript
import { store } from 'verenajs';

store.setState({ user: null });
store.subscribe((state) => console.log(state));
store.setState({ user: { name: 'John' } });
```

### How do I communicate between components?

Use the event bus:

```javascript
import { events } from 'verenajs';

// Subscribe
events.on('user:login', (user) => {
  console.log('User:', user);
});

// Emit
events.emit('user:login', { name: 'John' });
```

---

## Troubleshooting

### "Module not found" error

Ensure your project uses ES modules:

```json
// package.json
{
  "type": "module"
}
```

### CSS not loading

Ensure your bundler handles `.module.css` files. For Webpack:

```javascript
{
  test: /\.module\.css$/,
  use: ['style-loader', 'css-loader?modules=true']
}
```

### TypeScript errors

TypeScript definitions are coming in v2.1. For now:

```typescript
// @ts-ignore
import { createButton } from 'verenajs';
```

### Visual Builder not appearing

Make sure you're appending the builder to the DOM:

```javascript
import { createAdvancedBuilder } from 'verenajs/builder';
document.body.appendChild(createAdvancedBuilder());
```

---

## Contributing

### How can I contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Where do I report bugs?

Open an issue at [github.com/muslihabdiker/vplusplus/issues](https://github.com/muslihabdiker/vplusplus/issues)

### Who maintains this project?

verenajs is maintained by Muslih Ali and the open-source community.

---

## More Questions?

- Check the [Documentation](USAGE.md)
- Open an [Issue](https://github.com/muslihabdiker/vplusplus/issues)
- Read the [Examples](EXAMPLES.md)
- Explore the [Visual Builder](docs/VISUAL-BUILDER.md) guide
