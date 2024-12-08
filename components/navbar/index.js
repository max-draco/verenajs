import navbarStyles from './navbar.module.css';

function createNavbar(items) {
  const navbar = document.createElement('nav');
  navbar.className = navbarStyles.navbar;

  const ul = document.createElement('ul');
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });

  navbar.appendChild(ul);
  document.body.appendChild(navbar);
}

export default createNavbar;
