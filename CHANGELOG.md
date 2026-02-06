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
- **1000+ production-ready components** across 40+ categories
- Central export registry with auto-discovery
- Component namespace (`verenajs.components.*`) for dot-notation access
- Dynamic component loading with `loadComponent()`
- Component metadata and categorization
- Component generation system for rapid development

#### Component Categories
- Layout: Container, Grid, Masonry, Section, Splitter, Sidebar, Navbar
- Forms: Input, Select, Checkbox, DatePicker, FileUploader, RichTextEditor
- Display: Card, Modal, Alert, Badge, Avatar, Skeleton, Accordion
- Data: DataTable, TreeView, VirtualList, Kanban, Timeline
- Charts: Line, Bar, Pie, Candlestick, Heatmap, Gauge
- Trading: OrderBook, MarketChart, TradeHistory, OrderForm, Portfolio
- Real-time: LiveChart, TickerTape, NotificationCenter, ActivityFeed
- AI: ChatInterface, ModelViewer, PredictionCard
- DevOps: Terminal, LogViewer, MetricsDashboard
- And 30+ more categories...

#### Advanced Visual Builder
- Professional drag-and-drop interface (better than Elementor)
- Left panel with component palette (1000+ components)
- Center canvas with device preview (Desktop/Tablet/Mobile)
- Right panel with property editor (styles, events, data bindings)
- Bottom panel with console, network, performance, state inspector
- Layers tree for component hierarchy
- Multi-page support
- Undo/redo history (100 steps)
- Code export to verenajs, React, Vue, HTML
- Docker deployment dialog
- Keyboard shortcuts

#### API Management
- `ApiClient` with caching, retries, and interceptors
- `WebhookManager` with HMAC signature generation/verification
- `WebSocketManager` with auto-reconnect
- `BackendConnector` with adapters for Node.js, Python, Go, PHP
- `GraphQLClient` with query caching
- `DataSourceManager` with auto-refresh
- `ApiEndpointBuilder` with OpenAPI spec generation

#### Plugin System
- `PluginManager` for plugin lifecycle management
- Hook system (BEFORE_INIT, AFTER_INIT, STATE_CHANGE, etc.)
- Built-in plugins: analytics, auth, payments, email, charts, maps
- `PluginMarketplace` for remote plugin discovery

#### Docker Integration
- `DockerfileGenerator` with multi-stage build support
- `DockerComposeGenerator` with templates
- `KubernetesGenerator` for k8s manifests
- `CICDGenerator` for GitHub Actions, GitLab CI, Jenkins
- Project templates: verenajs, static, fullstack, development

#### Project Integration
- `ProjectScanner` for discovering verenajs usage in external projects
- `LiveEditorBridge` for in-place editing (Ctrl+E)
- `NavigatorIntegration` for theschicht markets project
- Real-time style editing with properties panel

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

#### Documentation
- Comprehensive MD documentation for all features
- Interactive HTML documentation page
- Code samples for all components
- Visual Builder usage guides
- API reference

### Changed
- Package version bumped to 2.0.0
- Added ES Modules support (`"type": "module"`)
- Updated exports in package.json for subpath imports
- Removed React and React-DOM dependencies
- Removed @babel/preset-react from build
- Updated README with Visual Builder documentation
- Expanded architecture documentation

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

### New Features Available

After migrating, you can use:

```javascript
// Visual Builder
import { createAdvancedBuilder } from 'verenajs/builder';

// API Management
import { ApiClient, WebhookManager } from 'verenajs/core/api-manager';

// Plugin System
import { PluginManager } from 'verenajs/core/plugin-manager';

// Docker Deployment
import { DockerfileGenerator } from 'verenajs/core/docker-integration';
```

---

## Versioning

verenajs follows Semantic Versioning:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, backwards compatible
