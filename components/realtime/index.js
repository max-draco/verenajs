/**
 * verenajs Real-time Components
 * WebSocket management and live data display components
 *
 * @version 2.0.0
 */

import { dom, events, injectStyle } from '../../core/core.js';

// Base real-time styles
const REALTIME_STYLES = `
  @keyframes v-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes v-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes v-slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes v-count {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }

  .v-realtime-card {
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.75rem;
    overflow: hidden;
  }
`;

injectStyle('v-realtime-base', REALTIME_STYLES);

// ============================================
// WEBSOCKET MANAGER
// ============================================

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.subscribers = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(id, url, options = {}) {
    if (this.connections.has(id)) {
      return this.connections.get(id);
    }

    const config = {
      autoReconnect: true,
      heartbeatInterval: 30000,
      onOpen: null,
      onClose: null,
      onError: null,
      onMessage: null,
      ...options
    };

    const connection = {
      id,
      url,
      ws: null,
      config,
      status: 'connecting',
      heartbeatTimer: null
    };

    this.createWebSocket(connection);
    this.connections.set(id, connection);

    return connection;
  }

  createWebSocket(connection) {
    const { id, url, config } = connection;

    try {
      connection.ws = new WebSocket(url);
      connection.status = 'connecting';

      connection.ws.onopen = () => {
        connection.status = 'connected';
        this.reconnectAttempts.set(id, 0);
        this.startHeartbeat(connection);
        this.emit(id, 'status', { status: 'connected' });
        config.onOpen?.();
      };

      connection.ws.onclose = (event) => {
        connection.status = 'disconnected';
        this.stopHeartbeat(connection);
        this.emit(id, 'status', { status: 'disconnected', code: event.code });
        config.onClose?.(event);

        if (config.autoReconnect && !event.wasClean) {
          this.attemptReconnect(connection);
        }
      };

      connection.ws.onerror = (error) => {
        connection.status = 'error';
        this.emit(id, 'error', { error });
        config.onError?.(error);
      };

      connection.ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
        this.emit(id, 'message', data);
        config.onMessage?.(data);
      };
    } catch (error) {
      connection.status = 'error';
      console.error(`WebSocket connection error for ${id}:`, error);
    }
  }

  attemptReconnect(connection) {
    const { id } = connection;
    const attempts = this.reconnectAttempts.get(id) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      this.emit(id, 'status', { status: 'failed', message: 'Max reconnect attempts reached' });
      return;
    }

    this.reconnectAttempts.set(id, attempts + 1);
    const delay = this.reconnectDelay * Math.pow(2, attempts);

    this.emit(id, 'status', { status: 'reconnecting', attempt: attempts + 1, delay });

    setTimeout(() => {
      this.createWebSocket(connection);
    }, delay);
  }

  startHeartbeat(connection) {
    if (connection.config.heartbeatInterval > 0) {
      connection.heartbeatTimer = setInterval(() => {
        if (connection.ws?.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, connection.config.heartbeatInterval);
    }
  }

  stopHeartbeat(connection) {
    if (connection.heartbeatTimer) {
      clearInterval(connection.heartbeatTimer);
      connection.heartbeatTimer = null;
    }
  }

  send(id, data) {
    const connection = this.connections.get(id);
    if (connection?.ws?.readyState === WebSocket.OPEN) {
      connection.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  subscribe(id, event, callback) {
    const key = `${id}:${event}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  emit(id, event, data) {
    const key = `${id}:${event}`;
    this.subscribers.get(key)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  disconnect(id) {
    const connection = this.connections.get(id);
    if (connection) {
      this.stopHeartbeat(connection);
      connection.ws?.close();
      this.connections.delete(id);
      this.reconnectAttempts.delete(id);
    }
  }

  disconnectAll() {
    this.connections.forEach((_, id) => this.disconnect(id));
  }

  getStatus(id) {
    return this.connections.get(id)?.status || 'unknown';
  }
}

export const wsManager = new WebSocketManager();

// ============================================
// LIVE INDICATOR COMPONENT
// ============================================

const LIVE_INDICATOR_STYLES = `
  .v-live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .v-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--v-success, #22c55e);
    animation: v-pulse 2s ease-in-out infinite;
  }

  .v-live-indicator.disconnected .v-live-dot {
    background: var(--v-error, #ef4444);
    animation: none;
  }

  .v-live-indicator.connecting .v-live-dot {
    background: var(--v-warning, #f59e0b);
    animation: v-blink 1s ease-in-out infinite;
  }

  .v-live-indicator.error .v-live-dot {
    background: var(--v-error, #ef4444);
    animation: none;
  }
`;

injectStyle('v-live-indicator', LIVE_INDICATOR_STYLES);

export function createLiveIndicator(props = {}) {
  const {
    connectionId = null,
    status = 'connected',
    showLabel = true,
    labels = {
      connected: 'Live',
      connecting: 'Connecting',
      disconnected: 'Offline',
      error: 'Error',
      reconnecting: 'Reconnecting'
    }
  } = props;

  const container = dom.create('div', {
    className: `v-live-indicator ${status}`
  });

  let currentStatus = status;

  function render() {
    container.className = `v-live-indicator ${currentStatus}`;
    container.innerHTML = `
      <span class="v-live-dot"></span>
      ${showLabel ? `<span class="v-live-label">${labels[currentStatus] || currentStatus}</span>` : ''}
    `;
  }

  render();

  // Subscribe to connection status if connectionId provided
  if (connectionId) {
    wsManager.subscribe(connectionId, 'status', ({ status: newStatus }) => {
      currentStatus = newStatus;
      render();
    });
  }

  // API
  container.setStatus = (newStatus) => {
    currentStatus = newStatus;
    render();
  };

  return container;
}

// ============================================
// CONNECTION STATUS COMPONENT
// ============================================

const CONNECTION_STATUS_STYLES = `
  .v-connection-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.75rem;
  }

  .v-connection-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .v-connection-icon.connected { background: rgba(34, 197, 94, 0.1); }
  .v-connection-icon.disconnected { background: rgba(239, 68, 68, 0.1); }
  .v-connection-icon.connecting { background: rgba(245, 158, 11, 0.1); }

  .v-connection-info { flex: 1; }

  .v-connection-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--v-text, #1e293b);
  }

  .v-connection-details {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    margin-top: 0.25rem;
  }

  .v-connection-action button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .v-connection-action .connect-btn {
    background: var(--v-primary, #3b82f6);
    color: white;
  }

  .v-connection-action .disconnect-btn {
    background: var(--v-error, #ef4444);
    color: white;
  }
`;

injectStyle('v-connection-status', CONNECTION_STATUS_STYLES);

export function createConnectionStatus(props = {}) {
  const {
    connectionId = null,
    url = '',
    onConnect = null,
    onDisconnect = null
  } = props;

  const container = dom.create('div', { className: 'v-connection-status' });

  let status = connectionId ? wsManager.getStatus(connectionId) : 'disconnected';
  let latency = null;

  function getIcon(s) {
    switch (s) {
      case 'connected': return '🟢';
      case 'connecting':
      case 'reconnecting': return '🟡';
      default: return '🔴';
    }
  }

  function render() {
    container.innerHTML = `
      <div class="v-connection-icon ${status}">${getIcon(status)}</div>
      <div class="v-connection-info">
        <div class="v-connection-title">${status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}</div>
        <div class="v-connection-details">
          ${url ? `URL: ${url}` : ''}
          ${latency !== null ? ` | Latency: ${latency}ms` : ''}
        </div>
      </div>
      <div class="v-connection-action">
        ${status === 'connected'
          ? '<button class="disconnect-btn">Disconnect</button>'
          : '<button class="connect-btn">Connect</button>'
        }
      </div>
    `;

    const btn = container.querySelector('button');
    btn.addEventListener('click', () => {
      if (status === 'connected') {
        onDisconnect?.();
        if (connectionId) wsManager.disconnect(connectionId);
      } else {
        onConnect?.();
      }
    });
  }

  render();

  // Subscribe to status changes
  if (connectionId) {
    wsManager.subscribe(connectionId, 'status', ({ status: newStatus }) => {
      status = newStatus;
      render();
    });
  }

  // API
  container.setStatus = (newStatus) => {
    status = newStatus;
    render();
  };

  container.setLatency = (ms) => {
    latency = ms;
    render();
  };

  return container;
}

// ============================================
// LIVE COUNTER COMPONENT
// ============================================

const LIVE_COUNTER_STYLES = `
  .v-live-counter {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    font-family: 'Monaco', 'Menlo', monospace;
  }

  .v-counter-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--v-text, #1e293b);
    position: relative;
    overflow: hidden;
  }

  .v-counter-digit {
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .v-counter-digit.changing {
    animation: v-count 0.3s ease;
  }

  .v-counter-prefix,
  .v-counter-suffix {
    font-size: 1rem;
    color: var(--v-text-muted, #64748b);
  }

  .v-counter-label {
    display: block;
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    margin-top: 0.25rem;
    font-family: system-ui, sans-serif;
  }
`;

injectStyle('v-live-counter', LIVE_COUNTER_STYLES);

export function createLiveCounter(props = {}) {
  const {
    value = 0,
    prefix = '',
    suffix = '',
    label = '',
    precision = 0,
    animate = true,
    format = null
  } = props;

  const container = dom.create('div', { className: 'v-live-counter' });

  let currentValue = value;
  let displayValue = value;
  let animationFrame = null;

  function formatValue(val) {
    if (format) return format(val);
    return val.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }

  function render() {
    container.innerHTML = `
      ${prefix ? `<span class="v-counter-prefix">${prefix}</span>` : ''}
      <span class="v-counter-value">${formatValue(displayValue)}</span>
      ${suffix ? `<span class="v-counter-suffix">${suffix}</span>` : ''}
      ${label ? `<span class="v-counter-label">${label}</span>` : ''}
    `;
  }

  function animateValue(from, to, duration = 500) {
    if (!animate) {
      displayValue = to;
      render();
      return;
    }

    const startTime = performance.now();
    const diff = to - from;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      displayValue = from + diff * eased;
      render();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      } else {
        displayValue = to;
        render();
      }
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(update);
  }

  render();

  // API
  container.setValue = (newValue) => {
    const oldValue = currentValue;
    currentValue = newValue;
    animateValue(oldValue, newValue);
  };

  container.increment = (amount = 1) => {
    container.setValue(currentValue + amount);
  };

  container.decrement = (amount = 1) => {
    container.setValue(currentValue - amount);
  };

  return container;
}

// ============================================
// LIVE CLOCK COMPONENT
// ============================================

const LIVE_CLOCK_STYLES = `
  .v-live-clock {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.75rem;
  }

  .v-clock-time {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 2rem;
    font-weight: 700;
    color: var(--v-text, #1e293b);
    letter-spacing: 0.05em;
  }

  .v-clock-date {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    margin-top: 0.25rem;
  }

  .v-clock-timezone {
    font-size: 0.65rem;
    color: var(--v-text-muted, #94a3b8);
    margin-top: 0.25rem;
    text-transform: uppercase;
  }

  .v-clock-separator {
    animation: v-blink 1s steps(1) infinite;
  }
`;

injectStyle('v-live-clock', LIVE_CLOCK_STYLES);

export function createLiveClock(props = {}) {
  const {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    format24h = true,
    showDate = true,
    showTimezone = true,
    showSeconds = true
  } = props;

  const container = dom.create('div', { className: 'v-live-clock' });

  let intervalId = null;

  function formatTime(date) {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !format24h,
      timeZone: timezone
    };

    if (showSeconds) {
      options.second = '2-digit';
    }

    return date.toLocaleTimeString('en-US', options);
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
  }

  function render() {
    const now = new Date();
    const timeStr = formatTime(now);

    // Add blinking separator
    const formattedTime = timeStr.replace(/:/g, '<span class="v-clock-separator">:</span>');

    container.innerHTML = `
      <div class="v-clock-time">${formattedTime}</div>
      ${showDate ? `<div class="v-clock-date">${formatDate(now)}</div>` : ''}
      ${showTimezone ? `<div class="v-clock-timezone">${timezone}</div>` : ''}
    `;
  }

  function start() {
    render();
    intervalId = setInterval(render, 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  start();

  // API
  container.start = start;
  container.stop = stop;
  container.setTimezone = (tz) => {
    props.timezone = tz;
    render();
  };

  // Cleanup when removed from DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === container) {
          stop();
          observer.disconnect();
        }
      });
    });
  });

  if (container.parentNode) {
    observer.observe(container.parentNode, { childList: true });
  }

  return container;
}

// ============================================
// ACTIVITY FEED COMPONENT
// ============================================

const ACTIVITY_FEED_STYLES = `
  .v-activity-feed {
    max-height: 400px;
    overflow-y: auto;
  }

  .v-activity-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
    animation: v-slide-up 0.3s ease;
  }

  .v-activity-item:last-child { border-bottom: none; }

  .v-activity-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--v-surface-alt, #f1f5f9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .v-activity-icon.success { background: rgba(34, 197, 94, 0.1); }
  .v-activity-icon.error { background: rgba(239, 68, 68, 0.1); }
  .v-activity-icon.warning { background: rgba(245, 158, 11, 0.1); }
  .v-activity-icon.info { background: rgba(59, 130, 246, 0.1); }

  .v-activity-content { flex: 1; min-width: 0; }

  .v-activity-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--v-text, #1e293b);
    margin-bottom: 0.25rem;
  }

  .v-activity-description {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    line-height: 1.4;
  }

  .v-activity-time {
    font-size: 0.65rem;
    color: var(--v-text-muted, #94a3b8);
    margin-top: 0.5rem;
  }

  .v-activity-empty {
    padding: 2rem;
    text-align: center;
    color: var(--v-text-muted, #64748b);
    font-size: 0.875rem;
  }
`;

injectStyle('v-activity-feed', ACTIVITY_FEED_STYLES);

export function createActivityFeed(props = {}) {
  const {
    items = [],
    maxItems = 50,
    showEmpty = true,
    emptyMessage = 'No activity yet'
  } = props;

  const container = dom.create('div', { className: 'v-realtime-card' });

  const header = dom.create('div', { className: 'v-trading-header' });
  header.innerHTML = '<span class="v-trading-title">Activity</span>';
  container.appendChild(header);

  const feed = dom.create('div', { className: 'v-activity-feed' });
  container.appendChild(feed);

  let currentItems = [...items];

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    user: '👤',
    system: '⚙',
    default: '•'
  };

  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function render() {
    dom.empty(feed);

    if (currentItems.length === 0 && showEmpty) {
      feed.innerHTML = `<div class="v-activity-empty">${emptyMessage}</div>`;
      return;
    }

    currentItems.forEach(item => {
      const activityItem = dom.create('div', { className: 'v-activity-item' });
      activityItem.innerHTML = `
        <div class="v-activity-icon ${item.type || 'default'}">${icons[item.type] || icons.default}</div>
        <div class="v-activity-content">
          <div class="v-activity-title">${item.title}</div>
          ${item.description ? `<div class="v-activity-description">${item.description}</div>` : ''}
          <div class="v-activity-time">${formatTimeAgo(item.timestamp || Date.now())}</div>
        </div>
      `;
      feed.appendChild(activityItem);
    });
  }

  render();

  // API
  container.addItem = (item) => {
    currentItems = [{ ...item, timestamp: item.timestamp || Date.now() }, ...currentItems].slice(0, maxItems);
    render();
  };

  container.setItems = (newItems) => {
    currentItems = newItems.slice(0, maxItems);
    render();
  };

  container.clear = () => {
    currentItems = [];
    render();
  };

  return container;
}

// ============================================
// METRIC CARD COMPONENT
// ============================================

const METRIC_CARD_STYLES = `
  .v-metric-card {
    padding: 1.5rem;
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.75rem;
  }

  .v-metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .v-metric-label {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .v-metric-icon {
    width: 32px;
    height: 32px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    background: var(--v-surface-alt, #f1f5f9);
  }

  .v-metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--v-text, #1e293b);
    font-family: 'Monaco', 'Menlo', monospace;
  }

  .v-metric-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .v-metric-change {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
  }

  .v-metric-change.positive {
    background: rgba(34, 197, 94, 0.1);
    color: var(--v-success, #22c55e);
  }

  .v-metric-change.negative {
    background: rgba(239, 68, 68, 0.1);
    color: var(--v-error, #ef4444);
  }

  .v-metric-period {
    font-size: 0.7rem;
    color: var(--v-text-muted, #94a3b8);
  }

  .v-metric-sparkline {
    height: 40px;
    margin-top: 1rem;
    display: flex;
    align-items: flex-end;
    gap: 2px;
  }

  .v-metric-sparkline-bar {
    flex: 1;
    background: var(--v-primary, #3b82f6);
    border-radius: 2px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .v-metric-sparkline-bar:hover { opacity: 1; }
`;

injectStyle('v-metric-card', METRIC_CARD_STYLES);

export function createMetricCard(props = {}) {
  const {
    label = 'Metric',
    value = 0,
    icon = '📊',
    change = null,
    period = 'vs last period',
    format = null,
    sparkline = null
  } = props;

  const container = dom.create('div', { className: 'v-metric-card' });

  let currentValue = value;

  function formatValue(val) {
    if (format) return format(val);
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  }

  function render() {
    const isPositive = change >= 0;

    container.innerHTML = `
      <div class="v-metric-header">
        <span class="v-metric-label">${label}</span>
        <div class="v-metric-icon">${icon}</div>
      </div>
      <div class="v-metric-value">${formatValue(currentValue)}</div>
      ${change !== null ? `
        <div class="v-metric-footer">
          <span class="v-metric-change ${isPositive ? 'positive' : 'negative'}">
            ${isPositive ? '↑' : '↓'} ${Math.abs(change)}%
          </span>
          <span class="v-metric-period">${period}</span>
        </div>
      ` : ''}
      ${sparkline ? `
        <div class="v-metric-sparkline">
          ${sparkline.map(v => {
            const max = Math.max(...sparkline);
            const height = (v / max) * 100;
            return `<div class="v-metric-sparkline-bar" style="height: ${height}%"></div>`;
          }).join('')}
        </div>
      ` : ''}
    `;
  }

  render();

  // API
  container.setValue = (newValue) => {
    currentValue = newValue;
    render();
  };

  container.update = (newProps) => {
    Object.assign(props, newProps);
    if (newProps.value !== undefined) currentValue = newProps.value;
    render();
  };

  return container;
}

// ============================================
// METRIC GRID COMPONENT
// ============================================

export function createMetricGrid(props = {}) {
  const {
    metrics = [],
    columns = 4,
    gap = '1rem'
  } = props;

  const container = dom.create('div', {
    className: 'v-metric-grid',
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap
    }
  });

  const cards = new Map();

  function render(newMetrics = metrics) {
    dom.empty(container);
    cards.clear();

    newMetrics.forEach(metric => {
      const card = createMetricCard(metric);
      cards.set(metric.id || metric.label, card);
      container.appendChild(card);
    });
  }

  render();

  // API
  container.update = (newMetrics) => render(newMetrics);
  container.updateMetric = (id, data) => {
    const card = cards.get(id);
    if (card) card.update(data);
  };

  return container;
}

// Export all real-time components
export default {
  wsManager,
  createLiveIndicator,
  createConnectionStatus,
  createLiveCounter,
  createLiveClock,
  createActivityFeed,
  createMetricCard,
  createMetricGrid
};
