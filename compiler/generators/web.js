/**
 * verenajs Web Generator
 * Generates optimized web bundles
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Web Generator Class
 */
class WebGenerator {
  constructor(config) {
    this.config = config;
  }

  /**
   * Generate web bundle
   */
  async generate(ast, analysis) {
    const chunks = this.createChunks(ast, analysis);
    const outputs = [];

    // Generate main bundle
    const mainBundle = this.generateBundle(chunks.main, 'main');
    outputs.push(mainBundle);

    // Generate vendor bundle
    if (chunks.vendor.size > 0) {
      const vendorBundle = this.generateBundle(chunks.vendor, 'vendor');
      outputs.push(vendorBundle);
    }

    // Generate async chunks
    for (const [name, files] of chunks.async) {
      const asyncBundle = this.generateBundle(files, `async-${name}`);
      asyncBundle.async = true;
      outputs.push(asyncBundle);
    }

    // Generate runtime
    const runtime = this.generateRuntime(outputs);
    outputs.unshift(runtime);

    // Generate HTML entry
    const html = this.generateHTML(outputs);

    // Generate service worker for PWA
    if (this.config.pwa) {
      const sw = this.generateServiceWorker(outputs);
      outputs.push(sw);
    }

    // Write outputs
    await this.writeOutputs(outputs, html);

    return {
      chunks: outputs.length,
      size: outputs.reduce((sum, o) => sum + o.code.length, 0)
    };
  }

  /**
   * Create bundle chunks
   */
  createChunks(ast, analysis) {
    return {
      main: new Set([ast.file, ...ast.components.map(c => c.name)]),
      vendor: new Set(), // External dependencies
      async: analysis.asyncComponents ? new Map() : new Map()
    };
  }

  /**
   * Generate a bundle
   */
  generateBundle(files, name) {
    const code = this.generateBundleCode(files, name);
    const hash = this.generateHash(code);

    return {
      name,
      filename: `${name}.${hash.slice(0, 8)}.js`,
      code,
      hash,
      size: code.length
    };
  }

  /**
   * Generate bundle code
   */
  generateBundleCode(files, name) {
    const modules = [];

    // Bundle header
    modules.push(`
// verenajs Bundle: ${name}
// Generated: ${new Date().toISOString()}
(function(modules) {
  var cache = {};

  function require(id) {
    if (cache[id]) return cache[id].exports;
    var module = cache[id] = { exports: {} };
    modules[id](module, module.exports, require);
    return module.exports;
  }

  require.m = modules;
  require.c = cache;

  // Load entry point
  return require(0);
})({
`);

    // Add modules
    let moduleId = 0;
    for (const file of files) {
      modules.push(`  ${moduleId++}: function(module, exports, require) {`);
      modules.push(`    // Module: ${file}`);
      modules.push(`    // Content would be transpiled here`);
      modules.push(`  },`);
    }

    modules.push('});');

    return modules.join('\n');
  }

  /**
   * Generate runtime code
   */
  generateRuntime(bundles) {
    const code = `
// verenajs Runtime
(function() {
  'use strict';

  var __verena = window.__verena = window.__verena || {};

  // Module loader
  __verena.load = function(url) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Async module loader
  __verena.loadAsync = function(name) {
    var url = __verena.asyncModules[name];
    if (!url) return Promise.reject(new Error('Module not found: ' + name));
    return __verena.load(url);
  };

  // Register async modules
  __verena.asyncModules = {
    ${bundles.filter(b => b.async).map(b => `'${b.name}': '${b.filename}'`).join(',\n    ')}
  };

  // Hot Module Replacement (dev only)
  if (process.env.NODE_ENV === 'development') {
    __verena.hot = {
      accept: function() {},
      dispose: function() {}
    };

    // Connect to HMR server
    var es = new EventSource('/__verena_hmr');
    es.onmessage = function(e) {
      if (e.data === 'reload') {
        location.reload();
      }
    };
  }
})();
`;

    return {
      name: 'runtime',
      filename: 'runtime.js',
      code,
      size: code.length
    };
  }

  /**
   * Generate HTML entry file
   */
  generateHTML(bundles) {
    const scripts = bundles
      .filter(b => !b.async)
      .map(b => `<script src="${b.filename}"></script>`)
      .join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>verenajs App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  ${scripts}
</body>
</html>`;
  }

  /**
   * Generate service worker for PWA
   */
  generateServiceWorker(bundles) {
    const cacheFiles = bundles.map(b => `'${b.filename}'`).join(',\n    ');

    const code = `
// verenajs Service Worker
const CACHE_NAME = 'verenajs-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  ${cacheFiles}
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_FILES))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
`;

    return {
      name: 'sw',
      filename: 'sw.js',
      code,
      size: code.length
    };
  }

  /**
   * Write outputs to disk
   */
  async writeOutputs(bundles, html) {
    const outDir = this.config.output.dir;

    // Ensure output directory exists
    await fs.promises.mkdir(outDir, { recursive: true });

    // Clean output directory if configured
    if (this.config.output.clean) {
      const files = await fs.promises.readdir(outDir);
      for (const file of files) {
        await fs.promises.unlink(path.join(outDir, file));
      }
    }

    // Write bundles
    for (const bundle of bundles) {
      await fs.promises.writeFile(
        path.join(outDir, bundle.filename),
        bundle.code
      );
    }

    // Write HTML
    await fs.promises.writeFile(
      path.join(outDir, 'index.html'),
      html
    );
  }

  /**
   * Generate hash from content
   */
  generateHash(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export { WebGenerator };
export default WebGenerator;
