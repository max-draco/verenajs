/**
 * verenajs Visual Builder Styles
 * Modern, premium styling for the builder interface
 */

export const builderStyles = `
/* Builder Container */
.vb-builder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 260px 1fr 300px;
  background: var(--vb-bg, #0f172a);
  color: var(--vb-text, #f1f5f9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  z-index: 99999;
}

/* Palette */
.vb-palette {
  background: var(--vb-surface, #1e293b);
  border-right: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vb-palette-header {
  padding: 16px;
  border-bottom: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vb-palette-header span {
  font-weight: 600;
  font-size: 14px;
  color: var(--vb-text, #f1f5f9);
}

.vb-search {
  width: 100%;
  padding: 8px 12px;
  background: var(--vb-input-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 6px;
  color: var(--vb-text, #f1f5f9);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.vb-search:focus {
  border-color: var(--vb-primary, #3b82f6);
}

.vb-search::placeholder {
  color: var(--vb-text-muted, #64748b);
}

.vb-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.vb-category {
  margin-bottom: 4px;
}

.vb-category-header {
  padding: 8px 12px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.vb-category-header:hover {
  background: var(--vb-hover, rgba(255,255,255,0.05));
}

.vb-category.collapsed .vb-component-list {
  display: none;
}

.vb-component-list {
  padding: 4px 0 4px 12px;
}

.vb-component-item {
  padding: 8px 12px;
  margin: 2px 0;
  background: var(--vb-item-bg, rgba(255,255,255,0.03));
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.15s;
}

.vb-component-item:hover {
  background: var(--vb-primary, #3b82f6);
  border-color: var(--vb-primary, #3b82f6);
}

.vb-component-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

/* Canvas */
.vb-canvas {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vb-canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--vb-surface, #1e293b);
  border-bottom: 1px solid var(--vb-border, #334155);
}

.vb-tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--vb-text-muted, #94a3b8);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
}

.vb-tool-btn:hover {
  background: var(--vb-hover, rgba(255,255,255,0.05));
  color: var(--vb-text, #f1f5f9);
}

.vb-tool-btn.active {
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-export-btn {
  width: auto;
  padding: 0 16px;
  gap: 6px;
  background: var(--vb-primary, #3b82f6);
  color: white;
}

.vb-export-btn:hover {
  background: var(--vb-primary-hover, #2563eb);
}

.vb-divider {
  width: 1px;
  height: 20px;
  background: var(--vb-border, #334155);
  margin: 0 4px;
}

.vb-zoom-select {
  padding: 6px 8px;
  background: var(--vb-input-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 4px;
  color: var(--vb-text, #f1f5f9);
  font-size: 12px;
  cursor: pointer;
}

.vb-workspace {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background:
    linear-gradient(90deg, var(--vb-grid, rgba(255,255,255,0.02)) 1px, transparent 1px),
    linear-gradient(var(--vb-grid, rgba(255,255,255,0.02)) 1px, transparent 1px);
  background-size: 20px 20px;
  transform-origin: top left;
  transition: transform 0.2s;
}

.vb-workspace:not(.show-grid) {
  background: var(--vb-bg, #0f172a);
}

.vb-dropzone {
  min-height: 400px;
  background: var(--vb-surface, #1e293b);
  border: 2px dashed var(--vb-border, #334155);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.vb-dropzone[data-empty="true"] {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vb-dropzone-hint {
  color: var(--vb-text-muted, #64748b);
  font-size: 14px;
}

.vb-dropzone.drag-over {
  border-color: var(--vb-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

/* Component Wrapper */
.vb-component-wrapper {
  position: relative;
  margin: 8px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.15s;
}

.vb-component-wrapper:hover {
  border-color: var(--vb-primary, #3b82f6);
}

.vb-component-wrapper.selected {
  border-color: var(--vb-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.vb-component-wrapper.drag-over {
  border-color: var(--vb-success, #22c55e);
}

.vb-component-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  z-index: 1;
}

.vb-component-wrapper.selected .vb-component-overlay {
  pointer-events: none;
}

/* Resize Handles */
.vb-resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--vb-primary, #3b82f6);
  border: 2px solid white;
  border-radius: 50%;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.15s;
}

.vb-component-wrapper.selected .vb-resize-handle {
  opacity: 1;
}

.vb-resize-nw { top: -4px; left: -4px; cursor: nwse-resize; }
.vb-resize-n { top: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.vb-resize-ne { top: -4px; right: -4px; cursor: nesw-resize; }
.vb-resize-e { top: 50%; right: -4px; transform: translateY(-50%); cursor: ew-resize; }
.vb-resize-se { bottom: -4px; right: -4px; cursor: nwse-resize; }
.vb-resize-s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.vb-resize-sw { bottom: -4px; left: -4px; cursor: nesw-resize; }
.vb-resize-w { top: 50%; left: -4px; transform: translateY(-50%); cursor: ew-resize; }

/* Inspector */
.vb-inspector {
  background: var(--vb-surface, #1e293b);
  border-left: 1px solid var(--vb-border, #334155);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vb-inspector-header {
  padding: 16px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--vb-border, #334155);
}

.vb-inspector-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.vb-inspector-empty {
  color: var(--vb-text-muted, #64748b);
  text-align: center;
  padding: 32px 16px;
}

.vb-prop-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vb-border, #334155);
}

.vb-prop-section {
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--vb-text-muted, #64748b);
  margin: 16px 0 8px;
  padding-top: 16px;
  border-top: 1px solid var(--vb-border, #334155);
}

.vb-prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.vb-prop-label {
  font-size: 12px;
  color: var(--vb-text-muted, #94a3b8);
}

.vb-prop-input,
.vb-prop-select {
  width: 100%;
  padding: 8px 10px;
  background: var(--vb-input-bg, #0f172a);
  border: 1px solid var(--vb-border, #334155);
  border-radius: 6px;
  color: var(--vb-text, #f1f5f9);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.vb-prop-input:focus,
.vb-prop-select:focus {
  border-color: var(--vb-primary, #3b82f6);
}

.vb-prop-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vb-prop-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.vb-delete-btn {
  width: 100%;
  padding: 10px;
  background: var(--vb-error, #ef4444);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.vb-delete-btn:hover {
  background: #dc2626;
}

/* Scrollbar Styling */
.vb-builder ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.vb-builder ::-webkit-scrollbar-track {
  background: transparent;
}

.vb-builder ::-webkit-scrollbar-thumb {
  background: var(--vb-border, #334155);
  border-radius: 4px;
}

.vb-builder ::-webkit-scrollbar-thumb:hover {
  background: var(--vb-text-muted, #64748b);
}

/* Responsive */
@media (max-width: 1024px) {
  .vb-builder {
    grid-template-columns: 200px 1fr 240px;
  }
}

@media (max-width: 768px) {
  .vb-builder {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .vb-palette,
  .vb-inspector {
    max-height: 30vh;
  }
}
`;

export default builderStyles;
