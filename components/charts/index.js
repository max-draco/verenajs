/**
 * verenajs Charts & Data Visualization Components
 * Production-ready chart components with canvas rendering
 */

import styles from './styles.module.css';

// ============================================================================
// Chart Base Class
// ============================================================================

class ChartBase {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 600,
      height: options.height || 400,
      padding: options.padding || { top: 20, right: 20, bottom: 40, left: 50 },
      backgroundColor: options.backgroundColor || '#ffffff',
      gridColor: options.gridColor || '#e5e7eb',
      textColor: options.textColor || '#374151',
      fontFamily: options.fontFamily || 'Inter, system-ui, sans-serif',
      fontSize: options.fontSize || 12,
      animate: options.animate !== false,
      animationDuration: options.animationDuration || 500,
      responsive: options.responsive !== false,
      ...options
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.data = [];
    this.animationFrame = null;

    this.setupCanvas();
    if (this.options.responsive) {
      this.setupResponsive();
    }
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.options.width * dpr;
    this.canvas.height = this.options.height * dpr;
    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;
    this.ctx.scale(dpr, dpr);
    this.container.appendChild(this.canvas);
  }

  setupResponsive() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          this.resize(width, this.options.height);
        }
      }
    });
    resizeObserver.observe(this.container);
  }

  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  clear() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
  }

  drawGrid(xLabels = [], yMin = 0, yMax = 100, ySteps = 5) {
    const { padding, width, height, gridColor, textColor, fontFamily, fontSize } = this.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = textColor;

    // Y-axis grid lines and labels
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      const value = yMax - ((yMax - yMin) / ySteps) * i;

      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();

      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.formatValue(value), padding.left - 10, y);
    }

    // X-axis labels
    if (xLabels.length > 0) {
      const step = chartWidth / (xLabels.length - 1 || 1);
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      xLabels.forEach((label, i) => {
        const x = padding.left + step * i;
        this.ctx.fillText(String(label), x, height - padding.bottom + 10);
      });
    }
  }

  formatValue(value) {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }

  animate(drawFn, duration = this.options.animationDuration) {
    if (!this.options.animate) {
      drawFn(1);
      return;
    }

    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutCubic(progress);

      this.clear();
      drawFn(eased);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };

    this.animationFrame = requestAnimationFrame(step);
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.canvas.remove();
  }

  render() {
    // Override in subclasses
  }
}

// ============================================================================
// Line Chart
// ============================================================================

export function createLineChart(props = {}) {
  const {
    data = [],
    labels = [],
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    showPoints = true,
    pointRadius = 4,
    lineWidth = 2,
    fill = false,
    fillOpacity = 0.1,
    showLegend = true,
    legendPosition = 'top',
    tooltip = true,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';
  container.style.cssText = 'position: relative;';

  const chart = new ChartBase(container, chartOptions);
  let datasets = Array.isArray(data[0]) ? data : [data];
  let currentLabels = labels;

  // Tooltip element
  let tooltipEl = null;
  if (tooltip) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = styles.tooltip || 'chart-tooltip';
    tooltipEl.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 100;
    `;
    container.appendChild(tooltipEl);
  }

  function getDataRange() {
    let min = Infinity, max = -Infinity;
    datasets.forEach(dataset => {
      dataset.forEach(value => {
        if (value < min) min = value;
        if (value > max) max = value;
      });
    });
    const padding = (max - min) * 0.1 || 10;
    return { min: min - padding, max: max + padding };
  }

  function render(progress = 1) {
    chart.clear();

    const { padding, width, height } = chart.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const { min, max } = getDataRange();

    chart.drawGrid(currentLabels, min, max);

    datasets.forEach((dataset, datasetIndex) => {
      const color = colors[datasetIndex % colors.length];
      const points = [];

      // Calculate points
      dataset.forEach((value, i) => {
        const x = padding.left + (chartWidth / (dataset.length - 1 || 1)) * i;
        const y = padding.top + chartHeight - ((value - min) / (max - min)) * chartHeight * progress;
        points.push({ x, y, value });
      });

      // Draw fill
      if (fill) {
        chart.ctx.beginPath();
        chart.ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => chart.ctx.lineTo(p.x, p.y));
        chart.ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        chart.ctx.closePath();
        chart.ctx.fillStyle = color + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
        chart.ctx.fill();
      }

      // Draw line
      chart.ctx.beginPath();
      chart.ctx.strokeStyle = color;
      chart.ctx.lineWidth = lineWidth;
      chart.ctx.lineJoin = 'round';
      chart.ctx.lineCap = 'round';

      points.forEach((p, i) => {
        if (i === 0) chart.ctx.moveTo(p.x, p.y);
        else chart.ctx.lineTo(p.x, p.y);
      });
      chart.ctx.stroke();

      // Draw points
      if (showPoints) {
        points.forEach(p => {
          chart.ctx.beginPath();
          chart.ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
          chart.ctx.fillStyle = '#ffffff';
          chart.ctx.fill();
          chart.ctx.strokeStyle = color;
          chart.ctx.lineWidth = 2;
          chart.ctx.stroke();
        });
      }
    });
  }

  // Mouse interaction for tooltip
  if (tooltip) {
    chart.canvas.addEventListener('mousemove', (e) => {
      const rect = chart.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { padding, width } = chart.options;
      const chartWidth = width - padding.left - padding.right;
      const { min, max } = getDataRange();

      // Find closest point
      let closestPoint = null;
      let closestDist = Infinity;
      let datasetIdx = 0;

      datasets.forEach((dataset, di) => {
        dataset.forEach((value, i) => {
          const px = padding.left + (chartWidth / (dataset.length - 1 || 1)) * i;
          const py = padding.top + (chart.options.height - padding.top - padding.bottom) -
                    ((value - min) / (max - min)) * (chart.options.height - padding.top - padding.bottom);
          const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

          if (dist < closestDist && dist < 30) {
            closestDist = dist;
            closestPoint = { x: px, y: py, value, index: i };
            datasetIdx = di;
          }
        });
      });

      if (closestPoint) {
        tooltipEl.innerHTML = `
          <div style="font-weight: 600">${currentLabels[closestPoint.index] || `Point ${closestPoint.index + 1}`}</div>
          <div style="color: ${colors[datasetIdx]}">${closestPoint.value.toLocaleString()}</div>
        `;
        tooltipEl.style.left = `${closestPoint.x + 10}px`;
        tooltipEl.style.top = `${closestPoint.y - 10}px`;
        tooltipEl.style.opacity = '1';
      } else {
        tooltipEl.style.opacity = '0';
      }
    });

    chart.canvas.addEventListener('mouseleave', () => {
      tooltipEl.style.opacity = '0';
    });
  }

  chart.animate(render);

  // API
  container.setData = (newData, newLabels) => {
    datasets = Array.isArray(newData[0]) ? newData : [newData];
    if (newLabels) currentLabels = newLabels;
    chart.animate(render);
  };

  container.addPoint = (datasetIndex, value, label) => {
    if (datasets[datasetIndex]) {
      datasets[datasetIndex].push(value);
      if (label) currentLabels.push(label);
      render(1);
    }
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Bar Chart
// ============================================================================

export function createBarChart(props = {}) {
  const {
    data = [],
    labels = [],
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    barWidth = 0.8,
    grouped = false,
    stacked = false,
    horizontal = false,
    showValues = true,
    borderRadius = 4,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';
  container.style.cssText = 'position: relative;';

  const chart = new ChartBase(container, chartOptions);
  let datasets = Array.isArray(data[0]) ? data : [data];
  let currentLabels = labels;

  function getDataRange() {
    let min = 0, max = -Infinity;

    if (stacked) {
      // For stacked, sum values at each index
      const sums = [];
      datasets[0].forEach((_, i) => {
        let sum = 0;
        datasets.forEach(dataset => {
          sum += dataset[i] || 0;
        });
        sums.push(sum);
      });
      max = Math.max(...sums);
    } else {
      datasets.forEach(dataset => {
        dataset.forEach(value => {
          if (value > max) max = value;
          if (value < min) min = value;
        });
      });
    }

    return { min: Math.min(0, min), max: max * 1.1 };
  }

  function render(progress = 1) {
    chart.clear();

    const { padding, width, height, textColor, fontFamily, fontSize } = chart.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const { min, max } = getDataRange();

    chart.drawGrid(currentLabels, min, max);

    const numBars = datasets[0].length;
    const groupWidth = chartWidth / numBars;
    const actualBarWidth = groupWidth * barWidth;

    if (grouped) {
      const singleBarWidth = actualBarWidth / datasets.length;

      datasets.forEach((dataset, di) => {
        const color = colors[di % colors.length];

        dataset.forEach((value, i) => {
          const x = padding.left + groupWidth * i + (groupWidth - actualBarWidth) / 2 + singleBarWidth * di;
          const barHeight = ((value - min) / (max - min)) * chartHeight * progress;
          const y = padding.top + chartHeight - barHeight;

          drawRoundedRect(chart.ctx, x, y, singleBarWidth - 2, barHeight, borderRadius, color);

          if (showValues && progress === 1) {
            chart.ctx.fillStyle = textColor;
            chart.ctx.font = `${fontSize - 2}px ${fontFamily}`;
            chart.ctx.textAlign = 'center';
            chart.ctx.fillText(chart.formatValue(value), x + singleBarWidth / 2, y - 5);
          }
        });
      });
    } else if (stacked) {
      datasets[0].forEach((_, i) => {
        let currentY = padding.top + chartHeight;

        datasets.forEach((dataset, di) => {
          const value = dataset[i] || 0;
          const color = colors[di % colors.length];
          const barHeight = ((value) / (max - min)) * chartHeight * progress;
          const x = padding.left + groupWidth * i + (groupWidth - actualBarWidth) / 2;

          currentY -= barHeight;
          drawRoundedRect(chart.ctx, x, currentY, actualBarWidth, barHeight,
            di === datasets.length - 1 ? borderRadius : 0, color);
        });
      });
    } else {
      const color = colors[0];

      datasets[0].forEach((value, i) => {
        const x = padding.left + groupWidth * i + (groupWidth - actualBarWidth) / 2;
        const barHeight = ((value - min) / (max - min)) * chartHeight * progress;
        const y = padding.top + chartHeight - barHeight;

        drawRoundedRect(chart.ctx, x, y, actualBarWidth, barHeight, borderRadius, color);

        if (showValues && progress === 1) {
          chart.ctx.fillStyle = textColor;
          chart.ctx.font = `${fontSize - 2}px ${fontFamily}`;
          chart.ctx.textAlign = 'center';
          chart.ctx.fillText(chart.formatValue(value), x + actualBarWidth / 2, y - 5);
        }
      });
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius, color) {
    if (height <= 0) return;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  chart.animate(render);

  container.setData = (newData, newLabels) => {
    datasets = Array.isArray(newData[0]) ? newData : [newData];
    if (newLabels) currentLabels = newLabels;
    chart.animate(render);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Pie Chart
// ============================================================================

export function createPieChart(props = {}) {
  const {
    data = [],
    labels = [],
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    donut = false,
    donutWidth = 60,
    showLabels = true,
    showPercentages = true,
    showLegend = true,
    legendPosition = 'right',
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';
  container.style.cssText = 'position: relative; display: flex; align-items: center;';

  if (legendPosition === 'right' || legendPosition === 'left') {
    container.style.flexDirection = legendPosition === 'left' ? 'row-reverse' : 'row';
  } else {
    container.style.flexDirection = legendPosition === 'top' ? 'column-reverse' : 'column';
  }

  const chartWrapper = document.createElement('div');
  const chart = new ChartBase(chartWrapper, { ...chartOptions, width: chartOptions.width || 300, height: chartOptions.height || 300 });
  container.appendChild(chartWrapper);

  let currentData = [...data];
  let currentLabels = [...labels];

  // Legend
  let legend = null;
  if (showLegend) {
    legend = document.createElement('div');
    legend.className = styles.legend || 'chart-legend';
    legend.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      font-size: 13px;
    `;
    container.appendChild(legend);
    updateLegend();
  }

  function updateLegend() {
    if (!legend) return;
    const total = currentData.reduce((a, b) => a + b, 0);

    legend.innerHTML = currentData.map((value, i) => `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 12px; height: 12px; border-radius: 2px; background: ${colors[i % colors.length]}"></div>
        <span style="color: #374151;">${currentLabels[i] || `Item ${i + 1}`}</span>
        <span style="color: #6b7280; margin-left: auto;">${showPercentages ? `${((value / total) * 100).toFixed(1)}%` : value}</span>
      </div>
    `).join('');
  }

  function render(progress = 1) {
    chart.clear();

    const { width, height } = chart.options;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const total = currentData.reduce((a, b) => a + b, 0);

    let startAngle = -Math.PI / 2;

    currentData.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2 * progress;
      const color = colors[i % colors.length];

      chart.ctx.beginPath();
      chart.ctx.moveTo(centerX, centerY);
      chart.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      chart.ctx.closePath();
      chart.ctx.fillStyle = color;
      chart.ctx.fill();

      // Label
      if (showLabels && progress === 1 && sliceAngle > 0.2) {
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        chart.ctx.fillStyle = '#ffffff';
        chart.ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        chart.ctx.textAlign = 'center';
        chart.ctx.textBaseline = 'middle';

        if (showPercentages) {
          chart.ctx.fillText(`${((value / total) * 100).toFixed(0)}%`, labelX, labelY);
        }
      }

      startAngle += sliceAngle;
    });

    // Donut hole
    if (donut) {
      chart.ctx.beginPath();
      chart.ctx.arc(centerX, centerY, radius - donutWidth, 0, Math.PI * 2);
      chart.ctx.fillStyle = chart.options.backgroundColor;
      chart.ctx.fill();
    }
  }

  chart.animate(render);

  container.setData = (newData, newLabels) => {
    currentData = [...newData];
    if (newLabels) currentLabels = [...newLabels];
    updateLegend();
    chart.animate(render);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Area Chart
// ============================================================================

export function createAreaChart(props = {}) {
  return createLineChart({
    ...props,
    fill: true,
    fillOpacity: props.fillOpacity || 0.3,
    showPoints: props.showPoints !== undefined ? props.showPoints : false
  });
}

// ============================================================================
// Candlestick Chart (Financial)
// ============================================================================

export function createCandlestickChart(props = {}) {
  const {
    data = [], // [{ open, high, low, close, timestamp }]
    upColor = '#10b981',
    downColor = '#ef4444',
    wickWidth = 1,
    showVolume = false,
    volumeHeight = 0.2,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';
  container.style.cssText = 'position: relative;';

  const chart = new ChartBase(container, chartOptions);
  let currentData = [...data];

  // Tooltip
  const tooltipEl = document.createElement('div');
  tooltipEl.style.cssText = `
    position: absolute;
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
    min-width: 140px;
  `;
  container.appendChild(tooltipEl);

  function getDataRange() {
    let min = Infinity, max = -Infinity;
    currentData.forEach(candle => {
      if (candle.low < min) min = candle.low;
      if (candle.high > max) max = candle.high;
    });
    const padding = (max - min) * 0.1;
    return { min: min - padding, max: max + padding };
  }

  function render(progress = 1) {
    chart.clear();

    const { padding, width, height } = chart.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const { min, max } = getDataRange();

    // Draw price grid
    chart.drawGrid([], min, max, 6);

    const candleWidth = chartWidth / currentData.length;
    const bodyWidth = candleWidth * 0.7;

    currentData.forEach((candle, i) => {
      const x = padding.left + candleWidth * i + candleWidth / 2;
      const isUp = candle.close >= candle.open;
      const color = isUp ? upColor : downColor;

      const openY = padding.top + chartHeight - ((candle.open - min) / (max - min)) * chartHeight * progress;
      const closeY = padding.top + chartHeight - ((candle.close - min) / (max - min)) * chartHeight * progress;
      const highY = padding.top + chartHeight - ((candle.high - min) / (max - min)) * chartHeight * progress;
      const lowY = padding.top + chartHeight - ((candle.low - min) / (max - min)) * chartHeight * progress;

      // Wick
      chart.ctx.strokeStyle = color;
      chart.ctx.lineWidth = wickWidth;
      chart.ctx.beginPath();
      chart.ctx.moveTo(x, highY);
      chart.ctx.lineTo(x, lowY);
      chart.ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;

      chart.ctx.fillStyle = color;
      chart.ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });
  }

  // Mouse interaction
  chart.canvas.addEventListener('mousemove', (e) => {
    const rect = chart.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const { padding, width } = chart.options;
    const chartWidth = width - padding.left - padding.right;
    const candleWidth = chartWidth / currentData.length;

    const index = Math.floor((x - padding.left) / candleWidth);

    if (index >= 0 && index < currentData.length) {
      const candle = currentData[index];
      const isUp = candle.close >= candle.open;
      const change = ((candle.close - candle.open) / candle.open * 100).toFixed(2);

      tooltipEl.innerHTML = `
        <div style="margin-bottom: 6px; color: #9ca3af;">${new Date(candle.timestamp).toLocaleDateString()}</div>
        <div>O: <span style="color: ${isUp ? upColor : downColor}">${candle.open.toFixed(2)}</span></div>
        <div>H: ${candle.high.toFixed(2)}</div>
        <div>L: ${candle.low.toFixed(2)}</div>
        <div>C: <span style="color: ${isUp ? upColor : downColor}">${candle.close.toFixed(2)}</span></div>
        <div style="margin-top: 6px; color: ${isUp ? upColor : downColor}">${isUp ? '+' : ''}${change}%</div>
      `;
      tooltipEl.style.left = `${x + 15}px`;
      tooltipEl.style.top = `${e.clientY - rect.top - 50}px`;
      tooltipEl.style.opacity = '1';
    }
  });

  chart.canvas.addEventListener('mouseleave', () => {
    tooltipEl.style.opacity = '0';
  });

  chart.animate(render);

  container.setData = (newData) => {
    currentData = [...newData];
    chart.animate(render);
  };

  container.addCandle = (candle) => {
    currentData.push(candle);
    render(1);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Gauge Chart
// ============================================================================

export function createGaugeChart(props = {}) {
  const {
    value = 0,
    min = 0,
    max = 100,
    label = '',
    unit = '',
    colors = [
      { threshold: 30, color: '#ef4444' },
      { threshold: 70, color: '#f59e0b' },
      { threshold: 100, color: '#10b981' }
    ],
    arcWidth = 20,
    showValue = true,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';
  container.style.cssText = 'position: relative;';

  const size = chartOptions.width || 200;
  const chart = new ChartBase(container, { ...chartOptions, width: size, height: size });

  let currentValue = value;

  function getColor(val) {
    const percentage = ((val - min) / (max - min)) * 100;
    for (const { threshold, color } of colors) {
      if (percentage <= threshold) return color;
    }
    return colors[colors.length - 1].color;
  }

  function render(progress = 1) {
    chart.clear();

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - arcWidth - 10;

    // Background arc
    chart.ctx.beginPath();
    chart.ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25);
    chart.ctx.strokeStyle = '#e5e7eb';
    chart.ctx.lineWidth = arcWidth;
    chart.ctx.lineCap = 'round';
    chart.ctx.stroke();

    // Value arc
    const percentage = Math.max(0, Math.min(1, (currentValue - min) / (max - min)));
    const endAngle = Math.PI * 0.75 + (Math.PI * 1.5 * percentage * progress);

    chart.ctx.beginPath();
    chart.ctx.arc(centerX, centerY, radius, Math.PI * 0.75, endAngle);
    chart.ctx.strokeStyle = getColor(currentValue);
    chart.ctx.lineWidth = arcWidth;
    chart.ctx.lineCap = 'round';
    chart.ctx.stroke();

    // Value text
    if (showValue) {
      const displayValue = (currentValue * progress).toFixed(0);
      chart.ctx.fillStyle = '#111827';
      chart.ctx.font = `bold ${size / 5}px Inter, system-ui, sans-serif`;
      chart.ctx.textAlign = 'center';
      chart.ctx.textBaseline = 'middle';
      chart.ctx.fillText(`${displayValue}${unit}`, centerX, centerY);

      if (label) {
        chart.ctx.fillStyle = '#6b7280';
        chart.ctx.font = `${size / 12}px Inter, system-ui, sans-serif`;
        chart.ctx.fillText(label, centerX, centerY + size / 6);
      }
    }
  }

  chart.animate(render);

  container.setValue = (newValue) => {
    currentValue = newValue;
    chart.animate(render);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Radar Chart
// ============================================================================

export function createRadarChart(props = {}) {
  const {
    data = [],
    labels = [],
    colors = ['rgba(59, 130, 246, 0.5)', 'rgba(239, 68, 68, 0.5)'],
    borderColors = ['#3b82f6', '#ef4444'],
    max = 100,
    showLabels = true,
    showValues = false,
    levels = 5,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';

  const size = chartOptions.width || 400;
  const chart = new ChartBase(container, { ...chartOptions, width: size, height: size });

  let datasets = Array.isArray(data[0]) ? data : [data];
  let currentLabels = [...labels];

  function render(progress = 1) {
    chart.clear();

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 60;
    const numPoints = currentLabels.length || datasets[0].length;
    const angleStep = (Math.PI * 2) / numPoints;

    // Draw grid
    chart.ctx.strokeStyle = '#e5e7eb';
    chart.ctx.lineWidth = 1;

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;

      chart.ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;

        if (i === 0) chart.ctx.moveTo(x, y);
        else chart.ctx.lineTo(x, y);
      }
      chart.ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      chart.ctx.beginPath();
      chart.ctx.moveTo(centerX, centerY);
      chart.ctx.lineTo(x, y);
      chart.ctx.stroke();

      // Labels
      if (showLabels && currentLabels[i]) {
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);

        chart.ctx.fillStyle = '#374151';
        chart.ctx.font = '12px Inter, system-ui, sans-serif';
        chart.ctx.textAlign = 'center';
        chart.ctx.textBaseline = 'middle';
        chart.ctx.fillText(currentLabels[i], labelX, labelY);
      }
    }

    // Draw data
    datasets.forEach((dataset, di) => {
      chart.ctx.beginPath();

      dataset.forEach((value, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (value / max) * radius * progress;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) chart.ctx.moveTo(x, y);
        else chart.ctx.lineTo(x, y);
      });

      chart.ctx.closePath();
      chart.ctx.fillStyle = colors[di % colors.length];
      chart.ctx.fill();
      chart.ctx.strokeStyle = borderColors[di % borderColors.length];
      chart.ctx.lineWidth = 2;
      chart.ctx.stroke();
    });
  }

  chart.animate(render);

  container.setData = (newData, newLabels) => {
    datasets = Array.isArray(newData[0]) ? newData : [newData];
    if (newLabels) currentLabels = [...newLabels];
    chart.animate(render);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Heatmap
// ============================================================================

export function createHeatmap(props = {}) {
  const {
    data = [], // 2D array
    xLabels = [],
    yLabels = [],
    colorScale = ['#dbeafe', '#3b82f6', '#1e3a8a'],
    cellSize = 30,
    showValues = true,
    ...chartOptions
  } = props;

  const container = document.createElement('div');
  container.className = styles.chartContainer || 'chart-container';

  let currentData = data.map(row => [...row]);

  const labelPadding = 60;
  const width = (chartOptions.width || (currentData[0]?.length || 1) * cellSize) + labelPadding;
  const height = (chartOptions.height || (currentData.length || 1) * cellSize) + labelPadding;

  const chart = new ChartBase(container, {
    ...chartOptions,
    width,
    height,
    padding: { top: 10, right: 10, bottom: 50, left: 60 }
  });

  function getColor(value, min, max) {
    const ratio = (value - min) / (max - min);

    if (colorScale.length === 2) {
      return interpolateColor(colorScale[0], colorScale[1], ratio);
    } else {
      const mid = (min + max) / 2;
      if (value < mid) {
        return interpolateColor(colorScale[0], colorScale[1], (value - min) / (mid - min));
      } else {
        return interpolateColor(colorScale[1], colorScale[2], (value - mid) / (max - mid));
      }
    }
  }

  function interpolateColor(c1, c2, ratio) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);

    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  function render(progress = 1) {
    chart.clear();

    // Find min/max
    let min = Infinity, max = -Infinity;
    currentData.forEach(row => {
      row.forEach(value => {
        if (value < min) min = value;
        if (value > max) max = value;
      });
    });

    const { padding } = chart.options;

    // Draw cells
    currentData.forEach((row, y) => {
      row.forEach((value, x) => {
        const cellX = padding.left + x * cellSize;
        const cellY = padding.top + y * cellSize;

        chart.ctx.fillStyle = getColor(value * progress, min, max);
        chart.ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1);

        if (showValues && cellSize >= 25) {
          chart.ctx.fillStyle = value > (min + max) / 2 ? '#ffffff' : '#000000';
          chart.ctx.font = '10px Inter, system-ui, sans-serif';
          chart.ctx.textAlign = 'center';
          chart.ctx.textBaseline = 'middle';
          chart.ctx.fillText(
            value.toFixed(value % 1 === 0 ? 0 : 1),
            cellX + cellSize / 2,
            cellY + cellSize / 2
          );
        }
      });
    });

    // Draw labels
    chart.ctx.fillStyle = '#374151';
    chart.ctx.font = '11px Inter, system-ui, sans-serif';

    // X labels
    chart.ctx.textAlign = 'center';
    xLabels.forEach((label, i) => {
      chart.ctx.fillText(
        label,
        padding.left + i * cellSize + cellSize / 2,
        padding.top + currentData.length * cellSize + 15
      );
    });

    // Y labels
    chart.ctx.textAlign = 'right';
    yLabels.forEach((label, i) => {
      chart.ctx.fillText(
        label,
        padding.left - 8,
        padding.top + i * cellSize + cellSize / 2
      );
    });
  }

  chart.animate(render);

  container.setData = (newData) => {
    currentData = newData.map(row => [...row]);
    chart.animate(render);
  };

  container.destroy = () => chart.destroy();

  return container;
}

// ============================================================================
// Sparkline
// ============================================================================

export function createSparkline(props = {}) {
  const {
    data = [],
    color = '#3b82f6',
    width = 100,
    height = 30,
    fill = true,
    fillOpacity = 0.2,
    lineWidth = 1.5,
    showEndpoint = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.sparkline || 'sparkline';
  container.style.cssText = `display: inline-block; width: ${width}px; height: ${height}px;`;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  container.appendChild(canvas);

  let currentData = [...data];

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (currentData.length < 2) return;

    const min = Math.min(...currentData);
    const max = Math.max(...currentData);
    const range = max - min || 1;
    const padding = 2;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const points = currentData.map((value, i) => ({
      x: padding + (i / (currentData.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight
    }));

    // Fill
    if (fill) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, height - padding);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, height - padding);
      ctx.closePath();
      ctx.fillStyle = color + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Endpoint
    if (showEndpoint) {
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  render();

  container.setData = (newData) => {
    currentData = [...newData];
    render();
  };

  container.addPoint = (value) => {
    currentData.push(value);
    render();
  };

  return container;
}

// ============================================================================
// Progress Ring
// ============================================================================

export function createProgressRing(props = {}) {
  const {
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    backgroundColor = '#e5e7eb',
    showValue = true,
    label = '',
    animate = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.progressRing || 'progress-ring';
  container.style.cssText = `position: relative; width: ${size}px; height: ${size}px;`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.style.transform = 'rotate(-90deg)';

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Background circle
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', size / 2);
  bgCircle.setAttribute('cy', size / 2);
  bgCircle.setAttribute('r', radius);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', backgroundColor);
  bgCircle.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(bgCircle);

  // Progress circle
  const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progressCircle.setAttribute('cx', size / 2);
  progressCircle.setAttribute('cy', size / 2);
  progressCircle.setAttribute('r', radius);
  progressCircle.setAttribute('fill', 'none');
  progressCircle.setAttribute('stroke', color);
  progressCircle.setAttribute('stroke-width', strokeWidth);
  progressCircle.setAttribute('stroke-linecap', 'round');
  progressCircle.setAttribute('stroke-dasharray', circumference);
  progressCircle.style.transition = animate ? 'stroke-dashoffset 0.5s ease' : 'none';
  svg.appendChild(progressCircle);

  container.appendChild(svg);

  // Value display
  const valueDisplay = document.createElement('div');
  valueDisplay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  `;
  container.appendChild(valueDisplay);

  function update(newValue) {
    const percentage = Math.max(0, Math.min(100, (newValue / max) * 100));
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.setAttribute('stroke-dashoffset', offset);

    if (showValue) {
      valueDisplay.innerHTML = `
        <div style="font-size: ${size / 4}px; font-weight: 600; color: #111827;">${Math.round(newValue)}</div>
        ${label ? `<div style="font-size: ${size / 10}px; color: #6b7280;">${label}</div>` : ''}
      `;
    }
  }

  update(value);

  container.setValue = update;

  return container;
}

// Export all
export default {
  createLineChart,
  createBarChart,
  createPieChart,
  createAreaChart,
  createCandlestickChart,
  createGaugeChart,
  createRadarChart,
  createHeatmap,
  createSparkline,
  createProgressRing
};
