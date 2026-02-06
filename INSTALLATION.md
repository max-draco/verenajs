# Installation Guide

Complete guide to installing and setting up verenajs for your project.

## Quick Install

### npm
```bash
npm install verenajs
```

### yarn
```bash
yarn add verenajs
```

### pnpm
```bash
pnpm add verenajs
```

### CDN
```html
<script type="module">
  import verenajs from 'https://unpkg.com/verenajs@2.0.0/index.js';
</script>
```

---

## Requirements

### Minimum Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 18.0.0+ |
| npm | 9.0.0+ |

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## Platform-Specific Setup

### Web Development

Basic web development requires only the core package:

```bash
npm install verenajs
```

### Mobile Development (Capacitor)

For iOS/Android apps:

```bash
# Install verenajs
npm install verenajs

# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android
```

### Desktop Development (Electron)

For Windows/macOS/Linux desktop apps:

```bash
# Install verenajs
npm install verenajs

# Install Electron
npm install electron --save-dev
npm install electron-builder --save-dev
```

### Desktop Development (Qt)

For native Qt desktop apps (advanced):

**Prerequisites:**
- Qt 6.x with WebEngine module
- CMake 3.16+
- C++17 compatible compiler

```bash
# Install verenajs
npm install verenajs

# Qt bridge is included in core
# See ARCHITECTURE.md for Qt integration details
```

---

## Optional Dependencies

### ZeroMQ (Real-time Communication)

```bash
# Native ZMQ bindings (optional, for Node.js/Electron)
npm install zeromq
```

### OpenCV (Visual Processing)

OpenCV.js is loaded dynamically from CDN when needed. No installation required.

For advanced use cases with native OpenCV:
- Install OpenCV 4.x on your system
- Build with native bindings for your platform

---

## Project Setup

### New Project

```bash
# Create project directory
mkdir my-verenajs-app
cd my-verenajs-app

# Initialize npm
npm init -y

# Install verenajs
npm install verenajs

# Create entry point
touch index.js index.html
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My verenajs App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="index.js"></script>
</body>
</html>
```

### index.js
```javascript
import { createButton, createCard, theme } from 'verenajs';

theme.set('dark');

const card = createCard({ title: 'Hello verenajs!' });
const button = createButton({
  type: 'primary',
  label: 'Click Me',
  onClick: () => alert('It works!')
});

card.appendChild(button);
document.getElementById('app').appendChild(card);
```

### Run Development Server

```bash
# Using npx serve
npx serve .

# Or with webpack dev server
npm run dev
```

---

## Visual Builder Setup

The Visual Builder is included with verenajs. To enable it in your project:

### Basic Setup

```javascript
import { toggleBuilder, createAdvancedBuilder } from 'verenajs/builder';

// Enable keyboard shortcut (Ctrl+B)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'b') {
    toggleBuilder();
  }
});
```

### Full Visual Builder

```javascript
import { createAdvancedBuilder } from 'verenajs/builder';

// Create the advanced builder
const builder = createAdvancedBuilder();

// Append to body or a container
document.body.appendChild(builder);
```

### Builder with Docker Integration

```javascript
import { createAdvancedBuilder } from 'verenajs/builder';
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

const builder = createAdvancedBuilder();

// Access Docker deployment from the builder toolbar
// Click "Deploy" → "Docker" to generate Dockerfile
```

### Builder with External Project

```javascript
import { NavigatorIntegration } from 'verenajs/core/project-integration';

// Integrate with external verenajs projects
const integration = new NavigatorIntegration('/path/to/project');
await integration.initialize();

// Enable live editing with Ctrl+E
integration.enableLiveEditing();
```

---

## API Manager Setup

### Basic API Client

```javascript
import { ApiClient } from 'verenajs/core/api-manager';

const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Make requests
const users = await api.get('/users');
await api.post('/users', { name: 'John' });
```

### Webhook Manager

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

const webhooks = new WebhookManager({
  secret: process.env.WEBHOOK_SECRET
});

webhooks.register({
  id: 'orders',
  url: 'https://your-app.com/webhooks/orders',
  events: ['order.created', 'order.updated']
});
```

### Backend Connector

```javascript
import { BackendConnector } from 'verenajs/core/api-manager';

const backend = new BackendConnector();

// Connect to Python backend
await backend.connect('python', {
  host: 'localhost',
  port: 5000
});

// Execute Python functions
const result = await backend.execute('python', 'process_data', { data: [...] });
```

---

## Plugin System Setup

### Initialize Plugin Manager

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager();

// Install built-in plugins
await plugins.install('analytics');
await plugins.install('auth');
await plugins.install('charts');

// Activate plugins
await plugins.activate('analytics');
```

### Use Plugin APIs

```javascript
// Get plugin API
const analytics = plugins.getApi('analytics');

// Use plugin features
analytics.track('page_view', {
  page: '/dashboard',
  userId: 'user123'
});
```

---

## Docker Setup

### Generate Dockerfile

```javascript
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

const generator = new DockerfileGenerator();

const dockerfile = generator.generate({
  type: 'verenajs',
  nodeVersion: '20',
  port: 3000
});

// Write to file
fs.writeFileSync('Dockerfile', dockerfile);
```

### Generate Docker Compose

```javascript
import { DockerComposeGenerator } from 'verenajs/core/docker-integration';

const compose = new DockerComposeGenerator();

const config = compose.generate({
  template: 'fullStack',
  services: {
    app: { port: 3000 },
    db: { type: 'postgres' },
    cache: { type: 'redis' }
  }
});

fs.writeFileSync('docker-compose.yml', config);
```

---

## Build Configuration

### Webpack Setup

```javascript
// webpack.config.js
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: './index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  devServer: {
    port: 3000,
    hot: true
  }
};
```

### Vite Setup

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
});
```

---

## Troubleshooting

### Module not found

Ensure you're using ES modules:
```json
// package.json
{
  "type": "module"
}
```

### CSS not loading

Components use CSS modules. Ensure your bundler supports `.module.css` files.

### Visual Builder not appearing

Make sure you're calling `toggleBuilder()` or appending the builder to the DOM:
```javascript
import { createAdvancedBuilder } from 'verenajs/builder';
document.body.appendChild(createAdvancedBuilder());
```

### TypeScript errors

TypeScript definitions are coming soon. For now, use:
```typescript
// @ts-ignore
import verenajs from 'verenajs';
```

### Docker build fails

Ensure Docker is installed and running:
```bash
docker --version
docker-compose --version
```

---

## Next Steps

- Read the [Usage Guide](USAGE.md) for API documentation
- Explore the [Visual Builder](docs/VISUAL-BUILDER.md) for no-code development
- Check out [Examples](EXAMPLES.md) for code samples
- Review the [Architecture](ARCHITECTURE.md) for internals
