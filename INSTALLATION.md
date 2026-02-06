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

### TypeScript errors

TypeScript definitions are coming soon. For now, use:
```typescript
// @ts-ignore
import verenajs from 'verenajs';
```

---

## Next Steps

- Read the [Usage Guide](USAGE.md) for API documentation
- Check out [Examples](EXAMPLES.md) for code samples
- Explore the [Architecture](ARCHITECTURE.md) for internals
