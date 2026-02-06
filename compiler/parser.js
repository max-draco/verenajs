/**
 * verenajs Parser
 * Parses JavaScript source files into AST
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * AST Node Types
 */
const NodeType = {
  PROGRAM: 'Program',
  COMPONENT: 'Component',
  IMPORT: 'Import',
  EXPORT: 'Export',
  FUNCTION: 'Function',
  CALL: 'Call',
  PROPERTY: 'Property',
  LITERAL: 'Literal',
  IDENTIFIER: 'Identifier',
  OBJECT: 'Object',
  ARRAY: 'Array',
  TEMPLATE: 'Template',
  STYLE: 'Style'
};

/**
 * Token patterns for lexing
 */
const PATTERNS = {
  WHITESPACE: /^\s+/,
  COMMENT_LINE: /^\/\/[^\n]*/,
  COMMENT_BLOCK: /^\/\*[\s\S]*?\*\//,
  STRING: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/,
  NUMBER: /^-?\d+\.?\d*/,
  IDENTIFIER: /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
  OPERATOR: /^[+\-*/%=<>!&|^~?:]+/,
  PUNCTUATION: /^[{}()\[\];,.]/,
  IMPORT: /^import\s/,
  EXPORT: /^export\s/,
  FROM: /^from\s/,
  FUNCTION: /^function\s/,
  CONST: /^const\s/,
  LET: /^let\s/,
  VAR: /^var\s/,
  ARROW: /^=>/,
  CREATE_COMPONENT: /^create[A-Z][a-zA-Z]*/
};

/**
 * Lexer - Tokenize source code
 */
class Lexer {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.position < this.source.length) {
      const remaining = this.source.slice(this.position);

      // Skip whitespace
      const wsMatch = remaining.match(PATTERNS.WHITESPACE);
      if (wsMatch) {
        this.position += wsMatch[0].length;
        continue;
      }

      // Skip comments
      const lineComment = remaining.match(PATTERNS.COMMENT_LINE);
      if (lineComment) {
        this.position += lineComment[0].length;
        continue;
      }

      const blockComment = remaining.match(PATTERNS.COMMENT_BLOCK);
      if (blockComment) {
        this.position += blockComment[0].length;
        continue;
      }

      // Match tokens
      let matched = false;

      for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (['WHITESPACE', 'COMMENT_LINE', 'COMMENT_BLOCK'].includes(type)) continue;

        const match = remaining.match(pattern);
        if (match) {
          this.tokens.push({
            type,
            value: match[0],
            position: this.position
          });
          this.position += match[0].length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Unknown character, skip it
        this.position++;
      }
    }

    return this.tokens;
  }
}

/**
 * Parser - Build AST from tokens
 */
class Parser {
  constructor() {
    this.tokens = [];
    this.current = 0;
  }

  /**
   * Parse a file and its dependencies
   */
  async parse(entryPath) {
    const absolutePath = path.resolve(entryPath);
    const source = await fs.promises.readFile(absolutePath, 'utf-8');

    return this.parseSource(source, absolutePath);
  }

  /**
   * Parse source code
   */
  parseSource(source, filePath = 'anonymous') {
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize();
    this.current = 0;

    const program = {
      type: NodeType.PROGRAM,
      file: filePath,
      imports: [],
      exports: [],
      components: [],
      body: []
    };

    while (!this.isAtEnd()) {
      try {
        const node = this.parseStatement();
        if (node) {
          if (node.type === NodeType.IMPORT) {
            program.imports.push(node);
          } else if (node.type === NodeType.EXPORT) {
            program.exports.push(node);
          } else if (node.type === NodeType.COMPONENT) {
            program.components.push(node);
          } else {
            program.body.push(node);
          }
        }
      } catch (e) {
        // Skip problematic tokens
        this.advance();
      }
    }

    return program;
  }

  /**
   * Parse a single statement
   */
  parseStatement() {
    const token = this.peek();

    if (!token) return null;

    // Import statement
    if (token.type === 'IMPORT' || (token.type === 'IDENTIFIER' && token.value === 'import')) {
      return this.parseImport();
    }

    // Export statement
    if (token.type === 'EXPORT' || (token.type === 'IDENTIFIER' && token.value === 'export')) {
      return this.parseExport();
    }

    // Function/component declaration
    if (token.type === 'FUNCTION' || token.type === 'CONST' || token.type === 'LET' ||
        (token.type === 'IDENTIFIER' && ['function', 'const', 'let', 'var'].includes(token.value))) {
      return this.parseDeclaration();
    }

    // Skip to next statement
    this.advance();
    return null;
  }

  /**
   * Parse import statement
   */
  parseImport() {
    this.advance(); // skip 'import'

    const node = {
      type: NodeType.IMPORT,
      specifiers: [],
      source: null
    };

    // Parse specifiers
    while (!this.isAtEnd()) {
      const token = this.peek();

      if (!token) break;

      if (token.type === 'FROM' || (token.type === 'IDENTIFIER' && token.value === 'from')) {
        this.advance();
        const sourceToken = this.advance();
        if (sourceToken && sourceToken.type === 'STRING') {
          node.source = sourceToken.value.slice(1, -1); // Remove quotes
        }
        break;
      }

      if (token.type === 'STRING') {
        node.source = token.value.slice(1, -1);
        this.advance();
        break;
      }

      if (token.type === 'IDENTIFIER') {
        node.specifiers.push({
          type: 'specifier',
          name: token.value
        });
      }

      this.advance();
    }

    return node;
  }

  /**
   * Parse export statement
   */
  parseExport() {
    this.advance(); // skip 'export'

    const node = {
      type: NodeType.EXPORT,
      default: false,
      declaration: null,
      specifiers: []
    };

    const next = this.peek();

    if (next && next.type === 'IDENTIFIER' && next.value === 'default') {
      node.default = true;
      this.advance();
    }

    // Parse the declaration or specifiers
    const declStart = this.peek();
    if (declStart && ['function', 'const', 'let', 'var', 'class'].includes(declStart.value)) {
      node.declaration = this.parseDeclaration();
    }

    return node;
  }

  /**
   * Parse variable/function declaration
   */
  parseDeclaration() {
    const keyword = this.advance();

    const nameToken = this.peek();
    if (!nameToken || nameToken.type !== 'IDENTIFIER') {
      return null;
    }

    const name = nameToken.value;
    this.advance();

    // Check if this is a component factory
    const isComponent = name.startsWith('create') && name.length > 6;

    const node = {
      type: isComponent ? NodeType.COMPONENT : NodeType.FUNCTION,
      name,
      params: [],
      body: null
    };

    // Parse function parameters if present
    if (this.peek()?.value === '(') {
      this.advance(); // skip '('
      while (!this.isAtEnd() && this.peek()?.value !== ')') {
        const param = this.peek();
        if (param?.type === 'IDENTIFIER') {
          node.params.push(param.value);
        }
        this.advance();
      }
      this.advance(); // skip ')'
    }

    // Skip to function body
    while (!this.isAtEnd() && this.peek()?.value !== '{') {
      this.advance();
    }

    // Parse body (simplified - just track brace depth)
    if (this.peek()?.value === '{') {
      const bodyStart = this.current;
      let depth = 0;

      do {
        const token = this.advance();
        if (token?.value === '{') depth++;
        if (token?.value === '}') depth--;
      } while (!this.isAtEnd() && depth > 0);

      node.body = {
        start: bodyStart,
        end: this.current
      };
    }

    return node;
  }

  /**
   * Utility methods
   */
  peek() {
    return this.tokens[this.current];
  }

  advance() {
    if (!this.isAtEnd()) {
      return this.tokens[this.current++];
    }
    return null;
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }
}

/**
 * Extract component metadata from source
 */
function extractComponentMeta(source) {
  const components = [];
  const componentRegex = /export\s+function\s+(create[A-Z][a-zA-Z]*)\s*\(\s*\{?\s*([^}]*)\}?\s*\)/g;

  let match;
  while ((match = componentRegex.exec(source)) !== null) {
    const [, name, paramsStr] = match;
    const params = paramsStr.split(',').map(p => p.trim().split('=')[0].trim()).filter(Boolean);

    components.push({
      name,
      params,
      type: name.replace('create', '').toLowerCase()
    });
  }

  return components;
}

/**
 * Extract imports from source
 */
function extractImports(source) {
  const imports = [];
  const importRegex = /import\s+(?:\{([^}]*)\}|([a-zA-Z_$][a-zA-Z0-9_$]*))\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(source)) !== null) {
    const [, namedImports, defaultImport, from] = match;

    imports.push({
      named: namedImports ? namedImports.split(',').map(s => s.trim()) : [],
      default: defaultImport || null,
      from
    });
  }

  return imports;
}

export {
  Parser,
  Lexer,
  NodeType,
  extractComponentMeta,
  extractImports
};

export default Parser;
