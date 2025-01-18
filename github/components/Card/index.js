import cardStyles from './card.module.css';

export function createCard(title, content) {
  const card = document.createElement('div');
  card.className = cardStyles.card;

  const cardTitle = document.createElement('h3');
  cardTitle.textContent = title;

  const cardContent = document.createElement('p');
  cardContent.textContent = content;

  card.appendChild(cardTitle);
  card.appendChild(cardContent);

  document.body.appendChild(card);
}

