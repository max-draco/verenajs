# Changelog

All notable changes to verenajs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-02-06

### Added

#### Core Runtime
- New reactive state management system with `store` and `Store` class
- Event bus for decoupled component communication
- Theme system with light/dark modes and custom theme support
- DOM utilities (`dom.*`) for efficient manipulation
- `createElement` helper for programmatic element creation
- `reactive` proxy for creating reactive objects
- Platform detection (`Platform.isWeb`, `Platform.isElectron`, etc.)

#### Component System
- Central export registry with auto-discovery
- 80+ components exported directly from main entry point
- Component namespace (`verenajs.components.*`) for dot-notation access
- Dynamic component loading with `loadComponent()`
- Component metadata and categorization

#### Visual Builder
- Drag-and-drop component palette
- Canvas workspace with dropzone
- Property inspector panel
- Undo/redo history
- Code generation and export
- Keyboard shortcuts (Ctrl+B to toggle, Delete to remove)
- Responsive three-column layout

#### Multi-Target Compiler
- AST-based JavaScript parser
- Dependency analyzer with tree shaking
- Dead code elimination
- Constant folding optimization
- Web bundle generator with chunking
- Mobile generator for Capacitor (iOS/Android)
- Desktop generator for Electron and Qt
- Service worker generation for PWA

#### ZeroMQ Communication
- WebSocket bridge for browser environments
- Native ZMQ support for Node.js/Electron
- Pub/Sub pattern for broadcasting
- Request/Reply pattern for RPC
- Push/Pull pattern for work distribution
- Hot reload channel for Visual Builder
- State sync channel for multi-process apps

#### Qt Bridge
- Widget mapping (verenajs to Qt widgets)
- Native file dialogs
- Window controls (minimize, maximize, close)
- System tray integration
- WebChannel and ZMQ-based communication
- CSS to Qt StyleSheet conversion

#### OpenCV Integration
- Dynamic OpenCV.js loading
- Hand-drawn layout recognition
- Contour analysis and classification
- Draw.io design file parsing
- Gesture recognition system
- Component tree generation from sketches

### Changed
- Package version bumped to 2.0.0
- Added ES Modules support (`"type": "module"`)
- Updated exports in package.json for subpath imports
- Removed React and React-DOM dependencies
- Removed @babel/preset-react from build

### Removed
- React-based components
- Virtual DOM abstractions

---

## [1.0.37] - Previous Release

### Components
- 257 UI components
- CSS Modules styling
- Factory pattern for component creation

### Build
- Webpack configuration
- Babel transpilation
- Electron packaging

---

## Migration from 1.x

### Breaking Changes

1. **No React** - All components are now pure vanilla JavaScript
2. **ES Modules** - Package now uses ES Modules (`import`/`export`)
3. **New exports** - Import paths have changed

### Migration Steps

1. Update import statements:
```javascript
// Before (1.x)
import { createButton } from 'verenajs/components/buttons';

// After (2.0)
import { createButton } from 'verenajs';
```

2. Remove React dependencies if not used elsewhere:
```bash
npm uninstall react react-dom
```

3. Ensure your project supports ES Modules:
```json
// package.json
{
  "type": "module"
}
```

4. Update bundler configuration to handle `.module.css` files

---

## Versioning

verenajs follows Semantic Versioning:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, backwards compatible
