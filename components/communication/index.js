/**
 * verenajs Communication Components
 * Chat, video call, notifications, and messaging components
 */

import styles from './styles.module.css';

// ============================================================================
// Video Call
// ============================================================================

export function createVideoCall(props = {}) {
  const {
    localStream = null,
    remoteStreams = [],
    onMuteAudio = null,
    onMuteVideo = null,
    onEndCall = null,
    onScreenShare = null,
    onChat = null,
    onParticipants = null,
    layout = 'grid', // 'grid' | 'spotlight' | 'sidebar'
    showControls = true,
    showParticipantCount = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.videoCall || 'video-call';
  container.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: #111827;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  // Video grid
  const videoGrid = document.createElement('div');
  videoGrid.className = styles.videoGrid || 'video-grid';
  videoGrid.style.cssText = `
    flex: 1;
    display: grid;
    gap: 8px;
    padding: 8px;
    ${layout === 'grid' ? 'grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));' : ''}
    ${layout === 'spotlight' ? 'grid-template-columns: 1fr 200px;' : ''}
    ${layout === 'sidebar' ? 'grid-template-columns: 1fr 250px;' : ''}
  `;

  container.appendChild(videoGrid);

  // State
  let state = {
    audioMuted: false,
    videoMuted: false,
    screenSharing: false
  };

  // Participant count badge
  if (showParticipantCount) {
    const badge = document.createElement('div');
    badge.className = styles.participantBadge || 'participant-badge';
    badge.style.cssText = `
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    badge.innerHTML = `
      <span style="font-size: 16px;">👥</span>
      <span class="count">${remoteStreams.length + 1}</span>
    `;
    container.appendChild(badge);
  }

  // Controls
  if (showControls) {
    const controls = document.createElement('div');
    controls.className = styles.controls || 'video-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      padding: 12px 20px;
      background: rgba(0,0,0,0.6);
      border-radius: 30px;
      backdrop-filter: blur(10px);
    `;

    const createControlBtn = (icon, label, onClick, isActive = false, isDanger = false) => {
      const btn = document.createElement('button');
      btn.className = styles.controlBtn || 'control-btn';
      btn.title = label;
      btn.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
        ${isDanger
          ? 'background: #ef4444; color: white;'
          : isActive
          ? 'background: #3b82f6; color: white;'
          : 'background: rgba(255,255,255,0.2); color: white;'}
      `;
      btn.innerHTML = icon;
      btn.addEventListener('click', () => onClick(btn));
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
      });
      return btn;
    };

    // Audio toggle
    const audioBtn = createControlBtn('🎤', 'Toggle microphone', (btn) => {
      state.audioMuted = !state.audioMuted;
      btn.innerHTML = state.audioMuted ? '🔇' : '🎤';
      btn.style.background = state.audioMuted ? '#ef4444' : 'rgba(255,255,255,0.2)';
      if (onMuteAudio) onMuteAudio(state.audioMuted);
    });
    controls.appendChild(audioBtn);

    // Video toggle
    const videoBtn = createControlBtn('📹', 'Toggle camera', (btn) => {
      state.videoMuted = !state.videoMuted;
      btn.innerHTML = state.videoMuted ? '📵' : '📹';
      btn.style.background = state.videoMuted ? '#ef4444' : 'rgba(255,255,255,0.2)';
      if (onMuteVideo) onMuteVideo(state.videoMuted);
    });
    controls.appendChild(videoBtn);

    // Screen share
    if (onScreenShare) {
      const screenBtn = createControlBtn('🖥️', 'Share screen', (btn) => {
        state.screenSharing = !state.screenSharing;
        btn.style.background = state.screenSharing ? '#3b82f6' : 'rgba(255,255,255,0.2)';
        onScreenShare(state.screenSharing);
      });
      controls.appendChild(screenBtn);
    }

    // Chat
    if (onChat) {
      const chatBtn = createControlBtn('💬', 'Open chat', () => onChat());
      controls.appendChild(chatBtn);
    }

    // Participants
    if (onParticipants) {
      const participantsBtn = createControlBtn('👥', 'Participants', () => onParticipants());
      controls.appendChild(participantsBtn);
    }

    // End call
    if (onEndCall) {
      const endBtn = createControlBtn('📞', 'End call', () => onEndCall(), false, true);
      controls.appendChild(endBtn);
    }

    container.appendChild(controls);
  }

  // Video tile component
  function createVideoTile(stream, name, isLocal = false) {
    const tile = document.createElement('div');
    tile.className = styles.videoTile || 'video-tile';
    tile.style.cssText = `
      position: relative;
      background: #1f2937;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 16/9;
      ${isLocal ? 'position: absolute; width: 200px; right: 16px; top: 16px; z-index: 10;' : ''}
    `;

    if (stream) {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = isLocal;
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        ${isLocal ? 'transform: scaleX(-1);' : ''}
      `;
      tile.appendChild(video);
    } else {
      // Placeholder
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #374151, #1f2937);
      `;
      placeholder.innerHTML = `
        <div style="
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
        ">${name ? name[0].toUpperCase() : '?'}</div>
      `;
      tile.appendChild(placeholder);
    }

    // Name badge
    const nameBadge = document.createElement('div');
    nameBadge.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    `;
    nameBadge.textContent = name || (isLocal ? 'You' : 'Participant');
    tile.appendChild(nameBadge);

    return tile;
  }

  // Render videos
  function render() {
    videoGrid.innerHTML = '';

    // Add remote streams
    remoteStreams.forEach((remote, i) => {
      const tile = createVideoTile(remote.stream, remote.name);
      videoGrid.appendChild(tile);
    });

    // Add local video
    if (localStream) {
      const localTile = createVideoTile(localStream, 'You', true);
      container.appendChild(localTile);
    }
  }

  render();

  // API
  container.addRemoteStream = (stream, name) => {
    remoteStreams.push({ stream, name });
    render();
  };

  container.removeRemoteStream = (stream) => {
    const index = remoteStreams.findIndex(r => r.stream === stream);
    if (index > -1) {
      remoteStreams.splice(index, 1);
      render();
    }
  };

  container.setLocalStream = (stream) => {
    localStream = stream;
    render();
  };

  container.setLayout = (newLayout) => {
    layout = newLayout;
    videoGrid.style.gridTemplateColumns =
      layout === 'grid' ? 'repeat(auto-fit, minmax(300px, 1fr))' :
      layout === 'spotlight' ? '1fr 200px' :
      '1fr 250px';
  };

  return container;
}

// ============================================================================
// Notification Center
// ============================================================================

export function createNotificationCenter(props = {}) {
  const {
    notifications = [],
    onRead = null,
    onAction = null,
    onClear = null,
    maxVisible = 50,
    groupByDate = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.notificationCenter || 'notification-center';
  container.style.cssText = `
    width: 380px;
    max-height: 500px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #111827;';
  title.textContent = 'Notifications';
  header.appendChild(title);

  const clearBtn = document.createElement('button');
  clearBtn.style.cssText = `
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
  `;
  clearBtn.textContent = 'Clear all';
  clearBtn.addEventListener('click', () => {
    if (onClear) onClear();
    currentNotifications = [];
    render();
  });
  clearBtn.addEventListener('mouseenter', () => clearBtn.style.background = '#f3f4f6');
  clearBtn.addEventListener('mouseleave', () => clearBtn.style.background = 'none');
  header.appendChild(clearBtn);

  container.appendChild(header);

  // List
  const list = document.createElement('div');
  list.className = styles.notificationList || 'notification-list';
  list.style.cssText = 'flex: 1; overflow-y: auto;';
  container.appendChild(list);

  let currentNotifications = [...notifications];

  function render() {
    if (currentNotifications.length === 0) {
      list.innerHTML = `
        <div style="
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        ">
          <div style="font-size: 40px; margin-bottom: 12px;">🔔</div>
          <div>No notifications</div>
        </div>
      `;
      return;
    }

    list.innerHTML = '';

    // Group by date if enabled
    const grouped = groupByDate ? groupNotificationsByDate(currentNotifications) : { All: currentNotifications };

    for (const [date, items] of Object.entries(grouped)) {
      if (groupByDate) {
        const dateHeader = document.createElement('div');
        dateHeader.style.cssText = `
          padding: 8px 16px;
          background: #f9fafb;
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          position: sticky;
          top: 0;
        `;
        dateHeader.textContent = date;
        list.appendChild(dateHeader);
      }

      items.slice(0, maxVisible).forEach(notification => {
        const item = createNotificationItem(notification);
        list.appendChild(item);
      });
    }
  }

  function groupNotificationsByDate(notifs) {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifs.forEach(notif => {
      const date = new Date(notif.timestamp).toDateString();
      const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : date;

      if (!groups[label]) groups[label] = [];
      groups[label].push(notif);
    });

    return groups;
  }

  function createNotificationItem(notification) {
    const item = document.createElement('div');
    item.className = styles.notificationItem || 'notification-item';
    item.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
      ${!notification.read ? 'background: #eff6ff;' : ''}
    `;

    item.addEventListener('mouseenter', () => item.style.background = '#f9fafb');
    item.addEventListener('mouseleave', () => item.style.background = notification.read ? 'white' : '#eff6ff');

    item.addEventListener('click', () => {
      notification.read = true;
      item.style.background = 'white';
      if (onRead) onRead(notification);
    });

    // Icon
    const icon = document.createElement('div');
    icon.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      ${getIconStyle(notification.type)}
    `;
    icon.textContent = getIcon(notification.type);
    item.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';

    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display: flex; justify-content: space-between; gap: 8px;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      font-weight: 500;
      color: #111827;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    titleEl.textContent = notification.title;
    titleRow.appendChild(titleEl);

    const time = document.createElement('div');
    time.style.cssText = 'font-size: 12px; color: #9ca3af; flex-shrink: 0;';
    time.textContent = formatTimeAgo(notification.timestamp);
    titleRow.appendChild(time);

    content.appendChild(titleRow);

    if (notification.message) {
      const message = document.createElement('div');
      message.style.cssText = `
        font-size: 13px;
        color: #6b7280;
        margin-top: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      `;
      message.textContent = notification.message;
      content.appendChild(message);
    }

    // Actions
    if (notification.actions && notification.actions.length > 0) {
      const actions = document.createElement('div');
      actions.style.cssText = 'display: flex; gap: 8px; margin-top: 8px;';

      notification.actions.forEach(action => {
        const btn = document.createElement('button');
        btn.style.cssText = `
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          ${action.primary
            ? 'background: #3b82f6; color: white; border: none;'
            : 'background: white; color: #374151; border: 1px solid #d1d5db;'}
        `;
        btn.textContent = action.label;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onAction) onAction(notification, action);
        });
        actions.appendChild(btn);
      });

      content.appendChild(actions);
    }

    item.appendChild(content);

    // Unread indicator
    if (!notification.read) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        flex-shrink: 0;
        align-self: center;
      `;
      item.appendChild(dot);
    }

    return item;
  }

  function getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬',
      update: '🔄',
      security: '🔒',
      payment: '💳',
      social: '👥'
    };
    return icons[type] || '🔔';
  }

  function getIconStyle(type) {
    const styles = {
      info: 'background: #dbeafe;',
      success: 'background: #dcfce7;',
      warning: 'background: #fef3c7;',
      error: 'background: #fee2e2;',
      message: 'background: #e0e7ff;',
      update: 'background: #f3e8ff;',
      security: 'background: #fce7f3;',
      payment: 'background: #d1fae5;',
      social: 'background: #fef3c7;'
    };
    return styles[type] || 'background: #f3f4f6;';
  }

  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  }

  render();

  // API
  container.addNotification = (notification) => {
    currentNotifications.unshift({
      ...notification,
      timestamp: notification.timestamp || new Date(),
      read: false
    });
    render();
  };

  container.markAllRead = () => {
    currentNotifications.forEach(n => n.read = true);
    render();
  };

  container.getUnreadCount = () => currentNotifications.filter(n => !n.read).length;

  container.clear = () => {
    currentNotifications = [];
    render();
  };

  return container;
}

// ============================================================================
// Toast Notifications
// ============================================================================

export function createToastContainer(props = {}) {
  const {
    position = 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
    maxToasts = 5
  } = props;

  const container = document.createElement('div');
  container.className = styles.toastContainer || 'toast-container';

  const positions = {
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;',
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
    'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
  };

  container.style.cssText = `
    position: fixed;
    ${positions[position]}
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;
  `;

  document.body.appendChild(container);

  const toasts = [];

  function show(options) {
    const {
      type = 'info', // 'info' | 'success' | 'warning' | 'error'
      title = '',
      message = '',
      duration = 5000,
      closable = true,
      action = null,
      icon = null
    } = typeof options === 'string' ? { message: options } : options;

    // Remove oldest if at max
    if (toasts.length >= maxToasts) {
      dismiss(toasts[0].id);
    }

    const id = Date.now();
    const toast = document.createElement('div');
    toast.className = styles.toast || 'toast';

    const colors = {
      info: { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️' },
      success: { bg: '#f0fdf4', border: '#10b981', icon: '✅' },
      warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
      error: { bg: '#fef2f2', border: '#ef4444', icon: '❌' }
    };

    const color = colors[type] || colors.info;

    toast.style.cssText = `
      background: ${color.bg};
      border-left: 4px solid ${color.border};
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease;
      min-width: 300px;
    `;

    toast.innerHTML = `
      <span style="font-size: 20px;">${icon || color.icon}</span>
      <div style="flex: 1;">
        ${title ? `<div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${title}</div>` : ''}
        <div style="font-size: 14px; color: #4b5563;">${message}</div>
        ${action ? `<button class="toast-action" style="
          margin-top: 8px;
          background: none;
          border: 1px solid ${color.border};
          color: ${color.border};
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        ">${action.label}</button>` : ''}
      </div>
      ${closable ? `<button class="toast-close" style="
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        font-size: 18px;
        line-height: 1;
      ">×</button>` : ''}
    `;

    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    toast.appendChild(style);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dismiss(id));
    }

    // Action button
    const actionBtn = toast.querySelector('.toast-action');
    if (actionBtn && action) {
      actionBtn.addEventListener('click', action.onClick);
    }

    container.appendChild(toast);
    toasts.push({ id, element: toast });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  }

  function dismiss(id) {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      const toast = toasts[index];
      toast.element.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        toast.element.remove();
        toasts.splice(index, 1);
      }, 300);
    }
  }

  function clear() {
    toasts.forEach(t => t.element.remove());
    toasts.length = 0;
  }

  // Convenience methods
  container.show = show;
  container.success = (msg) => show({ type: 'success', message: msg });
  container.error = (msg) => show({ type: 'error', message: msg });
  container.warning = (msg) => show({ type: 'warning', message: msg });
  container.info = (msg) => show({ type: 'info', message: msg });
  container.dismiss = dismiss;
  container.clear = clear;
  container.destroy = () => container.remove();

  return container;
}

// ============================================================================
// User Presence Indicator
// ============================================================================

export function createPresenceIndicator(props = {}) {
  const {
    status = 'online', // 'online' | 'offline' | 'away' | 'busy' | 'invisible'
    name = '',
    avatar = null,
    size = 'medium', // 'small' | 'medium' | 'large'
    showStatus = true,
    showName = true,
    onClick = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.presenceIndicator || 'presence-indicator';

  const sizes = {
    small: { avatar: 32, dot: 10, font: 13 },
    medium: { avatar: 40, dot: 12, font: 14 },
    large: { avatar: 56, dot: 14, font: 16 }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    ${onClick ? 'cursor: pointer;' : ''}
  `;

  if (onClick) {
    container.addEventListener('click', onClick);
  }

  // Avatar with status dot
  const avatarWrapper = document.createElement('div');
  avatarWrapper.style.cssText = `
    position: relative;
    width: ${sizeConfig.avatar}px;
    height: ${sizeConfig.avatar}px;
  `;

  const avatarEl = document.createElement('div');
  avatarEl.style.cssText = `
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${avatar ? `url(${avatar}) center/cover` : '#e5e7eb'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #374151;
    font-size: ${sizeConfig.font}px;
  `;

  if (!avatar && name) {
    avatarEl.textContent = name.charAt(0).toUpperCase();
  }

  avatarWrapper.appendChild(avatarEl);

  // Status dot
  if (showStatus) {
    const statusDot = document.createElement('div');
    statusDot.className = styles.statusDot || 'status-dot';

    const statusColors = {
      online: '#10b981',
      offline: '#9ca3af',
      away: '#f59e0b',
      busy: '#ef4444',
      invisible: '#6b7280'
    };

    statusDot.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: ${sizeConfig.dot}px;
      height: ${sizeConfig.dot}px;
      border-radius: 50%;
      background: ${statusColors[status] || statusColors.offline};
      border: 2px solid white;
      box-shadow: 0 0 0 1px ${statusColors[status] || statusColors.offline};
    `;

    avatarWrapper.appendChild(statusDot);
  }

  container.appendChild(avatarWrapper);

  // Name and status text
  if (showName && name) {
    const info = document.createElement('div');

    const nameEl = document.createElement('div');
    nameEl.style.cssText = `
      font-weight: 500;
      color: #111827;
      font-size: ${sizeConfig.font}px;
    `;
    nameEl.textContent = name;
    info.appendChild(nameEl);

    const statusText = document.createElement('div');
    statusText.style.cssText = `
      font-size: ${sizeConfig.font - 2}px;
      color: #6b7280;
      text-transform: capitalize;
    `;
    statusText.textContent = status;
    info.appendChild(statusText);

    container.appendChild(info);
  }

  // API
  container.setStatus = (newStatus) => {
    const dot = container.querySelector(`.${styles.statusDot || 'status-dot'}`);
    if (dot) {
      const statusColors = {
        online: '#10b981',
        offline: '#9ca3af',
        away: '#f59e0b',
        busy: '#ef4444',
        invisible: '#6b7280'
      };
      dot.style.background = statusColors[newStatus] || statusColors.offline;
      dot.style.boxShadow = `0 0 0 1px ${statusColors[newStatus] || statusColors.offline}`;
    }
  };

  return container;
}

// ============================================================================
// Typing Indicator
// ============================================================================

export function createTypingIndicator(props = {}) {
  const {
    users = [], // [{ name, avatar }]
    maxVisible = 3
  } = props;

  const container = document.createElement('div');
  container.className = styles.typingIndicator || 'typing-indicator';
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: #6b7280;
    font-size: 13px;
  `;

  function render() {
    if (users.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';

    // Avatars
    const avatars = document.createElement('div');
    avatars.style.cssText = 'display: flex; margin-right: 4px;';

    users.slice(0, maxVisible).forEach((user, i) => {
      const avatar = document.createElement('div');
      avatar.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${user.avatar ? `url(${user.avatar}) center/cover` : '#e5e7eb'};
        border: 2px solid white;
        margin-left: ${i > 0 ? '-8px' : '0'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: #374151;
      `;
      if (!user.avatar) avatar.textContent = user.name?.charAt(0) || '?';
      avatars.appendChild(avatar);
    });

    container.innerHTML = '';
    container.appendChild(avatars);

    // Text
    const text = document.createElement('span');
    if (users.length === 1) {
      text.textContent = `${users[0].name} is typing`;
    } else if (users.length === 2) {
      text.textContent = `${users[0].name} and ${users[1].name} are typing`;
    } else {
      text.textContent = `${users[0].name} and ${users.length - 1} others are typing`;
    }
    container.appendChild(text);

    // Dots animation
    const dots = document.createElement('span');
    dots.innerHTML = `
      <span style="animation: typingDot 1s infinite;">.</span>
      <span style="animation: typingDot 1s infinite 0.2s;">.</span>
      <span style="animation: typingDot 1s infinite 0.4s;">.</span>
      <style>
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
      </style>
    `;
    container.appendChild(dots);
  }

  render();

  // API
  container.setUsers = (newUsers) => {
    users.length = 0;
    users.push(...newUsers);
    render();
  };

  container.addUser = (user) => {
    if (!users.find(u => u.name === user.name)) {
      users.push(user);
      render();
    }
  };

  container.removeUser = (name) => {
    const index = users.findIndex(u => u.name === name);
    if (index > -1) {
      users.splice(index, 1);
      render();
    }
  };

  return container;
}

// Export all
export default {
  createVideoCall,
  createNotificationCenter,
  createToastContainer,
  createPresenceIndicator,
  createTypingIndicator
};
