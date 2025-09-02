// card.js
import cardStyles from './card.module.css';

export function createCard(title, content) {
  const card = document.createElement('div');
  card.classList.add(cardStyles.card);

  if (title) {
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;
    card.appendChild(cardTitle);
  }

  // if content is a string -> wrap in <p>
  if (typeof content === 'string') {
    const cardContent = document.createElement('p');
    cardContent.textContent = content;
    card.appendChild(cardContent);
  }
  // if content is already an HTMLElement -> append directly
  else if (content instanceof Node) {
    card.appendChild(content);
  }

  return card; // <-- only return the card
}
