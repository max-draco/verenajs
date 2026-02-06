# Frequently Asked Questions

Common questions about verenajs.

---

## General

### What is verenajs?

verenajs is a vanilla JavaScript framework for building web, mobile, and desktop applications from a single codebase. It provides 257 production-ready UI components, a visual builder, and multi-platform compilation.

### How is verenajs different from React/Vue?

| Feature | verenajs | React/Vue |
|---------|----------|-----------|
| Virtual DOM | No | Yes |
| Framework overhead | Minimal | Significant |
| Learning curve | Low | Medium-High |
| Bundle size | Small | Larger |
| Native DOM | Yes | No |
| Multi-platform | Built-in | Requires extras |

### Is verenajs production-ready?

Yes. verenajs 2.0 includes 257 battle-tested components and is suitable for production use. The framework is actively maintained.

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

For development, you can use verenajs directly in the browser with ES modules. For production, we recommend using a bundler like Webpack or Vite.

---

## Components

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

### How do I open the Visual Builder?

```javascript
import { toggleBuilder } from 'verenajs/builder';

// Press Ctrl+B or:
toggleBuilder();
```

### Can I export code from the Visual Builder?

Yes! Click the Export button or use:

```javascript
import { generateCode, builderState } from 'verenajs/builder';
const code = generateCode(builderState.componentTree);
```

### Is the Visual Builder included in production builds?

The Visual Builder is in a separate module (`verenajs/builder`) and is tree-shaken out if not imported.

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
