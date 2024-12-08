import avatarStyles from './avatar.module.css';

function createAvatar(imageUrl, size = 'medium') {
  const avatar = document.createElement('img');
  avatar.src = imageUrl;
  avatar.className = avatarStyles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`];
  document.body.appendChild(avatar);
}

export default createAvatar;
