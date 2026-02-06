/**
 * verenajs ZeroMQ Communication Layer
 * First-class message queue backbone for cross-process/cross-platform communication
 *
 * Supports:
 * - pub/sub (publish/subscribe)
 * - req/rep (request/reply)
 * - push/pull (pipeline)
 *
 * Works across:
 * - Web (via WebSocket bridge)
 * - Desktop (Qt/Electron with native ZMQ)
 * - Mobile (via bridge adapters)
 */

import { Platform, events } from './core.js';

// Message serialization
const serialize = (data) => JSON.stringify(data);
const deserialize = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * WebSocket Bridge for web environments
 * Bridges ZMQ-like semantics over WebSocket
 */
class WebSocketBridge {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          events.emit('zmq:connected', { url: this.url });
          resolve();
        };

        this.ws.onclose = () => {
          this.connected = false;
          events.emit('zmq:disconnected', { url: this.url });
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          events.emit('zmq:error', { error });
          reject(error);
        };

        this.ws.onmessage = (event) => {
          const message = deserialize(event.data);
          this.handleMessage(message);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      events.emit('zmq:reconnect_failed', { url: this.url });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      events.emit('zmq:reconnecting', { attempt: this.reconnectAttempts });
      this.connect().catch(() => {});
    }, delay);
  }

  handleMessage(message) {
    const { type, topic, requestId, data } = message;

    // Handle request/reply responses
    if (requestId && this.pendingRequests.has(requestId)) {
      const { resolve } = this.pendingRequests.get(requestId);
      this.pendingRequests.delete(requestId);
      resolve(data);
      return;
    }

    // Handle pub/sub messages
    if (topic && this.messageHandlers.has(topic)) {
      this.messageHandlers.get(topic).forEach(handler => handler(data));
    }

    // Handle broadcast messages
    if (type === 'broadcast') {
      events.emit('zmq:message', message);
    }
  }

  send(message) {
    if (!this.connected) {
      throw new Error('WebSocket not connected');
    }
    this.ws.send(serialize(message));
  }

  subscribe(topic, handler) {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, new Set());
      this.send({ type: 'subscribe', topic });
    }
    this.messageHandlers.get(topic).add(handler);

    return () => {
      this.messageHandlers.get(topic).delete(handler);
      if (this.messageHandlers.get(topic).size === 0) {
        this.messageHandlers.delete(topic);
        this.send({ type: 'unsubscribe', topic });
      }
    };
  }

  publish(topic, data) {
    this.send({ type: 'publish', topic, data });
  }

  async request(endpoint, data, timeout = 30000) {
    const requestId = generateId();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: (response) => {
          clearTimeout(timer);
          resolve(response);
        },
        reject
      });

      this.send({ type: 'request', endpoint, requestId, data });
    });
  }

  push(queue, data) {
    this.send({ type: 'push', queue, data });
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }
}

/**
 * Native ZMQ Bridge (for Node.js/Electron/Qt environments)
 * Wraps zeromq npm package or native bindings
 */
class NativeZMQBridge {
  constructor() {
    this.sockets = new Map();
    this.zmq = null;
  }

  async initialize() {
    if (Platform.isNode || Platform.isElectron) {
      try {
        // Dynamic import for Node environments
        this.zmq = await import('zeromq');
      } catch {
        console.warn('ZeroMQ native bindings not available, falling back to WebSocket bridge');
        return false;
      }
    }
    return !!this.zmq;
  }

  async createPublisher(address) {
    const socket = new this.zmq.Publisher();
    await socket.bind(address);
    this.sockets.set(address, socket);
    return {
      publish: async (topic, data) => {
        await socket.send([topic, serialize(data)]);
      },
      close: async () => {
        await socket.close();
        this.sockets.delete(address);
      }
    };
  }

  async createSubscriber(address, topics = []) {
    const socket = new this.zmq.Subscriber();
    await socket.connect(address);
    topics.forEach(topic => socket.subscribe(topic));

    const handlers = new Map();

    // Message receiver loop
    (async () => {
      for await (const [topic, msg] of socket) {
        const topicStr = topic.toString();
        const data = deserialize(msg.toString());
        if (handlers.has(topicStr)) {
          handlers.get(topicStr).forEach(h => h(data));
        }
      }
    })();

    return {
      on: (topic, handler) => {
        if (!handlers.has(topic)) {
          handlers.set(topic, new Set());
          socket.subscribe(topic);
        }
        handlers.get(topic).add(handler);
        return () => handlers.get(topic).delete(handler);
      },
      close: async () => {
        await socket.close();
      }
    };
  }

  async createRequester(address) {
    const socket = new this.zmq.Request();
    await socket.connect(address);

    return {
      request: async (data) => {
        await socket.send(serialize(data));
        const [response] = await socket.receive();
        return deserialize(response.toString());
      },
      close: async () => {
        await socket.close();
      }
    };
  }

  async createReplier(address, handler) {
    const socket = new this.zmq.Reply();
    await socket.bind(address);

    (async () => {
      for await (const [msg] of socket) {
        const request = deserialize(msg.toString());
        const response = await handler(request);
        await socket.send(serialize(response));
      }
    })();

    return {
      close: async () => {
        await socket.close();
      }
    };
  }

  async createPusher(address) {
    const socket = new this.zmq.Push();
    await socket.connect(address);

    return {
      push: async (data) => {
        await socket.send(serialize(data));
      },
      close: async () => {
        await socket.close();
      }
    };
  }

  async createPuller(address, handler) {
    const socket = new this.zmq.Pull();
    await socket.bind(address);

    (async () => {
      for await (const [msg] of socket) {
        const data = deserialize(msg.toString());
        handler(data);
      }
    })();

    return {
      close: async () => {
        await socket.close();
      }
    };
  }
}

/**
 * ZMQ Manager - Unified interface across platforms
 */
class ZMQManager {
  constructor() {
    this.bridge = null;
    this.initialized = false;
    this.channels = new Map();
  }

  async initialize(options = {}) {
    if (this.initialized) return;

    const { wsUrl, preferNative = true } = options;

    // Try native ZMQ first for Node/Electron
    if (preferNative && (Platform.isNode || Platform.isElectron)) {
      const native = new NativeZMQBridge();
      if (await native.initialize()) {
        this.bridge = native;
        this.bridgeType = 'native';
        this.initialized = true;
        events.emit('zmq:initialized', { type: 'native' });
        return;
      }
    }

    // Fall back to WebSocket bridge for web
    if (Platform.isWeb && wsUrl) {
      this.bridge = new WebSocketBridge(wsUrl);
      await this.bridge.connect();
      this.bridgeType = 'websocket';
      this.initialized = true;
      events.emit('zmq:initialized', { type: 'websocket' });
      return;
    }

    throw new Error('No ZMQ bridge available for current platform');
  }

  // Pub/Sub Pattern
  async createChannel(name, options = {}) {
    if (this.channels.has(name)) {
      return this.channels.get(name);
    }

    const channel = {
      name,
      subscribers: new Map(),

      publish: (topic, data) => {
        if (this.bridgeType === 'websocket') {
          this.bridge.publish(`${name}:${topic}`, data);
        }
        // Local subscribers
        if (channel.subscribers.has(topic)) {
          channel.subscribers.get(topic).forEach(h => h(data));
        }
      },

      subscribe: (topic, handler) => {
        if (!channel.subscribers.has(topic)) {
          channel.subscribers.set(topic, new Set());
        }
        channel.subscribers.get(topic).add(handler);

        if (this.bridgeType === 'websocket') {
          this.bridge.subscribe(`${name}:${topic}`, handler);
        }

        return () => {
          channel.subscribers.get(topic).delete(handler);
        };
      }
    };

    this.channels.set(name, channel);
    return channel;
  }

  // Request/Reply Pattern
  async request(endpoint, data, timeout) {
    if (!this.initialized) {
      throw new Error('ZMQ not initialized');
    }

    if (this.bridgeType === 'websocket') {
      return this.bridge.request(endpoint, data, timeout);
    }

    // Native handling would go here
    throw new Error('Request/Reply not yet implemented for native bridge');
  }

  // Push/Pull Pattern
  async push(queue, data) {
    if (!this.initialized) {
      throw new Error('ZMQ not initialized');
    }

    if (this.bridgeType === 'websocket') {
      this.bridge.push(queue, data);
      return;
    }

    throw new Error('Push/Pull not yet implemented for native bridge');
  }

  close() {
    if (this.bridge) {
      this.bridge.close?.();
      this.bridge = null;
      this.initialized = false;
      this.channels.clear();
    }
  }
}

// Singleton instance
const zmq = new ZMQManager();

/**
 * Hot Reload Channel
 * Used by Visual Builder for live preview
 */
async function createHotReloadChannel() {
  const channel = await zmq.createChannel('hot-reload');

  return {
    // Notify that a component changed
    notifyChange: (componentName, changes) => {
      channel.publish('component-change', { componentName, changes, timestamp: Date.now() });
    },

    // Notify that styles changed
    notifyStyleChange: (styles) => {
      channel.publish('style-change', { styles, timestamp: Date.now() });
    },

    // Subscribe to changes
    onComponentChange: (handler) => channel.subscribe('component-change', handler),
    onStyleChange: (handler) => channel.subscribe('style-change', handler),

    // Full reload trigger
    triggerReload: () => channel.publish('reload', { timestamp: Date.now() }),
    onReload: (handler) => channel.subscribe('reload', handler)
  };
}

/**
 * State Sync Channel
 * Real-time state synchronization between processes
 */
async function createStateSyncChannel() {
  const channel = await zmq.createChannel('state-sync');

  return {
    // Broadcast state update
    broadcastState: (key, value) => {
      channel.publish('state-update', { key, value, timestamp: Date.now() });
    },

    // Subscribe to state updates
    onStateUpdate: (handler) => channel.subscribe('state-update', handler),

    // Request current state from another process
    requestState: async (key) => {
      return zmq.request('state-get', { key });
    }
  };
}

/**
 * Builder Communication Channel
 * Visual Builder <-> Running Application
 */
async function createBuilderChannel() {
  const channel = await zmq.createChannel('builder');

  return {
    // Component selection in builder
    selectComponent: (componentId, metadata) => {
      channel.publish('component-selected', { componentId, metadata });
    },
    onComponentSelected: (handler) => channel.subscribe('component-selected', handler),

    // Component property updates
    updateProps: (componentId, props) => {
      channel.publish('props-update', { componentId, props });
    },
    onPropsUpdate: (handler) => channel.subscribe('props-update', handler),

    // Component tree changes
    updateTree: (tree) => {
      channel.publish('tree-update', { tree });
    },
    onTreeUpdate: (handler) => channel.subscribe('tree-update', handler),

    // Style changes
    updateStyles: (componentId, styles) => {
      channel.publish('style-update', { componentId, styles });
    },
    onStyleUpdate: (handler) => channel.subscribe('style-update', handler)
  };
}

export {
  zmq as default,
  ZMQManager,
  WebSocketBridge,
  NativeZMQBridge,
  createHotReloadChannel,
  createStateSyncChannel,
  createBuilderChannel,
  serialize,
  deserialize
};
