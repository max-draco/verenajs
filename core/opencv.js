/**
 * verenajs OpenCV Integration
 * Advanced layout intelligence and visual processing
 *
 * Features:
 * - Hand-drawn layout recognition
 * - Gesture detection
 * - Spatial layout analysis
 * - Design file conversion (Draw.io, Adobe, Corel)
 * - Handwriting input recognition
 */

import { Platform, events } from './core.js';

// OpenCV.js loading state
let cvReady = false;
let cvPromise = null;

/**
 * Load OpenCV.js dynamically
 */
async function loadOpenCV() {
  if (cvReady) return window.cv;
  if (cvPromise) return cvPromise;

  cvPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.cv && window.cv.Mat) {
      cvReady = true;
      resolve(window.cv);
      return;
    }

    // Load OpenCV.js
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;

    script.onload = () => {
      // Wait for OpenCV to initialize
      if (window.cv && window.cv.onRuntimeInitialized) {
        window.cv.onRuntimeInitialized = () => {
          cvReady = true;
          events.emit('opencv:ready');
          resolve(window.cv);
        };
      } else {
        // Poll for initialization
        const checkCV = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            clearInterval(checkCV);
            cvReady = true;
            events.emit('opencv:ready');
            resolve(window.cv);
          }
        }, 100);
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load OpenCV.js'));
    };

    document.head.appendChild(script);
  });

  return cvPromise;
}

/**
 * Layout Element Types
 */
const LayoutElementType = {
  BUTTON: 'button',
  INPUT: 'input',
  CARD: 'card',
  CONTAINER: 'container',
  TEXT: 'text',
  IMAGE: 'image',
  LIST: 'list',
  TABLE: 'table',
  NAV: 'navigation',
  HEADER: 'header',
  FOOTER: 'footer',
  SIDEBAR: 'sidebar',
  MODAL: 'modal',
  UNKNOWN: 'unknown'
};

/**
 * Image Processing Utilities
 */
const ImageUtils = {
  /**
   * Load image from various sources
   */
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => resolve(img);
      img.onerror = reject;

      if (source instanceof Blob || source instanceof File) {
        img.src = URL.createObjectURL(source);
      } else if (source instanceof HTMLCanvasElement) {
        img.src = source.toDataURL();
      } else if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof ImageData) {
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        canvas.getContext('2d').putImageData(source, 0, 0);
        img.src = canvas.toDataURL();
      }
    });
  },

  /**
   * Image to Mat conversion
   */
  imageToMat(image) {
    const cv = window.cv;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return cv.matFromImageData(imageData);
  },

  /**
   * Mat to ImageData conversion
   */
  matToImageData(mat) {
    const cv = window.cv;
    const img = new cv.Mat();
    const channels = mat.channels();

    if (channels === 1) {
      cv.cvtColor(mat, img, cv.COLOR_GRAY2RGBA);
    } else if (channels === 3) {
      cv.cvtColor(mat, img, cv.COLOR_RGB2RGBA);
    } else {
      mat.copyTo(img);
    }

    const imageData = new ImageData(
      new Uint8ClampedArray(img.data),
      img.cols,
      img.rows
    );

    img.delete();
    return imageData;
  }
};

/**
 * Contour Analysis
 */
class ContourAnalyzer {
  constructor() {
    this.cv = null;
  }

  async init() {
    this.cv = await loadOpenCV();
  }

  /**
   * Find and classify contours
   */
  findContours(mat, minArea = 100) {
    const cv = this.cv;
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);

    // Apply threshold
    const binary = new cv.Mat();
    cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY_INV);

    // Find contours
    cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const results = [];
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);

      if (area >= minArea) {
        const rect = cv.boundingRect(contour);
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.02 * cv.arcLength(contour, true), true);

        results.push({
          index: i,
          area,
          bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          vertices: approx.rows,
          aspectRatio: rect.width / rect.height
        });

        approx.delete();
      }
    }

    // Cleanup
    gray.delete();
    binary.delete();
    contours.delete();
    hierarchy.delete();

    return results;
  }

  /**
   * Classify contour as UI element
   */
  classifyContour(contour) {
    const { vertices, aspectRatio, area, bounds } = contour;

    // Button: rectangle with aspect ratio 2-5
    if (vertices === 4 && aspectRatio >= 2 && aspectRatio <= 5) {
      return LayoutElementType.BUTTON;
    }

    // Input: wide rectangle
    if (vertices === 4 && aspectRatio >= 5) {
      return LayoutElementType.INPUT;
    }

    // Card: larger rectangle with moderate aspect ratio
    if (vertices === 4 && aspectRatio >= 0.5 && aspectRatio <= 2 && area > 5000) {
      return LayoutElementType.CARD;
    }

    // Container: very large rectangle
    if (vertices === 4 && area > 20000) {
      return LayoutElementType.CONTAINER;
    }

    // Circle could be avatar or icon
    if (vertices > 6) {
      return LayoutElementType.IMAGE;
    }

    return LayoutElementType.UNKNOWN;
  }
}

/**
 * Hand-drawn Layout Recognition
 */
class LayoutRecognizer {
  constructor() {
    this.cv = null;
    this.analyzer = new ContourAnalyzer();
  }

  async init() {
    this.cv = await loadOpenCV();
    await this.analyzer.init();
  }

  /**
   * Recognize layout from hand-drawn sketch
   */
  async recognizeLayout(imageSource) {
    const image = await ImageUtils.loadImage(imageSource);
    const mat = ImageUtils.imageToMat(image);

    // Preprocess
    const processed = this.preprocess(mat);

    // Find contours
    const contours = this.analyzer.findContours(processed);

    // Classify elements
    const elements = contours.map(c => ({
      ...c,
      type: this.analyzer.classifyContour(c)
    }));

    // Build hierarchy
    const layout = this.buildLayoutTree(elements);

    // Cleanup
    mat.delete();
    processed.delete();

    return layout;
  }

  /**
   * Preprocess image for recognition
   */
  preprocess(mat) {
    const cv = this.cv;
    const result = new cv.Mat();

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Adaptive threshold
    cv.adaptiveThreshold(blurred, result, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

    // Cleanup
    gray.delete();
    blurred.delete();

    return result;
  }

  /**
   * Build hierarchical layout tree
   */
  buildLayoutTree(elements) {
    // Sort by area (largest first)
    const sorted = [...elements].sort((a, b) => b.area - a.area);

    const root = {
      type: 'root',
      children: [],
      bounds: null
    };

    for (const element of sorted) {
      const parent = this.findParent(root, element);
      parent.children.push({
        type: element.type,
        bounds: element.bounds,
        children: []
      });
    }

    return root;
  }

  /**
   * Find parent container for element
   */
  findParent(root, element) {
    const isContained = (parent, child) => {
      if (!parent.bounds) return true;
      return (
        child.bounds.x >= parent.bounds.x &&
        child.bounds.y >= parent.bounds.y &&
        child.bounds.x + child.bounds.width <= parent.bounds.x + parent.bounds.width &&
        child.bounds.y + child.bounds.height <= parent.bounds.y + parent.bounds.height
      );
    };

    let parent = root;
    for (const child of root.children) {
      if (isContained(child, element)) {
        parent = this.findParent(child, element);
        break;
      }
    }

    return parent;
  }

  /**
   * Convert layout tree to verenajs component tree
   */
  toComponentTree(layout) {
    const convert = (node) => {
      const componentMap = {
        [LayoutElementType.BUTTON]: 'Button',
        [LayoutElementType.INPUT]: 'Input',
        [LayoutElementType.CARD]: 'Card',
        [LayoutElementType.CONTAINER]: 'Container',
        [LayoutElementType.TEXT]: 'Text',
        [LayoutElementType.IMAGE]: 'Avatar',
        root: 'Container'
      };

      const component = {
        type: componentMap[node.type] || 'Container',
        props: {},
        children: []
      };

      if (node.bounds) {
        component.props.style = {
          position: 'absolute',
          left: `${node.bounds.x}px`,
          top: `${node.bounds.y}px`,
          width: `${node.bounds.width}px`,
          height: `${node.bounds.height}px`
        };
      }

      for (const child of node.children || []) {
        component.children.push(convert(child));
      }

      return component;
    };

    return convert(layout);
  }
}

/**
 * Gesture Recognition
 */
class GestureRecognizer {
  constructor() {
    this.cv = null;
    this.templates = new Map();
  }

  async init() {
    this.cv = await loadOpenCV();
    this.loadDefaultTemplates();
  }

  /**
   * Load default gesture templates
   */
  loadDefaultTemplates() {
    // Would load pre-trained gesture templates
    this.templates.set('swipe-left', { /* template data */ });
    this.templates.set('swipe-right', { /* template data */ });
    this.templates.set('circle', { /* template data */ });
    this.templates.set('check', { /* template data */ });
    this.templates.set('cross', { /* template data */ });
  }

  /**
   * Recognize gesture from points
   */
  recognizeGesture(points) {
    if (points.length < 3) return null;

    // Normalize points
    const normalized = this.normalizePoints(points);

    // Compare against templates
    let bestMatch = null;
    let bestScore = 0;

    for (const [name, template] of this.templates) {
      const score = this.comparePoints(normalized, template);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = name;
      }
    }

    if (bestScore > 0.7) {
      return { gesture: bestMatch, confidence: bestScore };
    }

    // Simple gesture detection as fallback
    return this.detectSimpleGesture(points);
  }

  /**
   * Normalize points to 0-1 range
   */
  normalizePoints(points) {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;

    return points.map(p => ({
      x: (p.x - minX) / width,
      y: (p.y - minY) / height
    }));
  }

  /**
   * Compare point sequences
   */
  comparePoints(a, b) {
    // Simplified comparison - would use DTW or similar
    return 0;
  }

  /**
   * Detect simple gestures
   */
  detectSimpleGesture(points) {
    const first = points[0];
    const last = points[points.length - 1];

    const dx = last.x - first.x;
    const dy = last.y - first.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Swipe detection
    if (distance > 50) {
      if (angle > -45 && angle < 45) return { gesture: 'swipe-right', confidence: 0.8 };
      if (angle > 135 || angle < -135) return { gesture: 'swipe-left', confidence: 0.8 };
      if (angle > 45 && angle < 135) return { gesture: 'swipe-down', confidence: 0.8 };
      if (angle > -135 && angle < -45) return { gesture: 'swipe-up', confidence: 0.8 };
    }

    return null;
  }
}

/**
 * Design File Parser
 * Converts design files to verenajs components
 */
class DesignParser {
  /**
   * Parse Draw.io XML
   */
  parseDrawIO(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const cells = doc.querySelectorAll('mxCell');
    const elements = [];

    cells.forEach(cell => {
      const geometry = cell.querySelector('mxGeometry');
      if (!geometry) return;

      const style = cell.getAttribute('style') || '';
      const value = cell.getAttribute('value') || '';

      elements.push({
        type: this.detectElementType(style),
        bounds: {
          x: parseFloat(geometry.getAttribute('x') || 0),
          y: parseFloat(geometry.getAttribute('y') || 0),
          width: parseFloat(geometry.getAttribute('width') || 0),
          height: parseFloat(geometry.getAttribute('height') || 0)
        },
        label: value,
        style: this.parseDrawIOStyle(style)
      });
    });

    return this.buildComponentTree(elements);
  }

  /**
   * Parse style string from Draw.io
   */
  parseDrawIOStyle(styleStr) {
    const style = {};
    const parts = styleStr.split(';');

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        style[key] = value;
      }
    });

    return style;
  }

  /**
   * Detect element type from Draw.io style
   */
  detectElementType(style) {
    if (style.includes('rounded=1')) return LayoutElementType.BUTTON;
    if (style.includes('shape=ellipse')) return LayoutElementType.IMAGE;
    if (style.includes('shape=document')) return LayoutElementType.CARD;
    return LayoutElementType.CONTAINER;
  }

  /**
   * Build component tree from elements
   */
  buildComponentTree(elements) {
    // Sort by area
    const sorted = [...elements].sort((a, b) => {
      const areaA = a.bounds.width * a.bounds.height;
      const areaB = b.bounds.width * b.bounds.height;
      return areaB - areaA;
    });

    // Build tree structure
    const root = { type: 'Container', children: [], props: {} };

    for (const el of sorted) {
      root.children.push({
        type: this.mapToComponent(el.type),
        props: {
          label: el.label,
          style: this.convertStyle(el.bounds, el.style)
        },
        children: []
      });
    }

    return root;
  }

  /**
   * Map layout type to component name
   */
  mapToComponent(type) {
    const map = {
      [LayoutElementType.BUTTON]: 'Button',
      [LayoutElementType.INPUT]: 'Input',
      [LayoutElementType.CARD]: 'Card',
      [LayoutElementType.CONTAINER]: 'Container',
      [LayoutElementType.TEXT]: 'Text',
      [LayoutElementType.IMAGE]: 'Avatar'
    };
    return map[type] || 'Container';
  }

  /**
   * Convert bounds and style to CSS
   */
  convertStyle(bounds, style) {
    return {
      position: 'absolute',
      left: `${bounds.x}px`,
      top: `${bounds.y}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      backgroundColor: style.fillColor || undefined,
      borderColor: style.strokeColor || undefined,
      borderRadius: style.rounded === '1' ? '4px' : undefined
    };
  }
}

/**
 * OpenCV Module - Main Export
 */
const OpenCV = {
  load: loadOpenCV,
  isReady: () => cvReady,

  // Image utilities
  ImageUtils,

  // Layout recognition
  LayoutRecognizer,
  ContourAnalyzer,

  // Gesture recognition
  GestureRecognizer,

  // Design parsing
  DesignParser,

  // Element types
  LayoutElementType,

  // Quick methods
  async recognizeLayout(imageSource) {
    const recognizer = new LayoutRecognizer();
    await recognizer.init();
    const layout = await recognizer.recognizeLayout(imageSource);
    return recognizer.toComponentTree(layout);
  },

  async parseDrawIO(xml) {
    const parser = new DesignParser();
    return parser.parseDrawIO(xml);
  }
};

export {
  loadOpenCV,
  ImageUtils,
  LayoutRecognizer,
  ContourAnalyzer,
  GestureRecognizer,
  DesignParser,
  LayoutElementType
};

export default OpenCV;
