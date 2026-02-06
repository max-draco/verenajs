# Examples

Comprehensive code examples for verenajs.

## Table of Contents

- [Quick Start](#quick-start)
- [Forms](#forms)
- [Data Display](#data-display)
- [Dashboard](#dashboard)
- [Trading Application](#trading-application)
- [Visual Builder](#visual-builder)
- [Mobile App](#mobile-app)
- [Desktop App](#desktop-app)

---

## Quick Start

### Hello World

```javascript
import { createButton, createCard } from 'verenajs';

const card = createCard({ title: 'Hello verenajs!' });

const button = createButton({
  type: 'primary',
  label: 'Click Me',
  onClick: () => alert('Welcome to verenajs!')
});

card.appendChild(button);
document.getElementById('app').appendChild(card);
```

### With Theming

```javascript
import { createCard, createButton, theme } from 'verenajs';

// Enable dark mode
theme.set('dark');

const app = document.getElementById('app');
app.style.backgroundColor = theme.get('background');
app.style.color = theme.get('text');
app.style.minHeight = '100vh';
app.style.padding = '2rem';

const card = createCard({ title: 'Dark Theme Demo' });
card.appendChild(createButton({ label: 'Primary', type: 'primary' }));
card.appendChild(createButton({ label: 'Secondary', type: 'secondary' }));

app.appendChild(card);
```

---

## Forms

### Login Form

```javascript
import {
  createCard,
  createInput,
  createButton,
  createCheckbox
} from 'verenajs';

const loginCard = createCard({ title: 'Sign In' });

const emailInput = createInput({
  name: 'email',
  label: 'Email Address',
  type: 'email',
  placeholder: 'you@example.com',
  required: true
});

const passwordInput = createInput({
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
});

const rememberMe = createCheckbox({
  name: 'remember',
  label: 'Remember me'
});

const submitButton = createButton({
  type: 'primary',
  label: 'Sign In',
  onClick: () => {
    const email = emailInput.querySelector('input').value;
    const password = passwordInput.querySelector('input').value;
    console.log('Login:', { email, password });
  }
});

loginCard.appendChild(emailInput);
loginCard.appendChild(passwordInput);
loginCard.appendChild(rememberMe);
loginCard.appendChild(submitButton);

document.body.appendChild(loginCard);
```

### Registration Form

```javascript
import {
  createSmartForm,
  createInput,
  createSelect,
  createButton,
  createCard
} from 'verenajs';

const form = createSmartForm({
  onSubmit: (data) => {
    console.log('Registration data:', data);
    // Send to API
  }
});

form.appendChild(createInput({
  name: 'firstName',
  label: 'First Name',
  required: true
}));

form.appendChild(createInput({
  name: 'lastName',
  label: 'Last Name',
  required: true
}));

form.appendChild(createInput({
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true
}));

form.appendChild(createInput({
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true
}));

form.appendChild(createSelect({
  name: 'country',
  label: 'Country',
  options: [
    { value: '', label: 'Select country...' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ke', label: 'Kenya' },
    { value: 'de', label: 'Germany' }
  ]
}));

form.appendChild(createButton({
  type: 'primary',
  label: 'Create Account'
}));

const card = createCard({ title: 'Create Account' });
card.appendChild(form);
document.body.appendChild(card);
```

---

## Data Display

### Data Table with Pagination

```javascript
import { createDataTable, createCard } from 'verenajs';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User' },
  // ... more data
];

const table = createDataTable({
  columns: [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role' }
  ],
  data: users,
  pagination: true,
  pageSize: 10,
  onRowClick: (row) => console.log('Clicked:', row)
});

const card = createCard({ title: 'Users' });
card.appendChild(table);
document.body.appendChild(card);
```

### Tree View

```javascript
import { createTreeView, createCard } from 'verenajs';

const fileSystem = [
  {
    label: 'src',
    icon: 'folder',
    children: [
      {
        label: 'components',
        icon: 'folder',
        children: [
          { label: 'Button.js', icon: 'file' },
          { label: 'Card.js', icon: 'file' }
        ]
      },
      { label: 'index.js', icon: 'file' }
    ]
  },
  {
    label: 'package.json',
    icon: 'file'
  }
];

const tree = createTreeView({
  data: fileSystem,
  onSelect: (node) => console.log('Selected:', node.label)
});

const card = createCard({ title: 'Project Files' });
card.appendChild(tree);
document.body.appendChild(card);
```

---

## Dashboard

### Analytics Dashboard

```javascript
import {
  createContainer,
  createGrid,
  createCard,
  createStat,
  createLineChart,
  createBarChart,
  createDataTable
} from 'verenajs';

// Create main container
const dashboard = createContainer({ className: 'dashboard' });
dashboard.style.padding = '2rem';

// Stats row
const statsGrid = createGrid({ columns: 4, gap: '1rem' });
statsGrid.appendChild(createStat({
  label: 'Total Users',
  value: '12,543',
  change: '+12%',
  trend: 'up'
}));
statsGrid.appendChild(createStat({
  label: 'Revenue',
  value: '$45,231',
  change: '+8%',
  trend: 'up'
}));
statsGrid.appendChild(createStat({
  label: 'Orders',
  value: '1,234',
  change: '-3%',
  trend: 'down'
}));
statsGrid.appendChild(createStat({
  label: 'Conversion',
  value: '3.2%',
  change: '+0.5%',
  trend: 'up'
}));

// Charts row
const chartsGrid = createGrid({ columns: 2, gap: '1rem' });

const revenueCard = createCard({ title: 'Revenue Over Time' });
revenueCard.appendChild(createLineChart({
  data: [
    { label: 'Jan', value: 4000 },
    { label: 'Feb', value: 3000 },
    { label: 'Mar', value: 5000 },
    { label: 'Apr', value: 4500 },
    { label: 'May', value: 6000 },
    { label: 'Jun', value: 5500 }
  ]
}));

const ordersCard = createCard({ title: 'Orders by Category' });
ordersCard.appendChild(createBarChart({
  data: [
    { label: 'Electronics', value: 450 },
    { label: 'Clothing', value: 320 },
    { label: 'Books', value: 180 },
    { label: 'Home', value: 240 }
  ]
}));

chartsGrid.appendChild(revenueCard);
chartsGrid.appendChild(ordersCard);

// Recent orders table
const ordersTableCard = createCard({ title: 'Recent Orders' });
ordersTableCard.appendChild(createDataTable({
  columns: [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ],
  data: [
    { id: '#1234', customer: 'John Doe', amount: '$125.00', status: 'Completed' },
    { id: '#1235', customer: 'Jane Smith', amount: '$89.00', status: 'Pending' },
    { id: '#1236', customer: 'Bob Wilson', amount: '$245.00', status: 'Shipped' }
  ]
}));

// Assemble dashboard
dashboard.appendChild(statsGrid);
dashboard.appendChild(chartsGrid);
dashboard.appendChild(ordersTableCard);

document.body.appendChild(dashboard);
```

---

## Trading Application

### Crypto Trading Interface

```javascript
import {
  createGrid,
  createOrderBook,
  createMarketChart,
  createTradeHistory,
  createOrderForm,
  createContainer
} from 'verenajs';

const tradingLayout = createGrid({ columns: 3, gap: '1rem' });
tradingLayout.style.padding = '1rem';
tradingLayout.style.height = '100vh';

// Order Book
const orderBook = createOrderBook({
  symbol: 'BTC/USD',
  bids: [
    { price: 42150.00, amount: 1.5 },
    { price: 42145.00, amount: 2.3 },
    { price: 42140.00, amount: 0.8 }
  ],
  asks: [
    { price: 42155.00, amount: 1.2 },
    { price: 42160.00, amount: 3.1 },
    { price: 42165.00, amount: 0.5 }
  ]
});

// Market Chart
const chart = createMarketChart({
  symbol: 'BTC/USD',
  type: 'candlestick',
  data: [
    { time: '09:00', open: 42100, high: 42200, low: 42050, close: 42150 },
    { time: '10:00', open: 42150, high: 42300, low: 42100, close: 42250 },
    // ... more candles
  ]
});

// Trade Panel
const tradePanel = createContainer();

const orderForm = createOrderForm({
  symbol: 'BTC/USD',
  onSubmit: (order) => {
    console.log('Order submitted:', order);
  }
});

const tradeHistory = createTradeHistory({
  trades: [
    { time: '10:15:32', price: 42155.00, amount: 0.5, side: 'buy' },
    { time: '10:15:28', price: 42150.00, amount: 1.2, side: 'sell' },
    { time: '10:15:20', price: 42148.00, amount: 0.3, side: 'buy' }
  ]
});

tradePanel.appendChild(orderForm);
tradePanel.appendChild(tradeHistory);

// Assemble layout
tradingLayout.appendChild(orderBook);
tradingLayout.appendChild(chart);
tradingLayout.appendChild(tradePanel);

document.body.appendChild(tradingLayout);
```

---

## Visual Builder

### Launch Visual Builder

```javascript
import { toggleBuilder, openBuilder } from 'verenajs/builder';
import { events } from 'verenajs';

// Open with keyboard shortcut (Ctrl+B) or button
const launchButton = document.createElement('button');
launchButton.textContent = 'Open Visual Builder';
launchButton.onclick = () => openBuilder();
document.body.appendChild(launchButton);

// Listen for builder events
events.on('builder:component-added', ({ node }) => {
  console.log('Component added:', node.type);
});

events.on('builder:component-selected', (component) => {
  console.log('Selected:', component?.type);
});
```

### Export Builder Code

```javascript
import { builderState, generateCode } from 'verenajs/builder';

function exportProject() {
  const code = generateCode(builderState.componentTree);

  // Download as file
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-component.js';
  a.click();
}
```

---

## Mobile App

### Capacitor Integration

```javascript
// index.js
import { createContainer, createButton, createCard } from 'verenajs';

// Check if running in Capacitor
const isNative = window.Capacitor !== undefined;

const app = createContainer();

const card = createCard({
  title: isNative ? 'Mobile App' : 'Web App'
});

// Native camera button
if (isNative) {
  const cameraButton = createButton({
    label: 'Take Photo',
    onClick: async () => {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: 'uri'
      });
      console.log('Photo:', photo);
    }
  });
  card.appendChild(cameraButton);
}

// Native share
const shareButton = createButton({
  label: 'Share',
  onClick: async () => {
    if (isNative) {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: 'Check this out',
        url: 'https://verenajs.dev'
      });
    } else {
      navigator.share?.({ title: 'Check this out', url: 'https://verenajs.dev' });
    }
  }
});

card.appendChild(shareButton);
app.appendChild(card);
document.getElementById('app').appendChild(app);
```

---

## Desktop App

### Electron Integration

```javascript
// renderer.js
import { createCard, createButton, theme } from 'verenajs';

// Use Electron API via preload
const { electronAPI } = window;

theme.set('dark');

const card = createCard({ title: 'Desktop App' });

// Open file dialog
const openButton = createButton({
  label: 'Open File',
  onClick: async () => {
    const result = await electronAPI.openFile({
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] }
      ]
    });
    console.log('Selected:', result);
  }
});

// Save file dialog
const saveButton = createButton({
  label: 'Save File',
  onClick: async () => {
    const result = await electronAPI.saveFile({
      defaultPath: 'document.txt'
    });
    console.log('Save path:', result);
  }
});

// Window controls
const minimizeButton = createButton({
  label: 'Minimize',
  onClick: () => electronAPI.minimize()
});

const maximizeButton = createButton({
  label: 'Maximize',
  onClick: () => electronAPI.maximize()
});

card.appendChild(openButton);
card.appendChild(saveButton);
card.appendChild(minimizeButton);
card.appendChild(maximizeButton);

document.getElementById('app').appendChild(card);

// Listen for theme changes
electronAPI.onThemeChange((newTheme) => {
  theme.set(newTheme);
});
```

---

## Next Steps

- Read the [Usage Guide](USAGE.md) for API details
- Check [Architecture](ARCHITECTURE.md) for internals
- See [Contributing](CONTRIBUTING.md) to add examples
