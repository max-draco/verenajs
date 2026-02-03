/**
 * Polymarket-style probability card with YES/NO buttons
 * Usage: createPriceCard({
 *   question, description, yesPrice, noPrice,
 *   volume, liquidity, category, onYes, onNo, onCardClick
 * })
 */
import styles from './index.module.css';

export function createPriceCard({
  question,
  description = '',
  yesPrice = 0.5,        // 0-1 probability
  noPrice = 0.5,
  volume = 0,
  liquidity = 0,
  category = 'crypto',
  trending = false,
  onYes,
  onNo,
  onCardClick
}) {
  const card = document.createElement('div');
  card.className = styles.priceCard;

  // Card click handler (optional)
  if (onCardClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking buttons
      if (e.target.tagName !== 'BUTTON') {
        onCardClick({ question, yesPrice, noPrice, volume, liquidity });
      }
    });
  }

  // Header: Category badge + trending + volume
  const header = document.createElement('div');
  header.className = styles.cardHeader;

  const categoryBadge = document.createElement('span');
  categoryBadge.className = styles.categoryBadge;
  categoryBadge.textContent = category.toUpperCase();
  categoryBadge.dataset.category = category;

  const meta = document.createElement('div');
  meta.className = styles.meta;

  if (trending) {
    const trendIcon = document.createElement('span');
    trendIcon.className = styles.trending;
    trendIcon.innerHTML = '📈 Trending';
    meta.appendChild(trendIcon);
  }

  if (volume > 0) {
    const volumeEl = document.createElement('span');
    volumeEl.className = styles.volume;
    volumeEl.textContent = `$${formatNumber(volume)} Vol`;
    meta.appendChild(volumeEl);
  }

  header.appendChild(categoryBadge);
  header.appendChild(meta);

  // Question
  const questionEl = document.createElement('h3');
  questionEl.className = styles.question;
  questionEl.textContent = question;

  // Description (optional)
  const descEl = document.createElement('p');
  descEl.className = styles.description;
  descEl.textContent = description || 'Market resolves when conditions are met';

  // Probability visualization (large YES %)
  const probViz = document.createElement('div');
  probViz.className = styles.probViz;

  const mainProb = document.createElement('div');
  mainProb.className = styles.mainProb;

  const percentage = document.createElement('span');
  percentage.className = styles.percentage;
  percentage.textContent = `${Math.round(yesPrice * 100)}%`;

  const label = document.createElement('span');
  label.className = styles.label;
  label.textContent = 'Chance';

  mainProb.appendChild(percentage);
  mainProb.appendChild(label);
  probViz.appendChild(mainProb);

  // Liquidity indicator
  if (liquidity > 0) {
    const liquidityEl = document.createElement('div');
    liquidityEl.className = styles.liquidity;
    liquidityEl.innerHTML = `
      <span class="${styles.liquidityLabel}">Liquidity</span>
      <span class="${styles.liquidityValue}">$${formatNumber(liquidity)}</span>
    `;
    probViz.appendChild(liquidityEl);
  }

  // Trading buttons row
  const btnRow = document.createElement('div');
  btnRow.className = styles.btnRow;

  // YES button
  const yesBtn = document.createElement('button');
  yesBtn.className = `${styles.btn} ${styles.yesBtn}`;
  yesBtn.innerHTML = `
    <span class="${styles.btnLabel}">Yes</span>
    <span class="${styles.btnPrice}">${Math.round(yesPrice * 100)}¢</span>
  `;

  yesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onYes) {
      onYes({ question, price: yesPrice, volume, liquidity, category });
    }
  });

  // NO button
  const noBtn = document.createElement('button');
  noBtn.className = `${styles.btn} ${styles.noBtn}`;
  noBtn.innerHTML = `
    <span class="${styles.btnLabel}">No</span>
    <span class="${styles.btnPrice}">${Math.round(noPrice * 100)}¢</span>
  `;

  noBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onNo) {
      onNo({ question, price: noPrice, volume, liquidity, category });
    }
  });

  btnRow.appendChild(yesBtn);
  btnRow.appendChild(noBtn);

  // Assemble card
  card.appendChild(header);
  card.appendChild(questionEl);
  card.appendChild(descEl);
  card.appendChild(probViz);
  card.appendChild(btnRow);

  return card;
}

// Helper function to format numbers with K/M suffix
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
}
