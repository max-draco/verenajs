/**
 * verenajs Compiler
 * Multi-target compiler for web, mobile, and desktop platforms
 *
 * Features:
 * - Component parsing and AST generation
 * - Dead code elimination
 * - Platform-specific optimizations
 * - Bundle generation for each target
 */

import { Parser } from './parser.js';
import { Analyzer } from './analyzer.js';
import { WebGenerator } from './generators/web.js';
import { MobileGenerator } from './generators/mobile.js';
import { DesktopGenerator } from './generators/desktop.js';
import { Optimizer } from './optimizer.js';

/**
 * Compiler Configuration
 */
const defaultConfig = {
  target: 'web', // 'web' | 'mobile' | 'desktop' | 'all'
  mode: 'production', // 'development' | 'production'
  entry: './src/index.js',
  output: {
    dir: './dist',
    filename: '[name].[hash].js',
    clean: true
  },
  optimization: {
    minify: true,
    treeshake: true,
    splitChunks: true,
    inlineStyles: false
  },
  mobile: {
    platform: 'both', // 'ios' | 'android' | 'both'
    capacitor: true
  },
  desktop: {
    platform: 'all', // 'windows' | 'macos' | 'linux' | 'all'
    electron: true,
    qt: false
  },
  sourceMaps: true,
  debug: false
};

/**
 * Main Compiler Class
 */
class Compiler {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.parser = new Parser();
    this.analyzer = new Analyzer();
    this.optimizer = new Optimizer(this.config.optimization);

    // Initialize generators
    this.generators = {
      web: new WebGenerator(this.config),
      mobile: new MobileGenerator(this.config),
      desktop: new DesktopGenerator(this.config)
    };
  }

  /**
   * Compile the project
   */
  async compile() {
    const startTime = Date.now();

    try {
      // 1. Parse source files
      console.log('[verenajs] Parsing source files...');
      const ast = await this.parser.parse(this.config.entry);

      // 2. Analyze dependencies
      console.log('[verenajs] Analyzing dependencies...');
      const analysis = this.analyzer.analyze(ast);

      // 3. Optimize
      if (this.config.mode === 'production') {
        console.log('[verenajs] Optimizing...');
        this.optimizer.optimize(ast, analysis);
      }

      // 4. Generate output for each target
      const outputs = {};

      if (this.config.target === 'all' || this.config.target === 'web') {
        console.log('[verenajs] Generating web bundle...');
        outputs.web = await this.generators.web.generate(ast, analysis);
      }

      if (this.config.target === 'all' || this.config.target === 'mobile') {
        console.log('[verenajs] Generating mobile bundle...');
        outputs.mobile = await this.generators.mobile.generate(ast, analysis);
      }

      if (this.config.target === 'all' || this.config.target === 'desktop') {
        console.log('[verenajs] Generating desktop bundle...');
        outputs.desktop = await this.generators.desktop.generate(ast, analysis);
      }

      const duration = Date.now() - startTime;
      console.log(`[verenajs] Compilation completed in ${duration}ms`);

      return {
        success: true,
        duration,
        outputs,
        stats: {
          components: analysis.components.length,
          dependencies: analysis.dependencies.size,
          bundleSize: Object.values(outputs).reduce((sum, o) => sum + (o.size || 0), 0)
        }
      };
    } catch (error) {
      console.error('[verenajs] Compilation failed:', error);
      return {
        success: false,
        error: error.message,
        stack: this.config.debug ? error.stack : undefined
      };
    }
  }

  /**
   * Watch mode for development
   */
  async watch(callback) {
    const chokidar = await import('chokidar');

    const watcher = chokidar.watch(this.config.entry, {
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (path) => {
      console.log(`[verenajs] File changed: ${path}`);
      const result = await this.compile();
      if (callback) callback(result);
    });

    // Initial compile
    const result = await this.compile();
    if (callback) callback(result);

    return watcher;
  }

  /**
   * Dev server with hot reload
   */
  async serve(options = {}) {
    const { port = 3000, host = 'localhost' } = options;

    // Compile first
    await this.compile();

    // Start dev server
    const express = (await import('express')).default;
    const app = express();

    app.use(express.static(this.config.output.dir));

    // Hot reload endpoint
    const clients = new Set();
    app.get('/__verena_hmr', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      clients.add(res);
      req.on('close', () => clients.delete(res));
    });

    // Watch for changes
    await this.watch((result) => {
      if (result.success) {
        clients.forEach(client => {
          client.write('data: reload\n\n');
        });
      }
    });

    app.listen(port, host, () => {
      console.log(`[verenajs] Dev server running at http://${host}:${port}`);
    });
  }
}

/**
 * Build function for CLI usage
 */
async function build(config) {
  const compiler = new Compiler(config);
  return compiler.compile();
}

/**
 * Watch function for CLI usage
 */
async function watch(config, callback) {
  const compiler = new Compiler(config);
  return compiler.watch(callback);
}

/**
 * Dev server function for CLI usage
 */
async function serve(config, options) {
  const compiler = new Compiler({ ...config, mode: 'development' });
  return compiler.serve(options);
}

export {
  Compiler,
  build,
  watch,
  serve,
  defaultConfig
};

export default Compiler;
