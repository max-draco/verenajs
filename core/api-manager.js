/**
 * verenajs API Manager
 * Comprehensive API management, webhooks, and backend connections
 *
 * Features:
 * - REST API builder
 * - GraphQL support
 * - WebSocket connections
 * - Webhook management
 * - Multi-language backend connections
 * - Request/Response interceptors
 * - Caching & Rate limiting
 * - Authentication handling
 *
 * @version 2.0.0
 */

import { events, store, reactive } from './core.js';

// ============================================
// API CONFIGURATION
// ============================================

const ApiConfig = {
  baseUrl: '',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json'
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  }
};

// ============================================
// API CLIENT
// ============================================

class ApiClient {
  constructor(config = {}) {
    this.config = { ...ApiConfig, ...config };
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.requestCount = 0;
  }

  // Add request interceptor
  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
    return () => {
      const idx = this.interceptors.request.indexOf(fn);
      if (idx !== -1) this.interceptors.request.splice(idx, 1);
    };
  }

  // Add response interceptor
  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
    return () => {
      const idx = this.interceptors.response.indexOf(fn);
      if (idx !== -1) this.interceptors.response.splice(idx, 1);
    };
  }

  // Add error interceptor
  addErrorInterceptor(fn) {
    this.interceptors.error.push(fn);
    return () => {
      const idx = this.interceptors.error.indexOf(fn);
      if (idx !== -1) this.interceptors.error.splice(idx, 1);
    };
  }

  // Run request through interceptors
  async runRequestInterceptors(config) {
    let result = config;
    for (const interceptor of this.interceptors.request) {
      result = await interceptor(result);
    }
    return result;
  }

  // Run response through interceptors
  async runResponseInterceptors(response) {
    let result = response;
    for (const interceptor of this.interceptors.response) {
      result = await interceptor(result);
    }
    return result;
  }

  // Run error through interceptors
  async runErrorInterceptors(error) {
    let result = error;
    for (const interceptor of this.interceptors.error) {
      result = await interceptor(result);
    }
    return result;
  }

  // Generate cache key
  getCacheKey(url, options) {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;
  }

  // Check cache
  checkCache(key) {
    if (!this.config.cache.enabled) return null;

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cache.ttl) {
      return cached.data;
    }

    this.cache.delete(key);
    return null;
  }

  // Set cache
  setCache(key, data) {
    if (!this.config.cache.enabled) return;

    // Limit cache size
    if (this.cache.size >= this.config.cache.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Main request method
  async request(url, options = {}) {
    const requestId = ++this.requestCount;
    const startTime = performance.now();

    // Build full URL
    const fullUrl = url.startsWith('http')
      ? url
      : `${this.config.baseUrl}${url}`;

    // Merge config
    const requestConfig = {
      method: 'GET',
      headers: { ...this.config.headers, ...options.headers },
      timeout: options.timeout || this.config.timeout,
      ...options,
      url: fullUrl
    };

    // Run request interceptors
    const finalConfig = await this.runRequestInterceptors(requestConfig);

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(fullUrl, finalConfig);
    if (finalConfig.method === 'GET' && !finalConfig.noCache) {
      const cached = this.checkCache(cacheKey);
      if (cached) {
        events.emit('api:cache-hit', { url: fullUrl, requestId });
        return cached;
      }
    }

    // Deduplicate identical pending requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create request promise
    const requestPromise = this.executeRequest(finalConfig, requestId, cacheKey, startTime);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async executeRequest(config, requestId, cacheKey, startTime, retryCount = 0) {
    events.emit('api:request-start', { url: config.url, requestId, config });

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Build fetch options
      const fetchOptions = {
        method: config.method,
        headers: config.headers,
        signal: controller.signal
      };

      if (config.body) {
        fetchOptions.body = typeof config.body === 'string'
          ? config.body
          : JSON.stringify(config.body);
      }

      // Execute fetch
      const response = await fetch(config.url, fetchOptions);
      clearTimeout(timeoutId);

      // Parse response
      let data;
      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Build response object
      const result = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config,
        requestId
      };

      // Check for error status
      if (!response.ok) {
        const error = new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          result
        );
        throw error;
      }

      // Run response interceptors
      const finalResult = await this.runResponseInterceptors(result);

      // Cache successful GET requests
      if (config.method === 'GET') {
        this.setCache(cacheKey, finalResult);
      }

      // Emit success event
      const duration = performance.now() - startTime;
      events.emit('api:request-success', { url: config.url, requestId, duration, result: finalResult });

      return finalResult;

    } catch (error) {
      // Handle abort
      if (error.name === 'AbortError') {
        error = new ApiError('Request timeout', 408, { config });
      }

      // Retry logic
      if (retryCount < this.config.retries && this.shouldRetry(error)) {
        await this.delay(this.config.retryDelay * (retryCount + 1));
        return this.executeRequest(config, requestId, cacheKey, startTime, retryCount + 1);
      }

      // Run error interceptors
      const finalError = await this.runErrorInterceptors(error);

      // Emit error event
      const duration = performance.now() - startTime;
      events.emit('api:request-error', { url: config.url, requestId, duration, error: finalError });

      throw finalError;
    }
  }

  shouldRetry(error) {
    // Retry on network errors and 5xx status codes
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, { ...options, method: 'POST', body: data });
  }

  async put(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  }

  async patch(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body: data });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// API Error class
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// ============================================
// WEBHOOK MANAGER
// ============================================

class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.subscriptions = new Map();
    this.eventQueue = [];
    this.processing = false;
  }

  // Register a webhook
  register(id, config) {
    const webhook = {
      id,
      url: config.url,
      secret: config.secret,
      events: config.events || ['*'],
      method: config.method || 'POST',
      headers: config.headers || {},
      retries: config.retries || 3,
      timeout: config.timeout || 30000,
      active: config.active !== false,
      createdAt: Date.now()
    };

    this.webhooks.set(id, webhook);
    events.emit('webhook:registered', webhook);

    return webhook;
  }

  // Unregister a webhook
  unregister(id) {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      this.webhooks.delete(id);
      events.emit('webhook:unregistered', webhook);
    }
  }

  // Subscribe to events
  subscribe(webhookId, eventTypes) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);

    webhook.events = eventTypes;
    events.emit('webhook:updated', webhook);
  }

  // Trigger webhook
  async trigger(eventType, payload) {
    const webhooksToTrigger = Array.from(this.webhooks.values())
      .filter(w => w.active && (w.events.includes('*') || w.events.includes(eventType)));

    const results = await Promise.allSettled(
      webhooksToTrigger.map(webhook => this.send(webhook, eventType, payload))
    );

    return results.map((result, index) => ({
      webhookId: webhooksToTrigger[index].id,
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null,
      response: result.status === 'fulfilled' ? result.value : null
    }));
  }

  // Send webhook
  async send(webhook, eventType, payload, retryCount = 0) {
    const signature = await this.generateSignature(payload, webhook.secret);

    const requestPayload = {
      event: eventType,
      timestamp: Date.now(),
      payload,
      webhookId: webhook.id
    };

    events.emit('webhook:sending', { webhookId: webhook.id, eventType });

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
          ...webhook.headers
        },
        body: JSON.stringify(requestPayload),
        signal: AbortSignal.timeout(webhook.timeout)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      const result = {
        status: response.status,
        webhookId: webhook.id,
        eventType,
        timestamp: Date.now()
      };

      events.emit('webhook:success', result);
      return result;

    } catch (error) {
      // Retry logic
      if (retryCount < webhook.retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.send(webhook, eventType, payload, retryCount + 1);
      }

      events.emit('webhook:error', { webhookId: webhook.id, error: error.message });
      throw error;
    }
  }

  // Generate HMAC signature
  async generateSignature(payload, secret) {
    if (!secret) return '';

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Verify webhook signature
  async verifySignature(payload, signature, secret) {
    const expected = await this.generateSignature(payload, secret);
    return signature === expected;
  }

  // List all webhooks
  list() {
    return Array.from(this.webhooks.values());
  }

  // Get webhook by ID
  get(id) {
    return this.webhooks.get(id);
  }
}

// ============================================
// WEBSOCKET MANAGER
// ============================================

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Connect to WebSocket
  connect(id, url, options = {}) {
    if (this.connections.has(id)) {
      const existing = this.connections.get(id);
      if (existing.readyState === WebSocket.OPEN) {
        return existing;
      }
    }

    const ws = new WebSocket(url);

    const connection = {
      id,
      url,
      socket: ws,
      options,
      listeners: new Map(),
      messageQueue: [],
      status: 'connecting'
    };

    ws.onopen = () => {
      connection.status = 'connected';
      this.reconnectAttempts.set(id, 0);

      // Send queued messages
      while (connection.messageQueue.length > 0) {
        const msg = connection.messageQueue.shift();
        ws.send(JSON.stringify(msg));
      }

      events.emit('ws:connected', { id, url });
      if (options.onOpen) options.onOpen();
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      events.emit('ws:message', { id, data });

      // Call type-specific handlers
      if (data.type && connection.listeners.has(data.type)) {
        connection.listeners.get(data.type).forEach(handler => handler(data.payload));
      }

      if (options.onMessage) options.onMessage(data);
    };

    ws.onerror = (error) => {
      connection.status = 'error';
      events.emit('ws:error', { id, error });
      if (options.onError) options.onError(error);
    };

    ws.onclose = () => {
      connection.status = 'closed';
      events.emit('ws:closed', { id, url });

      // Auto reconnect
      if (options.autoReconnect !== false) {
        const attempts = this.reconnectAttempts.get(id) || 0;
        if (attempts < this.maxReconnectAttempts) {
          this.reconnectAttempts.set(id, attempts + 1);
          setTimeout(() => this.connect(id, url, options), this.reconnectDelay * (attempts + 1));
        }
      }

      if (options.onClose) options.onClose();
    };

    this.connections.set(id, connection);
    return connection;
  }

  // Send message
  send(id, message) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`WebSocket connection ${id} not found`);
    }

    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(message));
    } else {
      // Queue message for when connection opens
      connection.messageQueue.push(message);
    }
  }

  // Subscribe to message type
  on(id, type, handler) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`WebSocket connection ${id} not found`);
    }

    if (!connection.listeners.has(type)) {
      connection.listeners.set(type, new Set());
    }
    connection.listeners.get(type).add(handler);

    return () => {
      connection.listeners.get(type)?.delete(handler);
    };
  }

  // Close connection
  close(id) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.socket.close();
      this.connections.delete(id);
    }
  }

  // Close all connections
  closeAll() {
    for (const [id] of this.connections) {
      this.close(id);
    }
  }

  // Get connection status
  getStatus(id) {
    const connection = this.connections.get(id);
    return connection ? connection.status : 'not-connected';
  }
}

// ============================================
// BACKEND CONNECTORS
// ============================================

class BackendConnector {
  constructor() {
    this.adapters = new Map();
    this.connections = new Map();
  }

  // Register adapter for backend type
  registerAdapter(type, adapter) {
    this.adapters.set(type, adapter);
  }

  // Create connection to backend
  async connect(id, config) {
    const adapter = this.adapters.get(config.type);
    if (!adapter) {
      throw new Error(`No adapter found for backend type: ${config.type}`);
    }

    const connection = await adapter.connect(config);
    this.connections.set(id, {
      id,
      type: config.type,
      config,
      connection,
      status: 'connected'
    });

    events.emit('backend:connected', { id, type: config.type });
    return connection;
  }

  // Execute query
  async query(id, query, params = {}) {
    const conn = this.connections.get(id);
    if (!conn) {
      throw new Error(`Backend connection ${id} not found`);
    }

    const adapter = this.adapters.get(conn.type);
    return adapter.query(conn.connection, query, params);
  }

  // Disconnect
  async disconnect(id) {
    const conn = this.connections.get(id);
    if (conn) {
      const adapter = this.adapters.get(conn.type);
      await adapter.disconnect(conn.connection);
      this.connections.delete(id);
      events.emit('backend:disconnected', { id });
    }
  }
}

// Node.js Backend Adapter
const NodeJsAdapter = {
  async connect(config) {
    // For browser-to-Node.js communication via API
    return {
      baseUrl: config.url,
      headers: config.headers || {}
    };
  },

  async query(connection, endpoint, params) {
    const response = await fetch(`${connection.baseUrl}${endpoint}`, {
      method: params.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    });
    return response.json();
  },

  async disconnect() {
    // No persistent connection to close
  }
};

// Python Backend Adapter
const PythonAdapter = {
  async connect(config) {
    return {
      baseUrl: config.url,
      headers: config.headers || {}
    };
  },

  async query(connection, endpoint, params) {
    const response = await fetch(`${connection.baseUrl}${endpoint}`, {
      method: params.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    });
    return response.json();
  },

  async disconnect() {}
};

// Go Backend Adapter
const GoAdapter = {
  async connect(config) {
    return {
      baseUrl: config.url,
      headers: config.headers || {}
    };
  },

  async query(connection, endpoint, params) {
    const response = await fetch(`${connection.baseUrl}${endpoint}`, {
      method: params.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    });
    return response.json();
  },

  async disconnect() {}
};

// PHP Backend Adapter
const PhpAdapter = {
  async connect(config) {
    return {
      baseUrl: config.url,
      headers: config.headers || {}
    };
  },

  async query(connection, endpoint, params) {
    const response = await fetch(`${connection.baseUrl}${endpoint}`, {
      method: params.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers
      },
      body: params.body ? JSON.stringify(params.body) : undefined
    });
    return response.json();
  },

  async disconnect() {}
};

// ============================================
// GRAPHQL CLIENT
// ============================================

class GraphQLClient {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.options = options;
    this.cache = new Map();
  }

  async query(query, variables = {}, options = {}) {
    return this.request({ query, variables }, options);
  }

  async mutate(mutation, variables = {}, options = {}) {
    return this.request({ query: mutation, variables }, { ...options, noCache: true });
  }

  async request(body, options = {}) {
    const cacheKey = JSON.stringify(body);

    // Check cache
    if (!options.noCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
        ...options.headers
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (result.errors) {
      throw new GraphQLError(result.errors);
    }

    // Cache the result
    if (!options.noCache) {
      this.cache.set(cacheKey, result.data);
    }

    return result.data;
  }

  // Subscription support (requires WebSocket)
  subscribe(query, variables, callback) {
    // Implementation would depend on the GraphQL server's subscription protocol
    // (e.g., graphql-ws, subscriptions-transport-ws)
    events.emit('graphql:subscription-requested', { query, variables });
  }
}

class GraphQLError extends Error {
  constructor(errors) {
    super(errors.map(e => e.message).join(', '));
    this.name = 'GraphQLError';
    this.errors = errors;
  }
}

// ============================================
// DATA SOURCE MANAGER
// ============================================

class DataSourceManager {
  constructor() {
    this.sources = new Map();
    this.refreshIntervals = new Map();
  }

  // Register a data source
  register(id, config) {
    const source = {
      id,
      type: config.type, // 'rest', 'graphql', 'websocket', 'static'
      url: config.url,
      method: config.method || 'GET',
      headers: config.headers || {},
      params: config.params || {},
      transform: config.transform,
      cache: config.cache || false,
      refreshInterval: config.refreshInterval || 0,
      data: null,
      loading: false,
      error: null,
      lastFetched: null
    };

    this.sources.set(id, source);

    // Set up auto-refresh
    if (source.refreshInterval > 0) {
      this.startRefresh(id);
    }

    return source;
  }

  // Fetch data from source
  async fetch(id, overrideParams = {}) {
    const source = this.sources.get(id);
    if (!source) throw new Error(`Data source ${id} not found`);

    source.loading = true;
    source.error = null;
    events.emit('datasource:loading', { id });

    try {
      let data;

      switch (source.type) {
        case 'rest':
          const response = await fetch(source.url, {
            method: source.method,
            headers: source.headers,
            body: source.method !== 'GET' ? JSON.stringify({ ...source.params, ...overrideParams }) : undefined
          });
          data = await response.json();
          break;

        case 'graphql':
          const gqlClient = new GraphQLClient(source.url, { headers: source.headers });
          data = await gqlClient.query(source.params.query, { ...source.params.variables, ...overrideParams });
          break;

        case 'static':
          data = source.params.data;
          break;

        default:
          throw new Error(`Unknown data source type: ${source.type}`);
      }

      // Apply transform if provided
      if (source.transform) {
        data = source.transform(data);
      }

      source.data = data;
      source.lastFetched = Date.now();
      source.loading = false;

      events.emit('datasource:loaded', { id, data });
      return data;

    } catch (error) {
      source.loading = false;
      source.error = error.message;
      events.emit('datasource:error', { id, error: error.message });
      throw error;
    }
  }

  // Get cached data
  getData(id) {
    const source = this.sources.get(id);
    return source ? source.data : null;
  }

  // Start auto-refresh
  startRefresh(id) {
    this.stopRefresh(id);
    const source = this.sources.get(id);
    if (source && source.refreshInterval > 0) {
      const intervalId = setInterval(() => this.fetch(id), source.refreshInterval);
      this.refreshIntervals.set(id, intervalId);
    }
  }

  // Stop auto-refresh
  stopRefresh(id) {
    const intervalId = this.refreshIntervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.refreshIntervals.delete(id);
    }
  }

  // List all sources
  list() {
    return Array.from(this.sources.values());
  }

  // Remove source
  remove(id) {
    this.stopRefresh(id);
    this.sources.delete(id);
  }
}

// ============================================
// API ENDPOINT BUILDER
// ============================================

class ApiEndpointBuilder {
  constructor() {
    this.endpoints = new Map();
  }

  // Define an endpoint
  define(name, config) {
    const endpoint = {
      name,
      url: config.url,
      method: config.method || 'GET',
      headers: config.headers || {},
      params: config.params || {},
      queryParams: config.queryParams || {},
      bodySchema: config.bodySchema || null,
      responseSchema: config.responseSchema || null,
      auth: config.auth || false,
      rateLimit: config.rateLimit || null,
      cache: config.cache || false,
      mock: config.mock || null
    };

    this.endpoints.set(name, endpoint);
    return endpoint;
  }

  // Build URL with path params
  buildUrl(name, pathParams = {}) {
    const endpoint = this.endpoints.get(name);
    if (!endpoint) throw new Error(`Endpoint ${name} not found`);

    let url = endpoint.url;
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }
    return url;
  }

  // Execute endpoint
  async execute(name, options = {}) {
    const endpoint = this.endpoints.get(name);
    if (!endpoint) throw new Error(`Endpoint ${name} not found`);

    // Use mock data if available and mocking is enabled
    if (endpoint.mock && options.useMock) {
      return typeof endpoint.mock === 'function' ? endpoint.mock(options) : endpoint.mock;
    }

    const url = this.buildUrl(name, options.pathParams);

    // Build query string
    const queryParams = { ...endpoint.queryParams, ...options.queryParams };
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // Build request
    const requestOptions = {
      method: endpoint.method,
      headers: { ...endpoint.headers, ...options.headers }
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(fullUrl, requestOptions);
    return response.json();
  }

  // Generate OpenAPI spec
  toOpenAPI() {
    const paths = {};

    for (const [name, endpoint] of this.endpoints) {
      const path = endpoint.url.replace(/:(\w+)/g, '{$1}');
      if (!paths[path]) paths[path] = {};

      paths[path][endpoint.method.toLowerCase()] = {
        operationId: name,
        parameters: [],
        responses: {
          '200': {
            description: 'Success'
          }
        }
      };
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0'
      },
      paths
    };
  }

  // List all endpoints
  list() {
    return Array.from(this.endpoints.values());
  }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

const apiClient = new ApiClient();
const webhookManager = new WebhookManager();
const wsManager = new WebSocketManager();
const backendConnector = new BackendConnector();
const dataSourceManager = new DataSourceManager();
const endpointBuilder = new ApiEndpointBuilder();

// Register default backend adapters
backendConnector.registerAdapter('nodejs', NodeJsAdapter);
backendConnector.registerAdapter('python', PythonAdapter);
backendConnector.registerAdapter('go', GoAdapter);
backendConnector.registerAdapter('php', PhpAdapter);

// ============================================
// EXPORTS
// ============================================

export {
  ApiClient,
  ApiError,
  WebhookManager,
  WebSocketManager,
  BackendConnector,
  GraphQLClient,
  GraphQLError,
  DataSourceManager,
  ApiEndpointBuilder,
  apiClient,
  webhookManager,
  wsManager,
  backendConnector,
  dataSourceManager,
  endpointBuilder
};

export default {
  ApiClient,
  apiClient,
  webhookManager,
  wsManager,
  backendConnector,
  dataSourceManager,
  endpointBuilder,
  GraphQLClient
};
