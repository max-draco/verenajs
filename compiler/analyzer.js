/**
 * verenajs Analyzer
 * Analyzes AST for dependencies, component usage, and optimization opportunities
 */

/**
 * Dependency Graph
 */
class DependencyGraph {
  constructor() {
    this.nodes = new Map(); // file -> { imports, exports, dependencies }
    this.edges = new Map(); // file -> Set<file>
  }

  addNode(file, data = {}) {
    if (!this.nodes.has(file)) {
      this.nodes.set(file, {
        imports: [],
        exports: [],
        dependencies: new Set(),
        ...data
      });
      this.edges.set(file, new Set());
    }
    return this.nodes.get(file);
  }

  addEdge(from, to) {
    if (!this.edges.has(from)) {
      this.addNode(from);
    }
    this.edges.get(from).add(to);
    this.nodes.get(from).dependencies.add(to);
  }

  getDependencies(file) {
    return this.edges.get(file) || new Set();
  }

  getAllDependencies(file, visited = new Set()) {
    if (visited.has(file)) return visited;
    visited.add(file);

    const deps = this.edges.get(file);
    if (deps) {
      for (const dep of deps) {
        this.getAllDependencies(dep, visited);
      }
    }

    return visited;
  }

  getEntryPoints() {
    const imported = new Set();
    for (const deps of this.edges.values()) {
      for (const dep of deps) {
        imported.add(dep);
      }
    }

    return Array.from(this.nodes.keys()).filter(n => !imported.has(n));
  }

  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (node) => {
      if (temp.has(node)) {
        throw new Error(`Circular dependency detected: ${node}`);
      }
      if (visited.has(node)) return;

      temp.add(node);

      const deps = this.edges.get(node);
      if (deps) {
        for (const dep of deps) {
          visit(dep);
        }
      }

      temp.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return sorted;
  }
}

/**
 * Analyzer Class
 */
class Analyzer {
  constructor() {
    this.graph = new DependencyGraph();
  }

  /**
   * Analyze AST
   */
  analyze(ast) {
    const result = {
      file: ast.file,
      components: [],
      dependencies: new Set(),
      exports: [],
      usedComponents: new Set(),
      unusedExports: [],
      sideEffects: [],
      styleImports: [],
      asyncComponents: []
    };

    // Add node to graph
    this.graph.addNode(ast.file);

    // Analyze imports
    for (const imp of ast.imports) {
      result.dependencies.add(imp.source);
      this.graph.addEdge(ast.file, imp.source);

      // Track component imports
      for (const spec of imp.specifiers) {
        if (spec.name.startsWith('create')) {
          result.usedComponents.add(spec.name);
        }
      }

      // Track style imports
      if (imp.source.endsWith('.css') || imp.source.endsWith('.scss')) {
        result.styleImports.push(imp.source);
      }
    }

    // Analyze components
    for (const comp of ast.components) {
      result.components.push({
        name: comp.name,
        params: comp.params,
        hasBody: !!comp.body,
        isAsync: this.isAsyncComponent(comp)
      });

      if (this.isAsyncComponent(comp)) {
        result.asyncComponents.push(comp.name);
      }
    }

    // Analyze exports
    for (const exp of ast.exports) {
      if (exp.declaration) {
        result.exports.push({
          name: exp.declaration.name,
          isDefault: exp.default,
          type: exp.declaration.type
        });
      }
    }

    // Detect side effects
    result.sideEffects = this.detectSideEffects(ast);

    return result;
  }

  /**
   * Check if component is async
   */
  isAsyncComponent(component) {
    // Components that use async patterns
    return component.name.includes('Async') ||
           component.name.includes('Lazy') ||
           component.params.some(p => p.includes('async') || p.includes('promise'));
  }

  /**
   * Detect side effects in AST
   */
  detectSideEffects(ast) {
    const effects = [];

    // Top-level function calls are side effects
    for (const node of ast.body) {
      if (node.type === 'Call') {
        effects.push({
          type: 'call',
          name: node.name
        });
      }
    }

    // DOM manipulation outside of components
    // Event listener additions
    // Global variable modifications

    return effects;
  }

  /**
   * Find circular dependencies
   */
  findCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const stack = new Set();

    const dfs = (node, path = []) => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      stack.add(node);
      path.push(node);

      const deps = this.graph.edges.get(node);
      if (deps) {
        for (const dep of deps) {
          dfs(dep, [...path]);
        }
      }

      stack.delete(node);
    };

    for (const node of this.graph.nodes.keys()) {
      dfs(node);
    }

    return cycles;
  }

  /**
   * Get component dependency tree
   */
  getComponentTree(componentName) {
    const tree = {
      name: componentName,
      dependencies: [],
      usedBy: []
    };

    // Find all components that use this component
    for (const [file, node] of this.graph.nodes) {
      // Check if this file imports the component
      // This would require more detailed tracking
    }

    return tree;
  }

  /**
   * Calculate bundle chunks
   */
  calculateChunks() {
    const chunks = {
      main: new Set(),
      vendor: new Set(),
      async: new Map()
    };

    for (const [file, node] of this.graph.nodes) {
      // Vendor chunk: external dependencies
      if (file.includes('node_modules')) {
        chunks.vendor.add(file);
        continue;
      }

      // Async chunks: components loaded lazily
      if (node.asyncComponents?.length > 0) {
        for (const comp of node.asyncComponents) {
          if (!chunks.async.has(comp)) {
            chunks.async.set(comp, new Set());
          }
          chunks.async.get(comp).add(file);
        }
        continue;
      }

      // Main chunk
      chunks.main.add(file);
    }

    return chunks;
  }

  /**
   * Get unused exports
   */
  getUnusedExports() {
    const used = new Set();
    const exported = new Map();

    // Collect all exports
    for (const [file, node] of this.graph.nodes) {
      for (const exp of (node.exports || [])) {
        exported.set(`${file}:${exp.name}`, exp);
      }
    }

    // Mark used exports
    for (const [file, node] of this.graph.nodes) {
      for (const imp of (node.imports || [])) {
        for (const spec of (imp.specifiers || [])) {
          used.add(`${imp.source}:${spec.name}`);
        }
      }
    }

    // Find unused
    const unused = [];
    for (const [key, exp] of exported) {
      if (!used.has(key) && !exp.isDefault) {
        unused.push({ ...exp, key });
      }
    }

    return unused;
  }

  /**
   * Get bundle size estimation
   */
  estimateBundleSize() {
    let totalSize = 0;
    const sizes = new Map();

    for (const file of this.graph.nodes.keys()) {
      // Estimate based on file
      // In real implementation, would read actual file sizes
      const estimated = 1024; // placeholder
      sizes.set(file, estimated);
      totalSize += estimated;
    }

    return {
      total: totalSize,
      files: sizes
    };
  }
}

export { Analyzer, DependencyGraph };
export default Analyzer;
