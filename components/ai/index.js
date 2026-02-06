/**
 * verenajs AI & Chatbot Components
 * Production-ready AI interface components
 */

import styles from './styles.module.css';

// ============================================================================
// Chat Message
// ============================================================================

export function createChatMessage(props = {}) {
  const {
    content = '',
    sender = 'user', // 'user' | 'assistant' | 'system'
    timestamp = new Date(),
    avatar = null,
    name = null,
    isTyping = false,
    actions = [], // [{ label, onClick }]
    onRetry = null,
    onCopy = null,
    onEdit = null
  } = props;

  const message = document.createElement('div');
  message.className = `${styles.chatMessage || 'chat-message'} ${styles[sender] || sender}`;
  message.style.cssText = `
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    ${sender === 'user' ? 'flex-direction: row-reverse;' : ''}
    ${sender === 'system' ? 'justify-content: center;' : ''}
  `;

  // Avatar
  if (sender !== 'system') {
    const avatarEl = document.createElement('div');
    avatarEl.className = styles.avatar || 'chat-avatar';
    avatarEl.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      ${sender === 'user'
        ? 'background: #3b82f6; color: white;'
        : 'background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white;'}
    `;

    if (avatar) {
      avatarEl.innerHTML = `<img src="${avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    } else {
      avatarEl.textContent = sender === 'user' ? 'U' : 'AI';
    }
    message.appendChild(avatarEl);
  }

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    flex: 1;
    max-width: 70%;
    ${sender === 'user' ? 'text-align: right;' : ''}
  `;

  // Name
  if (name && sender !== 'system') {
    const nameEl = document.createElement('div');
    nameEl.className = styles.messageName || 'message-name';
    nameEl.style.cssText = 'font-size: 12px; color: #6b7280; margin-bottom: 4px;';
    nameEl.textContent = name;
    contentWrapper.appendChild(nameEl);
  }

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = styles.bubble || 'chat-bubble';
  bubble.style.cssText = `
    display: inline-block;
    padding: 10px 14px;
    border-radius: 16px;
    ${sender === 'user'
      ? 'background: #3b82f6; color: white; border-bottom-right-radius: 4px;'
      : sender === 'assistant'
      ? 'background: #f3f4f6; color: #111827; border-bottom-left-radius: 4px;'
      : 'background: #fef3c7; color: #92400e; font-size: 13px;'}
    line-height: 1.5;
    word-wrap: break-word;
    text-align: left;
  `;

  if (isTyping) {
    bubble.innerHTML = `
      <div style="display: flex; gap: 4px; padding: 4px 8px;">
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1s infinite;"></span>
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1s infinite 0.2s;"></span>
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1s infinite 0.4s;"></span>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }
    `;
    bubble.appendChild(style);
  } else {
    // Parse markdown-like content
    bubble.innerHTML = parseContent(content);
  }

  contentWrapper.appendChild(bubble);

  // Timestamp
  const timeEl = document.createElement('div');
  timeEl.className = styles.timestamp || 'message-timestamp';
  timeEl.style.cssText = 'font-size: 11px; color: #9ca3af; margin-top: 4px;';
  timeEl.textContent = formatTime(timestamp);
  contentWrapper.appendChild(timeEl);

  // Actions for assistant messages
  if (sender === 'assistant' && (onRetry || onCopy || onEdit || actions.length > 0)) {
    const actionsEl = document.createElement('div');
    actionsEl.className = styles.messageActions || 'message-actions';
    actionsEl.style.cssText = 'display: flex; gap: 8px; margin-top: 8px; opacity: 0; transition: opacity 0.2s;';

    const actionBtn = (icon, label, onClick) => {
      const btn = document.createElement('button');
      btn.className = styles.actionBtn || 'action-btn';
      btn.style.cssText = `
        background: none;
        border: 1px solid #e5e7eb;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
      `;
      btn.innerHTML = `<span>${icon}</span><span>${label}</span>`;
      btn.addEventListener('click', onClick);
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#f3f4f6';
        btn.style.borderColor = '#d1d5db';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'none';
        btn.style.borderColor = '#e5e7eb';
      });
      return btn;
    };

    if (onCopy) actionsEl.appendChild(actionBtn('📋', 'Copy', () => {
      navigator.clipboard.writeText(content);
      onCopy();
    }));
    if (onRetry) actionsEl.appendChild(actionBtn('🔄', 'Retry', onRetry));
    if (onEdit) actionsEl.appendChild(actionBtn('✏️', 'Edit', onEdit));

    actions.forEach(action => {
      actionsEl.appendChild(actionBtn('', action.label, action.onClick));
    });

    contentWrapper.appendChild(actionsEl);

    message.addEventListener('mouseenter', () => actionsEl.style.opacity = '1');
    message.addEventListener('mouseleave', () => actionsEl.style.opacity = '0');
  }

  message.appendChild(contentWrapper);

  return message;
}

function parseContent(content) {
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0;"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function formatTime(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// Chat Input
// ============================================================================

export function createChatInput(props = {}) {
  const {
    placeholder = 'Type a message...',
    onSend = null,
    onTyping = null,
    maxLength = 4000,
    showCharCount = true,
    attachments = true,
    voiceInput = false,
    suggestions = [], // Quick reply suggestions
    disabled = false
  } = props;

  const container = document.createElement('div');
  container.className = styles.chatInput || 'chat-input';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border-top: 1px solid #e5e7eb;
  `;

  // Suggestions
  if (suggestions.length > 0) {
    const suggestionsEl = document.createElement('div');
    suggestionsEl.className = styles.suggestions || 'suggestions';
    suggestionsEl.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';

    suggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = styles.suggestionBtn || 'suggestion-btn';
      btn.style.cssText = `
        background: #f3f4f6;
        border: none;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        color: #374151;
        cursor: pointer;
        transition: background 0.2s;
      `;
      btn.textContent = suggestion;
      btn.addEventListener('click', () => {
        if (onSend) onSend(suggestion);
      });
      btn.addEventListener('mouseenter', () => btn.style.background = '#e5e7eb');
      btn.addEventListener('mouseleave', () => btn.style.background = '#f3f4f6');
      suggestionsEl.appendChild(btn);
    });

    container.appendChild(suggestionsEl);
  }

  // Input row
  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display: flex; align-items: flex-end; gap: 8px;';

  // Attachment button
  if (attachments) {
    const attachBtn = document.createElement('button');
    attachBtn.className = styles.attachBtn || 'attach-btn';
    attachBtn.style.cssText = `
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #6b7280;
      font-size: 20px;
      transition: color 0.2s;
    `;
    attachBtn.innerHTML = '📎';
    attachBtn.title = 'Attach file';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      container.dispatchEvent(new CustomEvent('attach', { detail: { files } }));
    });

    attachBtn.addEventListener('click', () => fileInput.click());
    attachBtn.addEventListener('mouseenter', () => attachBtn.style.color = '#3b82f6');
    attachBtn.addEventListener('mouseleave', () => attachBtn.style.color = '#6b7280');

    inputRow.appendChild(attachBtn);
    inputRow.appendChild(fileInput);
  }

  // Text input wrapper
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `
    flex: 1;
    position: relative;
    background: #f3f4f6;
    border-radius: 20px;
    display: flex;
    align-items: flex-end;
    padding: 4px;
  `;

  const textarea = document.createElement('textarea');
  textarea.className = styles.textarea || 'chat-textarea';
  textarea.placeholder = placeholder;
  textarea.maxLength = maxLength;
  textarea.disabled = disabled;
  textarea.style.cssText = `
    flex: 1;
    background: none;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
    min-height: 20px;
    max-height: 120px;
    font-family: inherit;
  `;
  textarea.rows = 1;

  // Auto-resize
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    if (onTyping) onTyping(textarea.value);

    if (showCharCount) {
      charCount.textContent = `${textarea.value.length}/${maxLength}`;
    }
  });

  // Send on Enter (Shift+Enter for new line)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputWrapper.appendChild(textarea);

  // Send button
  const sendBtn = document.createElement('button');
  sendBtn.className = styles.sendBtn || 'send-btn';
  sendBtn.style.cssText = `
    background: #3b82f6;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    transition: background 0.2s;
    flex-shrink: 0;
  `;
  sendBtn.innerHTML = '➤';
  sendBtn.disabled = disabled;
  sendBtn.addEventListener('click', sendMessage);
  sendBtn.addEventListener('mouseenter', () => sendBtn.style.background = '#2563eb');
  sendBtn.addEventListener('mouseleave', () => sendBtn.style.background = '#3b82f6');

  inputWrapper.appendChild(sendBtn);
  inputRow.appendChild(inputWrapper);

  // Voice input
  if (voiceInput && 'webkitSpeechRecognition' in window) {
    const voiceBtn = document.createElement('button');
    voiceBtn.className = styles.voiceBtn || 'voice-btn';
    voiceBtn.style.cssText = `
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #6b7280;
      font-size: 20px;
      transition: color 0.2s;
    `;
    voiceBtn.innerHTML = '🎤';
    voiceBtn.title = 'Voice input';

    let recognition = null;
    let isRecording = false;

    voiceBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
        isRecording = false;
        voiceBtn.style.color = '#6b7280';
      } else {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          textarea.value = transcript;
          textarea.dispatchEvent(new Event('input'));
        };

        recognition.onend = () => {
          isRecording = false;
          voiceBtn.style.color = '#6b7280';
        };

        recognition.start();
        isRecording = true;
        voiceBtn.style.color = '#ef4444';
      }
    });

    inputRow.appendChild(voiceBtn);
  }

  container.appendChild(inputRow);

  // Character count
  let charCount = null;
  if (showCharCount) {
    charCount = document.createElement('div');
    charCount.className = styles.charCount || 'char-count';
    charCount.style.cssText = 'font-size: 11px; color: #9ca3af; text-align: right;';
    charCount.textContent = `0/${maxLength}`;
    container.appendChild(charCount);
  }

  function sendMessage() {
    const message = textarea.value.trim();
    if (message && onSend) {
      onSend(message);
      textarea.value = '';
      textarea.style.height = 'auto';
      if (showCharCount) charCount.textContent = `0/${maxLength}`;
    }
  }

  // API
  container.focus = () => textarea.focus();
  container.getValue = () => textarea.value;
  container.setValue = (value) => {
    textarea.value = value;
    textarea.dispatchEvent(new Event('input'));
  };
  container.clear = () => {
    textarea.value = '';
    if (showCharCount) charCount.textContent = `0/${maxLength}`;
  };
  container.setDisabled = (isDisabled) => {
    textarea.disabled = isDisabled;
    sendBtn.disabled = isDisabled;
  };

  return container;
}

// ============================================================================
// Chat Container
// ============================================================================

export function createChatContainer(props = {}) {
  const {
    messages = [],
    onSend = null,
    placeholder = 'Type a message...',
    suggestions = [],
    showTypingIndicator = false,
    userAvatar = null,
    assistantAvatar = null,
    userName = 'You',
    assistantName = 'AI Assistant',
    height = '500px'
  } = props;

  const container = document.createElement('div');
  container.className = styles.chatContainer || 'chat-container';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    height: ${height};
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.className = styles.chatHeader || 'chat-header';
  header.style.cssText = `
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  const headerAvatar = document.createElement('div');
  headerAvatar.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
  `;
  headerAvatar.textContent = 'AI';

  const headerInfo = document.createElement('div');
  headerInfo.innerHTML = `
    <div style="font-weight: 600; color: #111827;">${assistantName}</div>
    <div style="font-size: 12px; color: #10b981; display: flex; align-items: center; gap: 4px;">
      <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
      Online
    </div>
  `;

  header.appendChild(headerAvatar);
  header.appendChild(headerInfo);
  container.appendChild(header);

  // Messages area
  const messagesArea = document.createElement('div');
  messagesArea.className = styles.messagesArea || 'messages-area';
  messagesArea.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;
  container.appendChild(messagesArea);

  // Render initial messages
  messages.forEach(msg => addMessage(msg));

  // Typing indicator
  let typingMessage = null;
  if (showTypingIndicator) {
    typingMessage = createChatMessage({
      sender: 'assistant',
      isTyping: true,
      avatar: assistantAvatar,
      name: assistantName
    });
    typingMessage.style.display = 'none';
    messagesArea.appendChild(typingMessage);
  }

  // Input
  const input = createChatInput({
    placeholder,
    suggestions,
    onSend: (message) => {
      addMessage({ content: message, sender: 'user' });
      if (onSend) onSend(message);
    }
  });
  container.appendChild(input);

  function addMessage(msg) {
    const messageEl = createChatMessage({
      content: msg.content,
      sender: msg.sender || 'user',
      timestamp: msg.timestamp || new Date(),
      avatar: msg.sender === 'user' ? userAvatar : assistantAvatar,
      name: msg.sender === 'user' ? userName : assistantName,
      actions: msg.actions,
      onCopy: () => {}
    });

    if (typingMessage) {
      messagesArea.insertBefore(messageEl, typingMessage);
    } else {
      messagesArea.appendChild(messageEl);
    }

    scrollToBottom();
  }

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // API
  container.addMessage = addMessage;
  container.setTyping = (isTyping) => {
    if (typingMessage) {
      typingMessage.style.display = isTyping ? 'flex' : 'none';
      if (isTyping) scrollToBottom();
    }
  };
  container.clear = () => {
    messagesArea.innerHTML = '';
    if (typingMessage) messagesArea.appendChild(typingMessage);
  };
  container.scrollToBottom = scrollToBottom;
  container.focus = () => input.focus();

  return container;
}

// ============================================================================
// AI Prompt Builder
// ============================================================================

export function createPromptBuilder(props = {}) {
  const {
    templates = [],
    variables = [], // [{ name, label, type, options }]
    onGenerate = null,
    showPreview = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.promptBuilder || 'prompt-builder';
  container.style.cssText = `
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  `;

  // Template selector
  if (templates.length > 0) {
    const templateSection = document.createElement('div');
    templateSection.style.cssText = 'padding: 16px; border-bottom: 1px solid #e5e7eb;';

    const templateLabel = document.createElement('label');
    templateLabel.style.cssText = 'display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px;';
    templateLabel.textContent = 'Template';
    templateSection.appendChild(templateLabel);

    const templateSelect = document.createElement('select');
    templateSelect.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    `;

    templates.forEach((template, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = template.name;
      templateSelect.appendChild(option);
    });

    templateSelect.addEventListener('change', updatePreview);
    templateSection.appendChild(templateSelect);
    container.appendChild(templateSection);
  }

  // Variables
  const variablesSection = document.createElement('div');
  variablesSection.style.cssText = 'padding: 16px; display: flex; flex-direction: column; gap: 12px;';

  const variableInputs = {};

  variables.forEach(variable => {
    const fieldWrapper = document.createElement('div');

    const label = document.createElement('label');
    label.style.cssText = 'display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px;';
    label.textContent = variable.label;
    fieldWrapper.appendChild(label);

    let input;

    if (variable.type === 'select' && variable.options) {
      input = document.createElement('select');
      input.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        background: white;
      `;

      variable.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
    } else if (variable.type === 'textarea') {
      input = document.createElement('textarea');
      input.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        min-height: 80px;
        resize: vertical;
        font-family: inherit;
      `;
      input.placeholder = variable.placeholder || '';
    } else {
      input = document.createElement('input');
      input.type = variable.type || 'text';
      input.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
      `;
      input.placeholder = variable.placeholder || '';
    }

    input.addEventListener('input', updatePreview);
    variableInputs[variable.name] = input;
    fieldWrapper.appendChild(input);
    variablesSection.appendChild(fieldWrapper);
  });

  container.appendChild(variablesSection);

  // Preview
  let previewEl = null;
  if (showPreview) {
    const previewSection = document.createElement('div');
    previewSection.style.cssText = 'padding: 16px; border-top: 1px solid #e5e7eb; background: #f9fafb;';

    const previewLabel = document.createElement('div');
    previewLabel.style.cssText = 'font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px;';
    previewLabel.textContent = 'Preview';
    previewSection.appendChild(previewLabel);

    previewEl = document.createElement('div');
    previewEl.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      min-height: 60px;
      white-space: pre-wrap;
    `;
    previewSection.appendChild(previewEl);
    container.appendChild(previewSection);
  }

  // Generate button
  const actionsSection = document.createElement('div');
  actionsSection.style.cssText = 'padding: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end;';

  const generateBtn = document.createElement('button');
  generateBtn.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  `;
  generateBtn.textContent = 'Generate';
  generateBtn.addEventListener('click', () => {
    const prompt = getPrompt();
    if (onGenerate) onGenerate(prompt);
  });
  generateBtn.addEventListener('mouseenter', () => generateBtn.style.background = '#2563eb');
  generateBtn.addEventListener('mouseleave', () => generateBtn.style.background = '#3b82f6');

  actionsSection.appendChild(generateBtn);
  container.appendChild(actionsSection);

  function getPrompt() {
    let template = templates.length > 0
      ? templates[container.querySelector('select')?.value || 0].template
      : '';

    for (const [name, input] of Object.entries(variableInputs)) {
      template = template.replace(new RegExp(`{{${name}}}`, 'g'), input.value || '');
    }

    return template;
  }

  function updatePreview() {
    if (previewEl) {
      previewEl.textContent = getPrompt();
    }
  }

  updatePreview();

  // API
  container.getPrompt = getPrompt;
  container.setVariable = (name, value) => {
    if (variableInputs[name]) {
      variableInputs[name].value = value;
      updatePreview();
    }
  };

  return container;
}

// ============================================================================
// AI Completion Dropdown
// ============================================================================

export function createAICompletion(props = {}) {
  const {
    input = null, // Target input element
    getSuggestions = null, // async (text) => string[]
    onSelect = null,
    debounceMs = 300,
    minChars = 2,
    maxSuggestions = 5
  } = props;

  const dropdown = document.createElement('div');
  dropdown.className = styles.aiCompletion || 'ai-completion';
  dropdown.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
  `;

  let debounceTimer = null;
  let selectedIndex = -1;
  let currentSuggestions = [];

  if (input) {
    // Position dropdown
    const updatePosition = () => {
      const rect = input.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
    };

    input.addEventListener('input', async (e) => {
      const text = e.target.value;

      if (text.length < minChars) {
        dropdown.style.display = 'none';
        return;
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (getSuggestions) {
          currentSuggestions = await getSuggestions(text);
          renderSuggestions(currentSuggestions.slice(0, maxSuggestions));
        }
      }, debounceMs);
    });

    input.addEventListener('keydown', (e) => {
      if (dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
        highlightSelected();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        highlightSelected();
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(currentSuggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.style.display = 'none', 200);
    });

    input.addEventListener('focus', updatePosition);
    window.addEventListener('resize', updatePosition);

    document.body.appendChild(dropdown);
  }

  function renderSuggestions(suggestions) {
    if (suggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = suggestions.map((suggestion, i) => `
      <div class="suggestion-item" data-index="${i}" style="
        padding: 10px 12px;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.15s;
      ">
        <span style="color: #8b5cf6;">✨</span>
        <span>${suggestion}</span>
      </div>
    `).join('');

    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        selectedIndex = parseInt(item.dataset.index);
        highlightSelected();
      });
      item.addEventListener('click', () => {
        selectSuggestion(suggestions[item.dataset.index]);
      });
    });

    dropdown.style.display = 'block';
    selectedIndex = -1;
  }

  function highlightSelected() {
    dropdown.querySelectorAll('.suggestion-item').forEach((item, i) => {
      item.style.background = i === selectedIndex ? '#f3f4f6' : 'white';
    });
  }

  function selectSuggestion(suggestion) {
    if (input) {
      input.value = suggestion;
      input.dispatchEvent(new Event('input'));
    }
    if (onSelect) onSelect(suggestion);
    dropdown.style.display = 'none';
  }

  // API
  dropdown.show = (suggestions) => {
    currentSuggestions = suggestions;
    renderSuggestions(suggestions.slice(0, maxSuggestions));
  };
  dropdown.hide = () => {
    dropdown.style.display = 'none';
  };
  dropdown.destroy = () => {
    dropdown.remove();
  };

  return dropdown;
}

// ============================================================================
// AI Response Stream
// ============================================================================

export function createStreamingResponse(props = {}) {
  const {
    onComplete = null,
    typingSpeed = 20, // ms per character
    showCursor = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.streamingResponse || 'streaming-response';
  container.style.cssText = `
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
  `;

  let isStreaming = false;
  let currentText = '';
  let targetText = '';
  let charIndex = 0;
  let streamInterval = null;

  // Cursor
  const cursor = document.createElement('span');
  cursor.className = styles.cursor || 'typing-cursor';
  cursor.style.cssText = `
    display: ${showCursor ? 'inline-block' : 'none'};
    width: 2px;
    height: 1em;
    background: #3b82f6;
    margin-left: 2px;
    animation: blink 1s infinite;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `;
  container.appendChild(style);

  function stream(text) {
    targetText = text;
    charIndex = 0;
    isStreaming = true;

    if (streamInterval) clearInterval(streamInterval);

    streamInterval = setInterval(() => {
      if (charIndex < targetText.length) {
        currentText = targetText.substring(0, charIndex + 1);
        render();
        charIndex++;
      } else {
        clearInterval(streamInterval);
        isStreaming = false;
        cursor.style.display = 'none';
        if (onComplete) onComplete(currentText);
      }
    }, typingSpeed);
  }

  function render() {
    const contentEl = container.querySelector('.content') || document.createElement('span');
    contentEl.className = 'content';
    contentEl.innerHTML = parseContent(currentText);

    if (!container.contains(contentEl)) {
      container.appendChild(contentEl);
      container.appendChild(cursor);
    }
  }

  // API
  container.stream = stream;
  container.append = (chunk) => {
    targetText += chunk;
    if (!isStreaming) stream(targetText);
  };
  container.stop = () => {
    if (streamInterval) clearInterval(streamInterval);
    isStreaming = false;
    currentText = targetText;
    render();
    cursor.style.display = 'none';
  };
  container.getText = () => currentText;
  container.isStreaming = () => isStreaming;

  return container;
}

// Export all
export default {
  createChatMessage,
  createChatInput,
  createChatContainer,
  createPromptBuilder,
  createAICompletion,
  createStreamingResponse
};
