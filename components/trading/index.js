/**
 * verenajs Trading Components
 * Production-ready components for financial applications
 *
 * @version 2.0.0
 */

import { dom, events, injectStyle } from '../../core/core.js';

// Inject trading styles
const TRADING_STYLES = `
  :root {
    --v-bid: #22c55e;
    --v-ask: #ef4444;
    --v-bid-bg: rgba(34, 197, 94, 0.1);
    --v-ask-bg: rgba(239, 68, 68, 0.1);
  }

  .v-trading-card {
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .v-trading-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
    background: var(--v-surface-alt, #f8fafc);
  }

  .v-trading-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--v-text, #1e293b);
  }

  .v-trading-body {
    padding: 0;
  }

  .v-price-up { color: var(--v-bid) !important; }
  .v-price-down { color: var(--v-ask) !important; }
  .v-price-neutral { color: var(--v-text-muted, #64748b) !important; }

  @keyframes v-flash-green {
    0%, 100% { background: transparent; }
    50% { background: var(--v-bid-bg); }
  }

  @keyframes v-flash-red {
    0%, 100% { background: transparent; }
    50% { background: var(--v-ask-bg); }
  }

  .v-flash-up { animation: v-flash-green 0.3s ease; }
  .v-flash-down { animation: v-flash-red 0.3s ease; }
`;

injectStyle('v-trading-base', TRADING_STYLES);

// ============================================
// ORDER BOOK COMPONENT
// ============================================

const ORDER_BOOK_STYLES = `
  .v-orderbook {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.75rem;
  }

  .v-orderbook-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: var(--v-text-muted, #64748b);
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
  }

  .v-orderbook-header span:last-child { text-align: right; }
  .v-orderbook-header span:nth-child(2) { text-align: center; }

  .v-orderbook-asks,
  .v-orderbook-bids {
    max-height: 200px;
    overflow-y: auto;
  }

  .v-orderbook-asks { display: flex; flex-direction: column-reverse; }

  .v-orderbook-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    padding: 0.25rem 1rem;
    cursor: pointer;
    position: relative;
    transition: background 0.15s;
  }

  .v-orderbook-row:hover { background: var(--v-surface-alt, rgba(0,0,0,0.02)); }

  .v-orderbook-row .price { font-weight: 500; }
  .v-orderbook-row .amount { text-align: center; color: var(--v-text, #1e293b); }
  .v-orderbook-row .total { text-align: right; color: var(--v-text-muted, #64748b); }

  .v-orderbook-row.ask .price { color: var(--v-ask); }
  .v-orderbook-row.bid .price { color: var(--v-bid); }

  .v-orderbook-depth {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    pointer-events: none;
    opacity: 0.15;
  }

  .v-orderbook-row.ask .v-orderbook-depth { background: var(--v-ask); }
  .v-orderbook-row.bid .v-orderbook-depth { background: var(--v-bid); }

  .v-orderbook-spread {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: var(--v-surface-alt, #f8fafc);
    font-size: 0.7rem;
    color: var(--v-text-muted, #64748b);
    gap: 1rem;
  }

  .v-orderbook-spread-value { font-weight: 600; color: var(--v-text, #1e293b); }
`;

injectStyle('v-orderbook', ORDER_BOOK_STYLES);

export function createOrderBook(props = {}) {
  const {
    bids = [],
    asks = [],
    depth = 15,
    precision = 2,
    symbol = '',
    onPriceClick = null,
    showDepth = true,
    showSpread = true
  } = props;

  const container = dom.create('div', { className: 'v-trading-card v-orderbook' });

  // Header
  if (symbol) {
    const header = dom.create('div', { className: 'v-trading-header' });
    header.appendChild(dom.create('span', { className: 'v-trading-title' }, `Order Book${symbol ? ` - ${symbol}` : ''}`));
    container.appendChild(header);
  }

  // Column headers
  const colHeader = dom.create('div', { className: 'v-orderbook-header' });
  colHeader.innerHTML = '<span>Price</span><span>Amount</span><span>Total</span>';
  container.appendChild(colHeader);

  // Asks section
  const asksContainer = dom.create('div', { className: 'v-orderbook-asks' });
  container.appendChild(asksContainer);

  // Spread
  const spreadEl = dom.create('div', { className: 'v-orderbook-spread' });
  container.appendChild(spreadEl);

  // Bids section
  const bidsContainer = dom.create('div', { className: 'v-orderbook-bids' });
  container.appendChild(bidsContainer);

  function formatNumber(num, prec = precision) {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: prec,
      maximumFractionDigits: prec
    });
  }

  function createRow(price, amount, total, maxTotal, side) {
    const row = dom.create('div', {
      className: `v-orderbook-row ${side}`,
      onClick: () => onPriceClick && onPriceClick(price, side)
    });

    row.innerHTML = `
      <span class="price">${formatNumber(price)}</span>
      <span class="amount">${formatNumber(amount, 4)}</span>
      <span class="total">${formatNumber(total)}</span>
      ${showDepth ? `<div class="v-orderbook-depth" style="width: ${(total / maxTotal) * 100}%"></div>` : ''}
    `;

    return row;
  }

  function render(newBids = bids, newAsks = asks) {
    dom.empty(asksContainer);
    dom.empty(bidsContainer);

    // Calculate totals
    let askTotal = 0;
    let bidTotal = 0;
    const processedAsks = newAsks.slice(0, depth).map(([price, amount]) => {
      askTotal += price * amount;
      return { price, amount, total: askTotal };
    });

    const processedBids = newBids.slice(0, depth).map(([price, amount]) => {
      bidTotal += price * amount;
      return { price, amount, total: bidTotal };
    });

    const maxTotal = Math.max(askTotal, bidTotal);

    // Render asks (reversed)
    processedAsks.forEach(({ price, amount, total }) => {
      asksContainer.appendChild(createRow(price, amount, total, maxTotal, 'ask'));
    });

    // Render bids
    processedBids.forEach(({ price, amount, total }) => {
      bidsContainer.appendChild(createRow(price, amount, total, maxTotal, 'bid'));
    });

    // Update spread
    if (showSpread && processedAsks.length && processedBids.length) {
      const bestAsk = processedAsks[0]?.price || 0;
      const bestBid = processedBids[0]?.price || 0;
      const spread = bestAsk - bestBid;
      const spreadPercent = bestBid > 0 ? ((spread / bestBid) * 100).toFixed(3) : 0;

      spreadEl.innerHTML = `
        <span>Spread</span>
        <span class="v-orderbook-spread-value">${formatNumber(spread)}</span>
        <span>(${spreadPercent}%)</span>
      `;
    }
  }

  render();

  // API
  container.update = (newBids, newAsks) => render(newBids, newAsks);
  container.updateBids = (newBids) => render(newBids, asks);
  container.updateAsks = (newAsks) => render(bids, newAsks);

  return container;
}

// ============================================
// TRADE HISTORY COMPONENT
// ============================================

const TRADE_HISTORY_STYLES = `
  .v-trade-history-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .v-trade-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.75rem;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
  }

  .v-trade-row:last-child { border-bottom: none; }

  .v-trade-row.buy .v-trade-price { color: var(--v-bid); }
  .v-trade-row.sell .v-trade-price { color: var(--v-ask); }

  .v-trade-price { font-weight: 500; }
  .v-trade-amount { text-align: center; }
  .v-trade-time { text-align: right; color: var(--v-text-muted, #64748b); }
`;

injectStyle('v-trade-history', TRADE_HISTORY_STYLES);

export function createTradeHistory(props = {}) {
  const {
    trades = [],
    limit = 50,
    symbol = '',
    precision = 2,
    showHeader = true
  } = props;

  const container = dom.create('div', { className: 'v-trading-card v-trade-history' });

  if (showHeader) {
    const header = dom.create('div', { className: 'v-trading-header' });
    header.appendChild(dom.create('span', { className: 'v-trading-title' }, `Recent Trades${symbol ? ` - ${symbol}` : ''}`));
    container.appendChild(header);
  }

  // Column headers
  const colHeader = dom.create('div', { className: 'v-orderbook-header' });
  colHeader.innerHTML = '<span>Price</span><span>Amount</span><span>Time</span>';
  container.appendChild(colHeader);

  const list = dom.create('div', { className: 'v-trade-history-list' });
  container.appendChild(list);

  function formatNumber(num, prec = precision) {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: prec,
      maximumFractionDigits: prec
    });
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  function render(newTrades = trades) {
    dom.empty(list);

    newTrades.slice(0, limit).forEach(trade => {
      const row = dom.create('div', {
        className: `v-trade-row ${trade.side || (trade.isBuyerMaker ? 'sell' : 'buy')}`
      });

      row.innerHTML = `
        <span class="v-trade-price">${formatNumber(trade.price)}</span>
        <span class="v-trade-amount">${formatNumber(trade.amount || trade.qty, 4)}</span>
        <span class="v-trade-time">${formatTime(trade.time || trade.timestamp)}</span>
      `;

      list.appendChild(row);
    });
  }

  render();

  // API
  container.update = (newTrades) => render(newTrades);
  container.addTrade = (trade) => {
    const newTrades = [trade, ...trades.slice(0, limit - 1)];
    render(newTrades);
  };

  return container;
}

// ============================================
// PRICE TICKER COMPONENT
// ============================================

const PRICE_TICKER_STYLES = `
  .v-price-ticker {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--v-surface, #fff);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.5rem;
  }

  .v-ticker-symbol {
    font-weight: 700;
    font-size: 0.875rem;
    color: var(--v-text, #1e293b);
  }

  .v-ticker-price {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 1.25rem;
    font-weight: 600;
    transition: color 0.2s;
  }

  .v-ticker-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .v-ticker-change.positive {
    color: var(--v-bid);
    background: var(--v-bid-bg);
  }

  .v-ticker-change.negative {
    color: var(--v-ask);
    background: var(--v-ask-bg);
  }

  .v-ticker-volume {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
  }

  .v-ticker-volume span { font-weight: 600; color: var(--v-text, #1e293b); }
`;

injectStyle('v-price-ticker', PRICE_TICKER_STYLES);

export function createPriceTicker(props = {}) {
  const {
    symbol = 'BTC/USD',
    price = 0,
    change = 0,
    changePercent = 0,
    volume = 0,
    precision = 2,
    showVolume = true
  } = props;

  const container = dom.create('div', { className: 'v-price-ticker' });

  let currentPrice = price;
  let previousPrice = price;

  function formatNumber(num, prec = precision) {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: prec,
      maximumFractionDigits: prec
    });
  }

  function formatVolume(vol) {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toFixed(2);
  }

  function render() {
    const isPositive = change >= 0;
    const priceClass = currentPrice > previousPrice ? 'v-price-up' :
                       currentPrice < previousPrice ? 'v-price-down' : '';

    container.innerHTML = `
      <span class="v-ticker-symbol">${symbol}</span>
      <span class="v-ticker-price ${priceClass}">${formatNumber(currentPrice)}</span>
      <span class="v-ticker-change ${isPositive ? 'positive' : 'negative'}">
        ${isPositive ? '▲' : '▼'} ${Math.abs(changePercent).toFixed(2)}%
      </span>
      ${showVolume ? `<span class="v-ticker-volume">Vol: <span>${formatVolume(volume)}</span></span>` : ''}
    `;
  }

  render();

  // API
  container.update = (newData) => {
    previousPrice = currentPrice;
    currentPrice = newData.price ?? currentPrice;
    Object.assign(props, newData);
    render();

    // Flash animation
    const priceEl = container.querySelector('.v-ticker-price');
    if (priceEl) {
      priceEl.classList.remove('v-flash-up', 'v-flash-down');
      if (currentPrice > previousPrice) {
        priceEl.classList.add('v-flash-up');
      } else if (currentPrice < previousPrice) {
        priceEl.classList.add('v-flash-down');
      }
    }
  };

  return container;
}

// ============================================
// ORDER FORM COMPONENT
// ============================================

const ORDER_FORM_STYLES = `
  .v-order-form {
    padding: 1.5rem;
  }

  .v-order-tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    background: var(--v-surface-alt, #f1f5f9);
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .v-order-tab {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .v-order-tab.buy { color: var(--v-bid); }
  .v-order-tab.sell { color: var(--v-ask); }

  .v-order-tab.active.buy { background: var(--v-bid); color: white; }
  .v-order-tab.active.sell { background: var(--v-ask); color: white; }

  .v-order-type-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
  }

  .v-order-type-tab {
    padding: 0.5rem 0;
    border: none;
    background: transparent;
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .v-order-type-tab.active {
    color: var(--v-primary, #3b82f6);
    border-bottom-color: var(--v-primary, #3b82f6);
  }

  .v-order-field {
    margin-bottom: 1rem;
  }

  .v-order-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    margin-bottom: 0.5rem;
  }

  .v-order-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--v-surface-alt, #f8fafc);
    border: 1px solid var(--v-border, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .v-order-input-wrap:focus-within {
    border-color: var(--v-primary, #3b82f6);
  }

  .v-order-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    font-size: 1rem;
    font-family: 'Monaco', 'Menlo', monospace;
    outline: none;
  }

  .v-order-input-suffix {
    padding: 0 1rem;
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    font-weight: 600;
  }

  .v-order-percent-btns {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .v-order-percent-btn {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--v-border, #e2e8f0);
    background: transparent;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .v-order-percent-btn:hover {
    border-color: var(--v-primary, #3b82f6);
    background: var(--v-surface-alt, #f8fafc);
  }

  .v-order-summary {
    padding: 1rem;
    background: var(--v-surface-alt, #f8fafc);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .v-order-summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .v-order-summary-row:last-child { margin-bottom: 0; }

  .v-order-summary-label { color: var(--v-text-muted, #64748b); }
  .v-order-summary-value { font-weight: 600; font-family: 'Monaco', monospace; }

  .v-order-submit {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .v-order-submit.buy { background: var(--v-bid); color: white; }
  .v-order-submit.sell { background: var(--v-ask); color: white; }
  .v-order-submit:hover { opacity: 0.9; transform: translateY(-1px); }
  .v-order-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

injectStyle('v-order-form', ORDER_FORM_STYLES);

export function createOrderForm(props = {}) {
  const {
    symbol = 'BTC/USD',
    baseAsset = 'BTC',
    quoteAsset = 'USD',
    availableBalance = 0,
    currentPrice = 0,
    minAmount = 0.001,
    maxAmount = 100,
    pricePrecision = 2,
    amountPrecision = 4,
    onSubmit = null
  } = props;

  const container = dom.create('div', { className: 'v-trading-card' });

  const header = dom.create('div', { className: 'v-trading-header' });
  header.appendChild(dom.create('span', { className: 'v-trading-title' }, `Trade ${symbol}`));
  container.appendChild(header);

  const form = dom.create('div', { className: 'v-order-form' });

  let state = {
    side: 'buy',
    type: 'limit',
    price: currentPrice,
    amount: 0,
    total: 0
  };

  function updateState(updates) {
    state = { ...state, ...updates };

    if (updates.price !== undefined || updates.amount !== undefined) {
      state.total = state.price * state.amount;
    }

    render();
  }

  function render() {
    form.innerHTML = `
      <div class="v-order-tabs">
        <button class="v-order-tab buy ${state.side === 'buy' ? 'active' : ''}" data-side="buy">Buy</button>
        <button class="v-order-tab sell ${state.side === 'sell' ? 'active' : ''}" data-side="sell">Sell</button>
      </div>

      <div class="v-order-type-tabs">
        <button class="v-order-type-tab ${state.type === 'limit' ? 'active' : ''}" data-type="limit">Limit</button>
        <button class="v-order-type-tab ${state.type === 'market' ? 'active' : ''}" data-type="market">Market</button>
        <button class="v-order-type-tab ${state.type === 'stop' ? 'active' : ''}" data-type="stop">Stop</button>
      </div>

      ${state.type !== 'market' ? `
        <div class="v-order-field">
          <div class="v-order-label">
            <span>Price</span>
            <span>≈ ${state.price.toFixed(pricePrecision)} ${quoteAsset}</span>
          </div>
          <div class="v-order-input-wrap">
            <input type="number" class="v-order-input" id="orderPrice" value="${state.price}" step="0.01" />
            <span class="v-order-input-suffix">${quoteAsset}</span>
          </div>
        </div>
      ` : ''}

      <div class="v-order-field">
        <div class="v-order-label">
          <span>Amount</span>
          <span>Available: ${availableBalance.toFixed(amountPrecision)} ${state.side === 'buy' ? quoteAsset : baseAsset}</span>
        </div>
        <div class="v-order-input-wrap">
          <input type="number" class="v-order-input" id="orderAmount" value="${state.amount}" step="${minAmount}" min="${minAmount}" max="${maxAmount}" />
          <span class="v-order-input-suffix">${baseAsset}</span>
        </div>
      </div>

      <div class="v-order-percent-btns">
        <button class="v-order-percent-btn" data-percent="25">25%</button>
        <button class="v-order-percent-btn" data-percent="50">50%</button>
        <button class="v-order-percent-btn" data-percent="75">75%</button>
        <button class="v-order-percent-btn" data-percent="100">100%</button>
      </div>

      <div class="v-order-summary">
        <div class="v-order-summary-row">
          <span class="v-order-summary-label">Total</span>
          <span class="v-order-summary-value">${state.total.toFixed(pricePrecision)} ${quoteAsset}</span>
        </div>
        <div class="v-order-summary-row">
          <span class="v-order-summary-label">Fee (0.1%)</span>
          <span class="v-order-summary-value">${(state.total * 0.001).toFixed(pricePrecision)} ${quoteAsset}</span>
        </div>
      </div>

      <button class="v-order-submit ${state.side}" ${state.amount <= 0 ? 'disabled' : ''}>
        ${state.side === 'buy' ? 'Buy' : 'Sell'} ${baseAsset}
      </button>
    `;

    // Event listeners
    form.querySelectorAll('.v-order-tab').forEach(btn => {
      btn.addEventListener('click', () => updateState({ side: btn.dataset.side }));
    });

    form.querySelectorAll('.v-order-type-tab').forEach(btn => {
      btn.addEventListener('click', () => updateState({ type: btn.dataset.type }));
    });

    const priceInput = form.querySelector('#orderPrice');
    if (priceInput) {
      priceInput.addEventListener('input', (e) => updateState({ price: parseFloat(e.target.value) || 0 }));
    }

    const amountInput = form.querySelector('#orderAmount');
    if (amountInput) {
      amountInput.addEventListener('input', (e) => updateState({ amount: parseFloat(e.target.value) || 0 }));
    }

    form.querySelectorAll('.v-order-percent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const percent = parseInt(btn.dataset.percent, 10) / 100;
        const maxAvailable = state.side === 'buy'
          ? availableBalance / state.price
          : availableBalance;
        updateState({ amount: maxAvailable * percent });
      });
    });

    const submitBtn = form.querySelector('.v-order-submit');
    submitBtn.addEventListener('click', () => {
      if (onSubmit && state.amount > 0) {
        onSubmit({
          symbol,
          side: state.side,
          type: state.type,
          price: state.type === 'market' ? null : state.price,
          amount: state.amount,
          total: state.total
        });
      }
    });
  }

  render();
  container.appendChild(form);

  // API
  container.setPrice = (price) => updateState({ price });
  container.reset = () => updateState({ amount: 0, total: 0 });
  container.getState = () => ({ ...state });

  return container;
}

// ============================================
// PORTFOLIO COMPONENT
// ============================================

const PORTFOLIO_STYLES = `
  .v-portfolio-list {
    padding: 0;
  }

  .v-portfolio-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
  }

  .v-portfolio-item:last-child { border-bottom: none; }

  .v-portfolio-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--v-surface-alt, #f1f5f9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .v-portfolio-info { min-width: 0; }

  .v-portfolio-asset {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--v-text, #1e293b);
  }

  .v-portfolio-balance {
    font-size: 0.75rem;
    color: var(--v-text-muted, #64748b);
    font-family: 'Monaco', monospace;
  }

  .v-portfolio-value {
    text-align: right;
  }

  .v-portfolio-usd {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--v-text, #1e293b);
    font-family: 'Monaco', monospace;
  }

  .v-portfolio-change {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .v-portfolio-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--v-surface-alt, #f8fafc);
    border-top: 1px solid var(--v-border, #e2e8f0);
  }

  .v-portfolio-total-label {
    font-size: 0.875rem;
    color: var(--v-text-muted, #64748b);
  }

  .v-portfolio-total-value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Monaco', monospace;
  }
`;

injectStyle('v-portfolio', PORTFOLIO_STYLES);

export function createPortfolio(props = {}) {
  const {
    assets = [],
    showTotal = true,
    currency = 'USD'
  } = props;

  const container = dom.create('div', { className: 'v-trading-card v-portfolio' });

  const header = dom.create('div', { className: 'v-trading-header' });
  header.appendChild(dom.create('span', { className: 'v-trading-title' }, 'Portfolio'));
  container.appendChild(header);

  const list = dom.create('div', { className: 'v-portfolio-list' });
  container.appendChild(list);

  const totalEl = dom.create('div', { className: 'v-portfolio-total' });
  if (showTotal) container.appendChild(totalEl);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  function render(newAssets = assets) {
    dom.empty(list);

    let total = 0;

    newAssets.forEach(asset => {
      const value = asset.balance * asset.price;
      total += value;

      const item = dom.create('div', { className: 'v-portfolio-item' });
      item.innerHTML = `
        <div class="v-portfolio-icon">${asset.symbol?.slice(0, 2) || '?'}</div>
        <div class="v-portfolio-info">
          <div class="v-portfolio-asset">${asset.name || asset.symbol}</div>
          <div class="v-portfolio-balance">${asset.balance.toFixed(8)} ${asset.symbol}</div>
        </div>
        <div class="v-portfolio-value">
          <div class="v-portfolio-usd">${formatCurrency(value)}</div>
          <div class="v-portfolio-change ${asset.change >= 0 ? 'v-price-up' : 'v-price-down'}">
            ${asset.change >= 0 ? '+' : ''}${asset.change?.toFixed(2) || 0}%
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    if (showTotal) {
      totalEl.innerHTML = `
        <span class="v-portfolio-total-label">Total Value</span>
        <span class="v-portfolio-total-value">${formatCurrency(total)}</span>
      `;
    }
  }

  render();

  // API
  container.update = (newAssets) => render(newAssets);
  container.addAsset = (asset) => render([...assets, asset]);

  return container;
}

// ============================================
// WATCHLIST COMPONENT
// ============================================

const WATCHLIST_STYLES = `
  .v-watchlist-table {
    width: 100%;
  }

  .v-watchlist-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 80px;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid var(--v-border, #e2e8f0);
  }

  .v-watchlist-row:hover { background: var(--v-surface-alt, rgba(0,0,0,0.02)); }
  .v-watchlist-row:last-child { border-bottom: none; }

  .v-watchlist-symbol {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .v-watchlist-name {
    font-size: 0.7rem;
    color: var(--v-text-muted, #64748b);
  }

  .v-watchlist-price {
    font-family: 'Monaco', monospace;
    font-size: 0.875rem;
    text-align: right;
  }

  .v-watchlist-change {
    text-align: right;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .v-watchlist-change.positive {
    background: var(--v-bid-bg);
    color: var(--v-bid);
  }

  .v-watchlist-change.negative {
    background: var(--v-ask-bg);
    color: var(--v-ask);
  }

  .v-watchlist-chart {
    height: 30px;
    display: flex;
    align-items: flex-end;
    gap: 1px;
  }

  .v-watchlist-chart-bar {
    flex: 1;
    background: var(--v-primary, #3b82f6);
    border-radius: 1px;
    opacity: 0.6;
  }
`;

injectStyle('v-watchlist', WATCHLIST_STYLES);

export function createWatchlist(props = {}) {
  const {
    symbols = [],
    precision = 2,
    onSelect = null,
    showChart = true
  } = props;

  const container = dom.create('div', { className: 'v-trading-card v-watchlist' });

  const header = dom.create('div', { className: 'v-trading-header' });
  header.appendChild(dom.create('span', { className: 'v-trading-title' }, 'Watchlist'));
  container.appendChild(header);

  const table = dom.create('div', { className: 'v-watchlist-table' });
  container.appendChild(table);

  function createMiniChart(data = []) {
    const max = Math.max(...data);
    return data.map(v => `<div class="v-watchlist-chart-bar" style="height: ${(v / max) * 100}%"></div>`).join('');
  }

  function render(newSymbols = symbols) {
    dom.empty(table);

    newSymbols.forEach(item => {
      const isPositive = item.change >= 0;

      const row = dom.create('div', {
        className: 'v-watchlist-row',
        onClick: () => onSelect && onSelect(item)
      });

      row.innerHTML = `
        <div>
          <div class="v-watchlist-symbol">${item.symbol}</div>
          <div class="v-watchlist-name">${item.name || ''}</div>
        </div>
        <div class="v-watchlist-price">${item.price.toFixed(precision)}</div>
        <div class="v-watchlist-change ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${item.change.toFixed(2)}%
        </div>
        ${showChart && item.chartData ? `
          <div class="v-watchlist-chart">${createMiniChart(item.chartData)}</div>
        ` : '<div></div>'}
      `;

      table.appendChild(row);
    });
  }

  render();

  // API
  container.update = (newSymbols) => render(newSymbols);
  container.updateSymbol = (symbol, data) => {
    const newSymbols = symbols.map(s =>
      s.symbol === symbol ? { ...s, ...data } : s
    );
    render(newSymbols);
  };

  return container;
}

// Export all trading components
export default {
  createOrderBook,
  createTradeHistory,
  createPriceTicker,
  createOrderForm,
  createPortfolio,
  createWatchlist
};
