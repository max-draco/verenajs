/**
 * verenajs Advanced Form Components
 * Rich text editor, color picker, date/time pickers, and more
 */

import styles from './styles.module.css';

// ============================================================================
// Rich Text Editor
// ============================================================================

export function createRichTextEditor(props = {}) {
  const {
    content = '',
    placeholder = 'Start typing...',
    toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'heading', 'quote', '|', 'bulletList', 'orderedList', '|', 'link', 'image', '|', 'code', 'codeBlock'],
    minHeight = 200,
    maxHeight = null,
    onChange = null,
    onFocus = null,
    onBlur = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.richTextEditor || 'rich-text-editor';
  container.style.cssText = `
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  `;

  // Toolbar
  const toolbarEl = document.createElement('div');
  toolbarEl.className = styles.toolbar || 'editor-toolbar';
  toolbarEl.style.cssText = `
    display: flex;
    gap: 2px;
    padding: 8px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-wrap: wrap;
  `;

  const toolbarButtons = {
    bold: { icon: 'B', command: 'bold', style: 'font-weight: bold;' },
    italic: { icon: 'I', command: 'italic', style: 'font-style: italic;' },
    underline: { icon: 'U', command: 'underline', style: 'text-decoration: underline;' },
    strikethrough: { icon: 'S', command: 'strikeThrough', style: 'text-decoration: line-through;' },
    heading: { icon: 'H', command: 'formatBlock', value: 'h2' },
    quote: { icon: '"', command: 'formatBlock', value: 'blockquote' },
    bulletList: { icon: '•', command: 'insertUnorderedList' },
    orderedList: { icon: '1.', command: 'insertOrderedList' },
    link: { icon: '🔗', command: 'createLink', prompt: true },
    image: { icon: '📷', command: 'insertImage', prompt: true },
    code: { icon: '<>', command: 'formatBlock', value: 'pre' },
    codeBlock: { icon: '{}', custom: 'codeBlock' }
  };

  toolbar.forEach(item => {
    if (item === '|') {
      const divider = document.createElement('div');
      divider.style.cssText = 'width: 1px; background: #d1d5db; margin: 0 4px;';
      toolbarEl.appendChild(divider);
      return;
    }

    const btnConfig = toolbarButtons[item];
    if (!btnConfig) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = `
      padding: 6px 10px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #374151;
      transition: all 0.2s;
      min-width: 32px;
      ${btnConfig.style || ''}
    `;
    btn.innerHTML = btnConfig.icon;
    btn.title = item.charAt(0).toUpperCase() + item.slice(1);

    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#e5e7eb';
      btn.style.borderColor = '#9ca3af';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'white';
      btn.style.borderColor = '#d1d5db';
    });

    btn.addEventListener('click', () => {
      if (btnConfig.prompt) {
        const value = prompt(item === 'link' ? 'Enter URL:' : 'Enter image URL:');
        if (value) document.execCommand(btnConfig.command, false, value);
      } else if (btnConfig.value) {
        document.execCommand(btnConfig.command, false, btnConfig.value);
      } else {
        document.execCommand(btnConfig.command, false, null);
      }
      editorEl.focus();
    });

    toolbarEl.appendChild(btn);
  });

  container.appendChild(toolbarEl);

  // Editor area
  const editorEl = document.createElement('div');
  editorEl.className = styles.editorContent || 'editor-content';
  editorEl.contentEditable = true;
  editorEl.innerHTML = content || `<p>${placeholder}</p>`;
  editorEl.style.cssText = `
    padding: 16px;
    min-height: ${minHeight}px;
    ${maxHeight ? `max-height: ${maxHeight}px; overflow-y: auto;` : ''}
    outline: none;
    line-height: 1.6;
    color: #111827;
  `;

  // Placeholder handling
  editorEl.addEventListener('focus', () => {
    if (editorEl.innerHTML === `<p>${placeholder}</p>`) {
      editorEl.innerHTML = '<p><br></p>';
    }
    if (onFocus) onFocus();
  });

  editorEl.addEventListener('blur', () => {
    if (editorEl.innerHTML === '<p><br></p>' || editorEl.innerHTML === '') {
      editorEl.innerHTML = `<p>${placeholder}</p>`;
    }
    if (onBlur) onBlur();
  });

  editorEl.addEventListener('input', () => {
    if (onChange) onChange(editorEl.innerHTML);
  });

  // Paste as plain text option
  editorEl.addEventListener('paste', (e) => {
    // Allow rich paste by default, could add plain text option
  });

  container.appendChild(editorEl);

  // API
  container.getContent = () => editorEl.innerHTML;
  container.setContent = (html) => { editorEl.innerHTML = html; };
  container.getText = () => editorEl.textContent;
  container.focus = () => editorEl.focus();
  container.insertHTML = (html) => {
    document.execCommand('insertHTML', false, html);
  };

  return container;
}

// ============================================================================
// Color Picker
// ============================================================================

export function createColorPicker(props = {}) {
  const {
    value = '#3b82f6',
    format = 'hex', // 'hex' | 'rgb' | 'hsl'
    presets = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#111827', '#6b7280'],
    showInput = true,
    showAlpha = false,
    onChange = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.colorPicker || 'color-picker';
  container.style.cssText = `
    width: 240px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;

  let currentColor = value;

  // Saturation/Brightness picker
  const satBrightPicker = document.createElement('div');
  satBrightPicker.style.cssText = `
    position: relative;
    width: 100%;
    height: 150px;
    border-radius: 8px;
    cursor: crosshair;
    background: linear-gradient(to right, white, hsl(${getHue(currentColor)}, 100%, 50%));
  `;

  const satBrightOverlay = document.createElement('div');
  satBrightOverlay.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, black, transparent);
    border-radius: 8px;
  `;
  satBrightPicker.appendChild(satBrightOverlay);

  const satBrightHandle = document.createElement('div');
  satBrightHandle.style.cssText = `
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0,0,0,0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
  `;
  satBrightPicker.appendChild(satBrightHandle);

  container.appendChild(satBrightPicker);

  // Hue slider
  const hueSlider = document.createElement('div');
  hueSlider.style.cssText = `
    position: relative;
    height: 16px;
    margin-top: 12px;
    border-radius: 8px;
    background: linear-gradient(to right,
      hsl(0, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(240, 100%, 50%),
      hsl(300, 100%, 50%),
      hsl(360, 100%, 50%)
    );
    cursor: pointer;
  `;

  const hueHandle = document.createElement('div');
  hueHandle.style.cssText = `
    position: absolute;
    top: 50%;
    width: 12px;
    height: 22px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transform: translate(-50%, -50%);
    pointer-events: none;
  `;
  hueSlider.appendChild(hueHandle);
  container.appendChild(hueSlider);

  // Alpha slider
  if (showAlpha) {
    const alphaSlider = document.createElement('div');
    alphaSlider.style.cssText = `
      position: relative;
      height: 16px;
      margin-top: 8px;
      border-radius: 8px;
      background: linear-gradient(to right, transparent, ${currentColor}),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill-opacity='.1'%3E%3Crect x='10' width='10' height='10' fill='%23000'/%3E%3Crect y='10' width='10' height='10' fill='%23000'/%3E%3C/svg%3E");
      cursor: pointer;
    `;
    container.appendChild(alphaSlider);
  }

  // Presets
  if (presets.length > 0) {
    const presetsEl = document.createElement('div');
    presetsEl.style.cssText = `
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    `;

    presets.forEach(color => {
      const preset = document.createElement('button');
      preset.type = 'button';
      preset.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: 2px solid ${color === currentColor ? '#3b82f6' : 'transparent'};
        background: ${color};
        cursor: pointer;
        transition: transform 0.2s;
      `;
      preset.addEventListener('click', () => setColor(color));
      preset.addEventListener('mouseenter', () => preset.style.transform = 'scale(1.1)');
      preset.addEventListener('mouseleave', () => preset.style.transform = 'scale(1)');
      presetsEl.appendChild(preset);
    });

    container.appendChild(presetsEl);
  }

  // Color input
  if (showInput) {
    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display: flex; gap: 8px; margin-top: 12px;';

    // Preview
    const preview = document.createElement('div');
    preview.style.cssText = `
      width: 40px;
      height: 36px;
      border-radius: 6px;
      background: ${currentColor};
      border: 1px solid #d1d5db;
    `;
    inputRow.appendChild(preview);

    // Input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentColor;
    input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: monospace;
    `;
    input.addEventListener('change', () => setColor(input.value));
    inputRow.appendChild(input);

    container.appendChild(inputRow);
  }

  function getHue(color) {
    // Simple extraction - in production use full color parsing
    return 210;
  }

  function setColor(color) {
    currentColor = color;
    updateUI();
    if (onChange) onChange(color);
  }

  function updateUI() {
    const preview = container.querySelector('div[style*="background:"]');
    if (preview) preview.style.background = currentColor;

    const input = container.querySelector('input');
    if (input) input.value = currentColor;
  }

  // Interactions
  let isDragging = false;

  satBrightPicker.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSatBright(e);
  });

  hueSlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateHue(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Update based on what's being dragged
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  function updateSatBright(e) {
    const rect = satBrightPicker.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    satBrightHandle.style.left = `${x * 100}%`;
    satBrightHandle.style.top = `${y * 100}%`;
  }

  function updateHue(e) {
    const rect = hueSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hueHandle.style.left = `${x * 100}%`;

    const hue = Math.round(x * 360);
    satBrightPicker.style.background = `linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`;
  }

  // API
  container.getValue = () => currentColor;
  container.setValue = setColor;

  return container;
}

// ============================================================================
// Date Picker
// ============================================================================

export function createDatePicker(props = {}) {
  const {
    value = null,
    min = null,
    max = null,
    format = 'YYYY-MM-DD',
    placeholder = 'Select date',
    showToday = true,
    disabledDates = [],
    locale = 'en-US',
    onChange = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.datePicker || 'date-picker';
  container.style.cssText = 'position: relative; display: inline-block;';

  let selectedDate = value ? new Date(value) : null;
  let viewDate = selectedDate || new Date();
  let isOpen = false;

  // Input
  const input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  input.placeholder = placeholder;
  input.value = selectedDate ? formatDate(selectedDate) : '';
  input.style.cssText = `
    padding: 10px 12px;
    padding-right: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    width: 200px;
    cursor: pointer;
    background: white;
  `;

  input.addEventListener('click', toggleCalendar);

  // Calendar icon
  const icon = document.createElement('span');
  icon.style.cssText = `
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #6b7280;
  `;
  icon.textContent = '📅';

  container.appendChild(input);
  container.appendChild(icon);

  // Calendar dropdown
  const calendar = document.createElement('div');
  calendar.className = styles.calendar || 'calendar-dropdown';
  calendar.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 16px;
    z-index: 1000;
    display: none;
    width: 300px;
  `;

  container.appendChild(calendar);

  function toggleCalendar() {
    isOpen = !isOpen;
    calendar.style.display = isOpen ? 'block' : 'none';
    if (isOpen) renderCalendar();
  }

  function renderCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    calendar.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <button type="button" class="prev-btn" style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          font-size: 18px;
          color: #6b7280;
        ">◀</button>
        <div style="font-weight: 600; color: #111827;">
          ${monthNames[month]} ${year}
        </div>
        <button type="button" class="next-btn" style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          font-size: 18px;
          color: #6b7280;
        ">▶</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px;">
        ${dayNames.map(d => `
          <div style="text-align: center; font-size: 12px; color: #6b7280; padding: 4px;">
            ${d}
          </div>
        `).join('')}
      </div>

      <div class="days-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
      </div>

      ${showToday ? `
        <button type="button" class="today-btn" style="
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #3b82f6;
        ">Today</button>
      ` : ''}
    `;

    // Add days
    const daysGrid = calendar.querySelector('.days-grid');
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = createDayButton(prevMonthDays - i, true);
      daysGrid.appendChild(day);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = isDateDisabled(date);

      const day = createDayButton(i, false, isToday, isSelected, isDisabled);
      day.addEventListener('click', () => {
        if (!isDisabled) selectDate(date);
      });
      daysGrid.appendChild(day);
    }

    // Next month days
    const remainingDays = 42 - daysGrid.children.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = createDayButton(i, true);
      daysGrid.appendChild(day);
    }

    // Event listeners
    calendar.querySelector('.prev-btn').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCalendar();
    });

    calendar.querySelector('.next-btn').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCalendar();
    });

    const todayBtn = calendar.querySelector('.today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => selectDate(new Date()));
    }
  }

  function createDayButton(day, isOtherMonth, isToday = false, isSelected = false, isDisabled = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;
    btn.style.cssText = `
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: ${isDisabled || isOtherMonth ? 'default' : 'pointer'};
      font-size: 14px;
      transition: all 0.2s;
      ${isOtherMonth ? 'color: #d1d5db;' : isDisabled ? 'color: #9ca3af;' : 'color: #111827;'}
      ${isSelected ? 'background: #3b82f6; color: white;' :
        isToday ? 'background: #dbeafe; color: #3b82f6;' :
        'background: transparent;'}
    `;

    if (!isOtherMonth && !isDisabled && !isSelected) {
      btn.addEventListener('mouseenter', () => btn.style.background = '#f3f4f6');
      btn.addEventListener('mouseleave', () => btn.style.background = isToday ? '#dbeafe' : 'transparent');
    }

    return btn;
  }

  function selectDate(date) {
    selectedDate = date;
    viewDate = new Date(date);
    input.value = formatDate(date);
    toggleCalendar();
    if (onChange) onChange(date);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
  }

  function isDateDisabled(date) {
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    if (disabledDates.some(d => new Date(d).toDateString() === date.toDateString())) return true;
    return false;
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && isOpen) {
      toggleCalendar();
    }
  });

  // API
  container.getValue = () => selectedDate;
  container.setValue = (date) => {
    selectedDate = date ? new Date(date) : null;
    input.value = selectedDate ? formatDate(selectedDate) : '';
  };
  container.open = () => { if (!isOpen) toggleCalendar(); };
  container.close = () => { if (isOpen) toggleCalendar(); };

  return container;
}

// ============================================================================
// Time Picker
// ============================================================================

export function createTimePicker(props = {}) {
  const {
    value = null,
    format = '24h', // '12h' | '24h'
    step = 15, // minutes
    min = null,
    max = null,
    placeholder = 'Select time',
    onChange = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.timePicker || 'time-picker';
  container.style.cssText = 'position: relative; display: inline-block;';

  let selectedTime = value;
  let isOpen = false;

  // Input
  const input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  input.placeholder = placeholder;
  input.value = selectedTime || '';
  input.style.cssText = `
    padding: 10px 12px;
    padding-right: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    width: 140px;
    cursor: pointer;
    background: white;
  `;

  input.addEventListener('click', toggleDropdown);

  // Clock icon
  const icon = document.createElement('span');
  icon.style.cssText = `
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #6b7280;
  `;
  icon.textContent = '🕐';

  container.appendChild(input);
  container.appendChild(icon);

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    display: none;
    max-height: 240px;
    overflow-y: auto;
  `;

  // Generate time options
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const hour = format === '12h' ? (h % 12 || 12) : h;
      const period = format === '12h' ? (h < 12 ? 'AM' : 'PM') : '';
      const timeStr = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}${period ? ' ' + period : ''}`;

      const option = document.createElement('div');
      option.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
        transition: background 0.2s;
      `;
      option.textContent = timeStr;

      option.addEventListener('mouseenter', () => option.style.background = '#f3f4f6');
      option.addEventListener('mouseleave', () => option.style.background = 'transparent');
      option.addEventListener('click', () => {
        selectedTime = timeStr;
        input.value = timeStr;
        toggleDropdown();
        if (onChange) onChange(timeStr);
      });

      dropdown.appendChild(option);
    }
  }

  container.appendChild(dropdown);

  function toggleDropdown() {
    isOpen = !isOpen;
    dropdown.style.display = isOpen ? 'block' : 'none';
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && isOpen) {
      toggleDropdown();
    }
  });

  // API
  container.getValue = () => selectedTime;
  container.setValue = (time) => {
    selectedTime = time;
    input.value = time || '';
  };

  return container;
}

// ============================================================================
// Tags Input
// ============================================================================

export function createTagsInput(props = {}) {
  const {
    value = [],
    placeholder = 'Add tag...',
    maxTags = null,
    allowDuplicates = false,
    suggestions = [],
    onChange = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.tagsInput || 'tags-input';
  container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    min-height: 42px;
    cursor: text;
  `;

  let tags = [...value];

  function render() {
    container.innerHTML = '';

    tags.forEach((tag, index) => {
      const tagEl = document.createElement('span');
      tagEl.className = styles.tag || 'tag';
      tagEl.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: #dbeafe;
        color: #1e40af;
        border-radius: 4px;
        font-size: 13px;
      `;

      tagEl.innerHTML = `
        <span>${tag}</span>
        <button type="button" style="
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          line-height: 1;
        ">×</button>
      `;

      tagEl.querySelector('button').addEventListener('click', () => removeTag(index));
      container.appendChild(tagEl);
    });

    // Input
    if (!maxTags || tags.length < maxTags) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = tags.length === 0 ? placeholder : '';
      input.style.cssText = `
        flex: 1;
        min-width: 100px;
        border: none;
        outline: none;
        font-size: 14px;
        padding: 4px;
      `;

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          e.preventDefault();
          addTag(input.value.trim());
          input.value = '';
        } else if (e.key === 'Backspace' && !input.value && tags.length > 0) {
          removeTag(tags.length - 1);
        }
      });

      container.appendChild(input);
    }
  }

  function addTag(tag) {
    if (!allowDuplicates && tags.includes(tag)) return;
    if (maxTags && tags.length >= maxTags) return;

    tags.push(tag);
    render();
    if (onChange) onChange([...tags]);
  }

  function removeTag(index) {
    tags.splice(index, 1);
    render();
    if (onChange) onChange([...tags]);
  }

  container.addEventListener('click', () => {
    const input = container.querySelector('input');
    if (input) input.focus();
  });

  render();

  // API
  container.getValue = () => [...tags];
  container.setValue = (newTags) => {
    tags = [...newTags];
    render();
  };
  container.addTag = addTag;
  container.removeTag = removeTag;
  container.clear = () => {
    tags = [];
    render();
    if (onChange) onChange([]);
  };

  return container;
}

// ============================================================================
// Slider / Range
// ============================================================================

export function createSlider(props = {}) {
  const {
    value = 50,
    min = 0,
    max = 100,
    step = 1,
    label = null,
    showValue = true,
    showMinMax = false,
    marks = [], // [{ value: 25, label: '25%' }]
    range = false, // dual handle
    disabled = false,
    onChange = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.slider || 'slider';
  container.style.cssText = 'width: 100%;';

  // Label
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px;';
    labelEl.innerHTML = `
      <span style="font-size: 14px; font-weight: 500; color: #374151;">${label}</span>
      ${showValue ? `<span class="value-display" style="font-size: 14px; color: #6b7280;">${value}</span>` : ''}
    `;
    container.appendChild(labelEl);
  }

  // Track container
  const trackContainer = document.createElement('div');
  trackContainer.style.cssText = `
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  `;

  // Min/Max labels
  if (showMinMax) {
    const minLabel = document.createElement('span');
    minLabel.style.cssText = 'font-size: 12px; color: #9ca3af; margin-right: 8px;';
    minLabel.textContent = min;
    trackContainer.appendChild(minLabel);
  }

  // Track
  const track = document.createElement('div');
  track.style.cssText = `
    flex: 1;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    position: relative;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
  `;

  // Fill
  const fill = document.createElement('div');
  const percent = ((value - min) / (max - min)) * 100;
  fill.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: ${disabled ? '#9ca3af' : '#3b82f6'};
    border-radius: 3px;
    width: ${percent}%;
    transition: width 0.1s;
  `;
  track.appendChild(fill);

  // Handle
  const handle = document.createElement('div');
  handle.style.cssText = `
    position: absolute;
    top: 50%;
    width: 18px;
    height: 18px;
    background: white;
    border: 2px solid ${disabled ? '#9ca3af' : '#3b82f6'};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: ${disabled ? 'not-allowed' : 'grab'};
    left: ${percent}%;
    transition: left 0.1s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  `;
  track.appendChild(handle);

  trackContainer.appendChild(track);

  if (showMinMax) {
    const maxLabel = document.createElement('span');
    maxLabel.style.cssText = 'font-size: 12px; color: #9ca3af; margin-left: 8px;';
    maxLabel.textContent = max;
    trackContainer.appendChild(maxLabel);
  }

  container.appendChild(trackContainer);

  // Marks
  if (marks.length > 0) {
    const marksEl = document.createElement('div');
    marksEl.style.cssText = 'position: relative; height: 20px; margin-top: 4px;';

    marks.forEach(mark => {
      const markPercent = ((mark.value - min) / (max - min)) * 100;
      const markEl = document.createElement('span');
      markEl.style.cssText = `
        position: absolute;
        left: ${markPercent}%;
        transform: translateX(-50%);
        font-size: 11px;
        color: #6b7280;
      `;
      markEl.textContent = mark.label;
      marksEl.appendChild(markEl);
    });

    container.appendChild(marksEl);
  }

  let currentValue = value;
  let isDragging = false;

  function updateValue(newValue) {
    currentValue = Math.max(min, Math.min(max, newValue));
    currentValue = Math.round(currentValue / step) * step;

    const percent = ((currentValue - min) / (max - min)) * 100;
    fill.style.width = `${percent}%`;
    handle.style.left = `${percent}%`;

    const valueDisplay = container.querySelector('.value-display');
    if (valueDisplay) valueDisplay.textContent = currentValue;

    if (onChange) onChange(currentValue);
  }

  function handleInteraction(e) {
    if (disabled) return;

    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percent * (max - min);
    updateValue(newValue);
  }

  track.addEventListener('click', handleInteraction);

  handle.addEventListener('mousedown', (e) => {
    if (disabled) return;
    isDragging = true;
    handle.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) handleInteraction(e);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    handle.style.cursor = 'grab';
  });

  // API
  container.getValue = () => currentValue;
  container.setValue = updateValue;

  return container;
}

// Export all
export default {
  createRichTextEditor,
  createColorPicker,
  createDatePicker,
  createTimePicker,
  createTagsInput,
  createSlider
};
