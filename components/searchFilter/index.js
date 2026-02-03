/**
 * Search + filter combo for markets
 * Usage: createSearchFilter({
 *   categories, onSearch, onFilterChange, placeholder
 * })
 */
import styles from './index.module.css';

export function createSearchFilter({
  categories = [],
  onSearch,
  onFilterChange,
  placeholder = 'Search markets...'
}) {
  const container = document.createElement('div');
  container.className = styles.searchFilter;

  // Search input section
  const searchWrap = document.createElement('div');
  searchWrap.className = styles.searchWrap;

  const searchIcon = document.createElement('i');
  searchIcon.className = 'fas fa-search';
  searchIcon.classList.add(styles.icon);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.className = styles.searchInput;
  input.autocomplete = 'off';

  // Debounced search
  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch?.(e.target.value);
    }, 300);
  });

  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.className = styles.clearBtn;
  clearBtn.innerHTML = '<i class="fas fa-times"></i>';
  clearBtn.style.display = 'none';
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    onSearch?.('');
  });

  input.addEventListener('input', (e) => {
    clearBtn.style.display = e.target.value ? 'flex' : 'none';
  });

  searchWrap.appendChild(searchIcon);
  searchWrap.appendChild(input);
  searchWrap.appendChild(clearBtn);

  // Category filters (pills)
  const filtersWrap = document.createElement('div');
  filtersWrap.className = styles.filters;

  // "All" pill (always active by default)
  const allBtn = createFilterPill('All', true);
  allBtn.addEventListener('click', () => {
    setActivePill(filtersWrap, allBtn);
    onFilterChange?.('all');
  });
  filtersWrap.appendChild(allBtn);

  // Category pills
  categories.forEach(cat => {
    const pill = createFilterPill(cat.label, false, cat.icon);
    pill.addEventListener('click', () => {
      setActivePill(filtersWrap, pill);
      onFilterChange?.(cat.value);
    });
    filtersWrap.appendChild(pill);
  });

  container.appendChild(searchWrap);
  container.appendChild(filtersWrap);

  return container;
}

function createFilterPill(label, active = false, icon = null) {
  const pill = document.createElement('button');
  pill.className = styles.pill;
  if (active) pill.classList.add(styles.active);

  if (icon) {
    const iconEl = document.createElement('i');
    iconEl.className = `fas ${icon}`;
    iconEl.classList.add(styles.pillIcon);
    pill.appendChild(iconEl);
  }

  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  pill.appendChild(labelEl);

  return pill;
}

function setActivePill(container, activePill) {
  container.querySelectorAll(`.${styles.pill}`).forEach(p =>
    p.classList.remove(styles.active)
  );
  activePill.classList.add(styles.active);
}
