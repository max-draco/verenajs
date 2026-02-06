# Troubleshooting

Common issues and solutions for verenajs.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Component Issues](#component-issues)
- [Visual Builder Issues](#visual-builder-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [API & Backend Issues](#api--backend-issues)
- [Docker Issues](#docker-issues)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Installation Issues

### Module not found: 'verenajs'

**Problem**: Error when importing verenajs.

**Solution**: Ensure verenajs is installed and your project uses ES modules.

```bash
npm install verenajs
```

Add to `package.json`:
```json
{
  "type": "module"
}
```

### Peer dependency warnings

**Problem**: npm shows peer dependency warnings.

**Solution**: These are usually safe to ignore. Install peer dependencies if needed:

```bash
npm install --legacy-peer-deps
```

### Permission denied during install

**Problem**: EACCES error on npm install.

**Solution**: Fix npm permissions:

```bash
# Option 1: Use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Option 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

---

## Component Issues

### Component not rendering

**Problem**: Component appears blank or doesn't show.

**Solution**: Ensure you're appending the component to the DOM:

```javascript
import { createButton } from 'verenajs';

const button = createButton({ label: 'Click Me' });

// Make sure to append to DOM
document.getElementById('app').appendChild(button);
```

### CSS styles not applying

**Problem**: Components have no styling.

**Solution**: Ensure your bundler handles CSS modules:

```javascript
// webpack.config.js
{
  test: /\.module\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    }
  ]
}
```

For Vite:
```javascript
// vite.config.js
css: {
  modules: {
    localsConvention: 'camelCase'
  }
}
```

### Event handlers not working

**Problem**: onClick and other events don't fire.

**Solution**: Check that you're passing functions, not calling them:

```javascript
// Wrong
createButton({ onClick: handleClick() });

// Correct
createButton({ onClick: handleClick });
createButton({ onClick: () => handleClick() });
```

### Theme not applying

**Problem**: Theme changes don't affect components.

**Solution**: Set theme before creating components:

```javascript
import { theme, createButton } from 'verenajs';

// Set theme first
theme.set('dark');

// Then create components
const button = createButton({ label: 'Themed' });
```

---

## Visual Builder Issues

### Visual Builder not appearing

**Problem**: `toggleBuilder()` doesn't show anything.

**Solution**: Use the advanced builder directly:

```javascript
import { createAdvancedBuilder } from 'verenajs/builder';

const builder = createAdvancedBuilder();
document.body.appendChild(builder);
```

Or check for keyboard shortcut conflicts (Ctrl+B).

### Components not draggable

**Problem**: Can't drag components from palette.

**Solution**: Ensure the builder is properly initialized:

```javascript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const builder = createAdvancedBuilder();
  document.body.appendChild(builder);
});
```

### Code export produces empty output

**Problem**: Generated code is blank.

**Solution**: Check that you have components in the tree:

```javascript
import { builderState, generateCode } from 'verenajs/builder';

// Check for components
console.log(builderState.componentTree);

// Generate only if components exist
if (builderState.componentTree.length > 0) {
  const code = generateCode(builderState.componentTree, 'verenajs');
}
```

### Canvas not responsive

**Problem**: Canvas doesn't resize with window.

**Solution**: The canvas should auto-resize. If not, trigger a resize:

```javascript
window.dispatchEvent(new Event('resize'));
```

### Undo/Redo not working

**Problem**: Ctrl+Z doesn't undo changes.

**Solution**: Ensure the builder has focus. Click on the builder area first.

---

## Build Issues

### Build fails with syntax errors

**Problem**: Webpack/Vite fails to build.

**Solution**: Ensure you have the correct Babel configuration:

```json
// babel.config.json
{
  "presets": [
    ["@babel/preset-env", { "modules": false }]
  ]
}
```

### Tree shaking not working

**Problem**: Bundle includes unused components.

**Solution**: Use named imports:

```javascript
// This enables tree shaking
import { createButton, createCard } from 'verenajs';

// This imports everything
import verenajs from 'verenajs'; // Avoid for smaller bundles
```

### Large bundle size

**Problem**: Production bundle is too large.

**Solution**:

1. Enable tree shaking
2. Use dynamic imports for heavy components
3. Split your bundle:

```javascript
// Dynamic import for DataTable
const DataTable = await import('verenajs').then(m => m.createDataTable);
```

### CSS not included in build

**Problem**: Styles missing in production.

**Solution**: Check your bundler's CSS handling:

```bash
# For webpack
npm install style-loader css-loader --save-dev
```

---

## Runtime Issues

### "document is not defined"

**Problem**: SSR environments fail.

**Solution**: verenajs requires a DOM. Use conditional imports:

```javascript
let createButton;
if (typeof window !== 'undefined') {
  createButton = (await import('verenajs')).createButton;
}
```

### Memory leaks

**Problem**: Application slows down over time.

**Solution**: Clean up event listeners:

```javascript
// Store reference
const handler = () => console.log('clicked');
button.addEventListener('click', handler);

// Clean up when done
button.removeEventListener('click', handler);

// Or use dom.on which returns a cleanup function
import { dom } from 'verenajs';
const cleanup = dom.on(button, 'click', handler);
cleanup(); // Call to remove listener
```

### Store updates not reflecting

**Problem**: State changes don't update UI.

**Solution**: Subscribe to store changes:

```javascript
import { store } from 'verenajs';

const unsubscribe = store.subscribe((state, prevState) => {
  if (state.data !== prevState.data) {
    updateUI(state.data);
  }
});

// Don't forget to unsubscribe when done
unsubscribe();
```

---

## API & Backend Issues

### API requests failing with CORS

**Problem**: Cross-origin request blocked.

**Solution**: Configure your backend to allow CORS, or use a proxy:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
};
```

### Webhook signatures invalid

**Problem**: Webhook verification fails.

**Solution**: Ensure you're using the correct secret and payload:

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

const webhooks = new WebhookManager({
  secret: process.env.WEBHOOK_SECRET // Must match sender
});

// Verify with raw body (not parsed JSON)
const isValid = webhooks.verify(signature, rawBody);
```

### Backend connector timeout

**Problem**: Backend requests time out.

**Solution**: Increase timeout or check backend health:

```javascript
const backend = new BackendConnector();

await backend.connect('python', {
  host: 'localhost',
  port: 5000,
  timeout: 30000 // 30 seconds
});
```

---

## Docker Issues

### Docker build fails

**Problem**: Dockerfile build errors.

**Solution**: Ensure all files are in context:

```bash
# Check .dockerignore isn't excluding needed files
cat .dockerignore

# Common files to NOT ignore:
# - package.json
# - package-lock.json
# - src/
```

### Container crashes on start

**Problem**: Container exits immediately.

**Solution**: Check logs and ensure correct start command:

```bash
docker logs container-name

# Common issue: wrong CMD
CMD ["npm", "start"]  # Correct
CMD "npm start"        # Wrong (runs in shell)
```

### Can't connect to container

**Problem**: Port not accessible.

**Solution**: Ensure port mapping is correct:

```bash
# Map container port 3000 to host port 3000
docker run -p 3000:3000 my-app

# Check if container is running
docker ps
```

---

## Platform-Specific Issues

### Electron: White screen on start

**Problem**: Electron app shows blank window.

**Solution**: Check the entry point and preload script:

```javascript
// main.js
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});

win.loadFile('dist/index.html');
```

### Qt: Bridge not connecting

**Problem**: Qt bridge initialization fails.

**Solution**: Ensure Qt WebChannel is properly set up:

```javascript
import { initQtBridge } from 'verenajs/core/bridges/qt';

try {
  await initQtBridge();
} catch (error) {
  console.log('Not running in Qt environment');
}
```

### Capacitor: Native features not working

**Problem**: Camera, share, etc. not available.

**Solution**: Install and sync Capacitor plugins:

```bash
npm install @capacitor/camera @capacitor/share

npx cap sync
```

### ZeroMQ: Connection refused

**Problem**: ZeroMQ can't connect.

**Solution**: Check the WebSocket URL and server:

```javascript
await zmq.initialize({
  wsUrl: 'wss://your-server.com:5555' // Use wss:// for production
});
```

---

## Getting Help

If you can't find a solution:

1. Search [existing issues](https://github.com/muslihabdiker/vplusplus/issues)
2. Check the [FAQ](FAQ.md)
3. Open a new issue with:
   - verenajs version
   - Node.js version
   - Browser/environment
   - Minimal reproduction code
   - Error messages

---

## Next Steps

- Read the [Usage Guide](USAGE.md)
- Check [FAQ](FAQ.md) for common questions
- Review [SECURITY.md](SECURITY.md) for security issues
