# Contributing to verenajs

Thank you for your interest in contributing to verenajs! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
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

---

## Project Structure

```
verenajs/
├── core/                    # Core runtime
│   ├── core.js             # Events, store, theme, DOM utils
│   ├── registry.js         # Component auto-discovery
│   ├── zeromq.js           # ZeroMQ communication
│   ├── opencv.js           # OpenCV integration
│   └── bridges/
│       └── qt.js           # Qt native bridge
├── components/              # UI components (257)
│   ├── buttons/            # Button component
│   │   ├── index.js        # Component factory
│   │   └── index.module.css # Scoped styles
│   └── ...
├── builder/                 # Visual Builder
│   ├── index.js            # Builder logic
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
├── tests/                   # Test files
├── assets/                  # Static assets
└── index.js                 # Main entry point
```

---

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

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

4. Commit with a descriptive message:
```bash
git commit -m "feat: add new button variant"
```

5. Push to your fork:
```bash
git push origin feature/my-feature
```

6. Open a Pull Request

---

## Pull Requests

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated if needed
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

---

## Questions?

- Open an [issue](https://github.com/muslihabdiker/vplusplus/issues)
- Check existing issues and PRs
- Read the [FAQ](FAQ.md)

Thank you for contributing to verenajs!
