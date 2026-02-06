# Contributing to verenajs

Thank you for your interest in contributing to verenajs! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Visual Builder Development](#visual-builder-development)
- [Making Changes](#making-changes)
- [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [Component Guidelines](#component-guidelines)

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inspiring community for all.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn or pnpm
- Git
- Docker (optional, for testing deployments)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/vplusplus.git
cd vplusplus
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/muslihabdiker/vplusplus.git
```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Run Visual Builder

```bash
npm run builder
```

This launches the Visual Builder in development mode with hot reload.

---

## Project Structure

```
verenajs/
├── core/                    # Core runtime
│   ├── core.js             # Events, store, theme, DOM utils
│   ├── registry.js         # Component auto-discovery
│   ├── component-manifest.js # Component definitions
│   ├── component-generator.js # Dynamic component generation
│   ├── api-manager.js      # API, webhooks, backend connectors
│   ├── plugin-manager.js   # Plugin system
│   ├── docker-integration.js # Docker/K8s deployment
│   ├── project-integration.js # External project integration
│   ├── zeromq.js           # ZeroMQ communication
│   ├── opencv.js           # OpenCV integration
│   └── bridges/
│       └── qt.js           # Qt native bridge
├── components/              # UI components (1000+)
│   ├── buttons/            # Button component
│   │   ├── index.js        # Component factory
│   │   └── index.module.css # Scoped styles
│   └── ...
├── builder/                 # Visual Builder
│   ├── index.js            # Basic builder
│   ├── AdvancedBuilder.js  # Full-featured builder
│   └── styles.js           # Builder styles
├── compiler/                # Multi-target compiler
│   ├── index.js            # Compiler orchestration
│   ├── parser.js           # AST parser
│   ├── analyzer.js         # Dependency analysis
│   ├── optimizer.js        # Optimizations
│   └── generators/
│       ├── web.js          # Web bundles
│       ├── mobile.js       # Capacitor
│       └── desktop.js      # Electron/Qt
├── docs/                    # Documentation
│   └── index.html          # Interactive docs
├── tests/                   # Test files
├── assets/                  # Static assets
└── index.js                 # Main entry point
```

---

## Visual Builder Development

The Visual Builder is a key part of verenajs. Here's how to contribute to it:

### Builder Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Top Toolbar                                │
│  [Save] [Undo] [Redo] | [Desktop] [Tablet] [Mobile] | [Preview] [Code] │
├─────────────┬────────────────────────────────────┬─────────────────────┤
│   Left      │           Canvas Area              │        Right        │
│   Panel     │                                    │        Panel        │
│             │                                    │                     │
│  Components │        Drop Zone                   │   Properties        │
│  Layers     │        (Page Preview)              │   Settings          │
│  Pages      │                                    │   Events            │
│             │                                    │   Data              │
├─────────────┴────────────────────────────────────┴─────────────────────┤
│                            Bottom Panel                                 │
│  [Console] [Network] [Performance] [State]                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Adding New Builder Features

1. **Component Palette**: Edit `builder/AdvancedBuilder.js` to add component categories
2. **Properties Panel**: Add property editors in the `createRightPanel` function
3. **Canvas Features**: Modify `createCanvasArea` for new canvas functionality
4. **Export Formats**: Add generators in `generateCode` function

### Builder State Management

```javascript
// Builder state structure
const builderState = {
  componentTree: [],     // Component hierarchy
  selectedComponent: null, // Currently selected
  history: [],           // Undo/redo stack
  currentPage: 'index',  // Active page
  zoom: 100,             // Canvas zoom level
  device: 'desktop'      // Preview device
};
```

### Testing Builder Changes

```bash
# Run builder in dev mode
npm run builder:dev

# Run builder tests
npm run test:builder
```

---

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `builder/description` - Visual Builder changes

### Workflow

1. Create a new branch:
```bash
git checkout -b feature/my-feature
```

2. Make your changes

3. Test your changes:
```bash
npm test
npm run lint
```

4. Test the Visual Builder:
```bash
npm run builder:dev
```

5. Commit with a descriptive message:
```bash
git commit -m "feat: add new button variant"
```

6. Push to your fork:
```bash
git push origin feature/my-feature
```

7. Open a Pull Request

---

## Pull Requests

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated if needed
- [ ] Visual Builder works correctly (if applicable)
- [ ] No console.log statements left
- [ ] Commits are clean and atomic

### PR Title Format

Use conventional commits format:

- `feat: add new component`
- `fix: resolve button click issue`
- `docs: update installation guide`
- `refactor: simplify state management`
- `test: add unit tests for router`
- `chore: update dependencies`
- `builder: add new property editor`

---

## Coding Standards

### JavaScript

- Use ES Modules (`import`/`export`)
- Use `const` by default, `let` when needed
- No `var`
- Use arrow functions for callbacks
- 2-space indentation

```javascript
// Good
const createComponent = ({ label, onClick }) => {
  const el = document.createElement('div');
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
};
```

### CSS

- Use CSS Modules for component styles
- Use CSS custom properties for theming

```css
/* index.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.buttonPrimary {
  background: var(--primary, #3b82f6);
  color: white;
}
```

---

## Component Guidelines

### Component Structure

```javascript
// components/MyComponent/index.js
import styles from './index.module.css';

export function createMyComponent({ label, onClick = () => {} }) {
  const el = document.createElement('div');
  el.classList.add(styles.myComponent);
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
}
```

### Component Checklist

- [ ] Uses factory pattern (returns DOM element)
- [ ] Uses CSS Modules for styling
- [ ] Handles events properly
- [ ] Is accessible (ARIA attributes where needed)
- [ ] Is exported from index.js
- [ ] Works in Visual Builder
- [ ] Has default props

### Adding Components to Visual Builder

1. Add component to `core/component-manifest.js`:

```javascript
export const COMPONENT_CATEGORIES = {
  myCategory: {
    name: 'My Category',
    components: ['MyComponent', ...]
  }
};
```

2. Add component factory to `core/component-generator.js`:

```javascript
const COMPONENT_TEMPLATES = {
  MyComponent: {
    tag: 'div',
    defaultProps: { label: 'My Label' },
    render: (props) => { ... },
    styles: () => `...`
  }
};
```

3. Export from main index:

```javascript
// index.js
export { createMyComponent } from './components/MyComponent';
```

---

## Adding New Features

### API Manager Features

To add new API features:

1. Edit `core/api-manager.js`
2. Add new class or method
3. Export from the module
4. Add tests
5. Update documentation

### Plugin System

To add built-in plugins:

1. Add plugin definition in `core/plugin-manager.js`
2. Implement plugin API
3. Add to BUILT_IN_PLUGINS array
4. Test plugin lifecycle

### Docker Integration

To add new deployment options:

1. Edit `core/docker-integration.js`
2. Add new generator or template
3. Test Docker output
4. Update DEPLOYMENT.md

---

## Questions?

- Open an [issue](https://github.com/muslihabdiker/vplusplus/issues)
- Check existing issues and PRs
- Read the [FAQ](FAQ.md)

Thank you for contributing to verenajs!
