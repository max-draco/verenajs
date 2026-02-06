/**
 * verenajs E-Commerce Components
 * Shopping cart, checkout, product cards, and more
 */

import styles from './styles.module.css';

// ============================================================================
// Product Card
// ============================================================================

export function createProductCard(props = {}) {
  const {
    id = '',
    name = '',
    price = 0,
    originalPrice = null,
    currency = '$',
    image = null,
    images = [],
    rating = 0,
    reviewCount = 0,
    badge = null, // 'New' | 'Sale' | 'Bestseller' | custom
    inStock = true,
    stockCount = null,
    description = '',
    variant = 'default', // 'default' | 'compact' | 'horizontal'
    onAddToCart = null,
    onQuickView = null,
    onWishlist = null,
    onClick = null
  } = props;

  const card = document.createElement('div');
  card.className = styles.productCard || 'product-card';
  card.dataset.productId = id;

  const isHorizontal = variant === 'horizontal';

  card.style.cssText = `
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    ${isHorizontal ? 'display: flex;' : ''}
    cursor: pointer;
  `;

  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    card.style.transform = 'translateY(-4px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = 'none';
    card.style.transform = 'translateY(0)';
  });

  if (onClick) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) onClick({ id, name, price });
    });
  }

  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = styles.imageContainer || 'product-image';
  imageContainer.style.cssText = `
    position: relative;
    ${isHorizontal ? 'width: 200px; flex-shrink: 0;' : 'aspect-ratio: 1;'}
    background: #f9fafb;
    overflow: hidden;
  `;

  // Main image
  const allImages = image ? [image, ...images] : images;
  let currentImageIndex = 0;

  const img = document.createElement('img');
  img.src = allImages[0] || 'https://via.placeholder.com/300?text=No+Image';
  img.alt = name;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  `;

  imageContainer.appendChild(img);

  // Image dots (if multiple images)
  if (allImages.length > 1) {
    const dots = document.createElement('div');
    dots.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
    `;

    allImages.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.5)'};
        transition: background 0.2s;
      `;
      dots.appendChild(dot);
    });

    imageContainer.appendChild(dots);

    // Image carousel on hover
    imageContainer.addEventListener('mousemove', (e) => {
      const rect = imageContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const segment = rect.width / allImages.length;
      const newIndex = Math.floor(x / segment);

      if (newIndex !== currentImageIndex && newIndex < allImages.length) {
        currentImageIndex = newIndex;
        img.src = allImages[currentImageIndex];
        dots.querySelectorAll('div').forEach((d, i) => {
          d.style.background = i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)';
        });
      }
    });
  }

  // Badge
  if (badge) {
    const badgeEl = document.createElement('div');
    badgeEl.style.cssText = `
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      ${badge === 'Sale' ? 'background: #ef4444; color: white;' :
        badge === 'New' ? 'background: #10b981; color: white;' :
        badge === 'Bestseller' ? 'background: #f59e0b; color: white;' :
        'background: #3b82f6; color: white;'}
    `;
    badgeEl.textContent = badge;
    imageContainer.appendChild(badgeEl);
  }

  // Quick actions
  const actions = document.createElement('div');
  actions.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  `;

  const createActionBtn = (icon, title, onClick) => {
    const btn = document.createElement('button');
    btn.title = title;
    btn.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: white;
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    btn.innerHTML = icon;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#3b82f6';
      btn.style.color = 'white';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'white';
      btn.style.color = 'inherit';
    });
    return btn;
  };

  if (onWishlist) {
    actions.appendChild(createActionBtn('❤️', 'Add to wishlist', onWishlist));
  }
  if (onQuickView) {
    actions.appendChild(createActionBtn('👁️', 'Quick view', onQuickView));
  }

  imageContainer.appendChild(actions);

  imageContainer.addEventListener('mouseenter', () => {
    actions.style.opacity = '1';
    img.style.transform = 'scale(1.05)';
  });
  imageContainer.addEventListener('mouseleave', () => {
    actions.style.opacity = '0';
    img.style.transform = 'scale(1)';
  });

  card.appendChild(imageContainer);

  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 16px;
    ${isHorizontal ? 'flex: 1; display: flex; flex-direction: column;' : ''}
  `;

  // Name
  const nameEl = document.createElement('h3');
  nameEl.style.cssText = `
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 500;
    color: #111827;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;
  nameEl.textContent = name;
  content.appendChild(nameEl);

  // Description (horizontal only)
  if (isHorizontal && description) {
    const descEl = document.createElement('p');
    descEl.style.cssText = `
      margin: 0 0 12px;
      font-size: 13px;
      color: #6b7280;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    `;
    descEl.textContent = description;
    content.appendChild(descEl);
  }

  // Rating
  if (rating > 0) {
    const ratingEl = document.createElement('div');
    ratingEl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    `;

    const stars = document.createElement('div');
    stars.style.cssText = 'display: flex; gap: 1px;';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.style.cssText = `
        font-size: 14px;
        color: ${i <= rating ? '#f59e0b' : '#d1d5db'};
      `;
      star.textContent = '★';
      stars.appendChild(star);
    }
    ratingEl.appendChild(stars);

    if (reviewCount > 0) {
      const count = document.createElement('span');
      count.style.cssText = 'font-size: 12px; color: #6b7280;';
      count.textContent = `(${reviewCount})`;
      ratingEl.appendChild(count);
    }

    content.appendChild(ratingEl);
  }

  // Price
  const priceRow = document.createElement('div');
  priceRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    ${isHorizontal ? 'margin-top: auto;' : ''}
  `;

  const priceEl = document.createElement('span');
  priceEl.style.cssText = 'font-size: 18px; font-weight: 600; color: #111827;';
  priceEl.textContent = `${currency}${price.toFixed(2)}`;
  priceRow.appendChild(priceEl);

  if (originalPrice && originalPrice > price) {
    const originalEl = document.createElement('span');
    originalEl.style.cssText = 'font-size: 14px; color: #9ca3af; text-decoration: line-through;';
    originalEl.textContent = `${currency}${originalPrice.toFixed(2)}`;
    priceRow.appendChild(originalEl);

    const discount = Math.round((1 - price / originalPrice) * 100);
    const discountEl = document.createElement('span');
    discountEl.style.cssText = 'font-size: 12px; color: #ef4444; font-weight: 500;';
    discountEl.textContent = `-${discount}%`;
    priceRow.appendChild(discountEl);
  }

  content.appendChild(priceRow);

  // Stock status
  if (!inStock || (stockCount !== null && stockCount < 10)) {
    const stockEl = document.createElement('div');
    stockEl.style.cssText = `
      margin-top: 8px;
      font-size: 12px;
      ${!inStock ? 'color: #ef4444;' : 'color: #f59e0b;'}
    `;
    stockEl.textContent = !inStock ? 'Out of stock' : `Only ${stockCount} left`;
    content.appendChild(stockEl);
  }

  // Add to cart button
  if (onAddToCart && variant !== 'compact') {
    const addBtn = document.createElement('button');
    addBtn.style.cssText = `
      width: 100%;
      margin-top: 12px;
      padding: 10px;
      background: ${inStock ? '#111827' : '#d1d5db'};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: ${inStock ? 'pointer' : 'not-allowed'};
      transition: background 0.2s;
    `;
    addBtn.textContent = inStock ? 'Add to Cart' : 'Out of Stock';
    addBtn.disabled = !inStock;

    if (inStock) {
      addBtn.addEventListener('mouseenter', () => addBtn.style.background = '#374151');
      addBtn.addEventListener('mouseleave', () => addBtn.style.background = '#111827');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onAddToCart({ id, name, price, image: allImages[0] });
      });
    }

    content.appendChild(addBtn);
  }

  card.appendChild(content);

  return card;
}

// ============================================================================
// Shopping Cart
// ============================================================================

export function createShoppingCart(props = {}) {
  const {
    items = [],
    currency = '$',
    onUpdateQuantity = null,
    onRemove = null,
    onCheckout = null,
    onContinueShopping = null,
    showSummary = true,
    taxRate = 0,
    shippingCost = 0,
    freeShippingThreshold = 0
  } = props;

  const container = document.createElement('div');
  container.className = styles.shoppingCart || 'shopping-cart';
  container.style.cssText = `
    display: flex;
    gap: 24px;
    ${showSummary ? '' : 'flex-direction: column;'}
  `;

  let cartItems = [...items];

  // Items list
  const itemsList = document.createElement('div');
  itemsList.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;

  // Summary sidebar
  let summary = null;
  if (showSummary) {
    summary = document.createElement('div');
    summary.className = styles.cartSummary || 'cart-summary';
    summary.style.cssText = `
      width: 320px;
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      height: fit-content;
      position: sticky;
      top: 20px;
    `;
  }

  function render() {
    // Render items
    itemsList.innerHTML = '';

    if (cartItems.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
      `;
      empty.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 16px;">🛒</div>
        <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px; color: #111827;">Your cart is empty</div>
        <div style="margin-bottom: 20px;">Add some items to get started</div>
        ${onContinueShopping ? `<button class="continue-btn" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        ">Continue Shopping</button>` : ''}
      `;

      const continueBtn = empty.querySelector('.continue-btn');
      if (continueBtn) {
        continueBtn.addEventListener('click', onContinueShopping);
      }

      itemsList.appendChild(empty);
    } else {
      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
      `;
      header.innerHTML = `
        <h2 style="margin: 0; font-size: 20px; color: #111827;">Shopping Cart</h2>
        <span style="color: #6b7280; font-size: 14px;">${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}</span>
      `;
      itemsList.appendChild(header);

      // Items
      cartItems.forEach(item => {
        const itemEl = createCartItem(item);
        itemsList.appendChild(itemEl);
      });
    }

    // Update summary
    if (summary) {
      renderSummary();
    }
  }

  function createCartItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = styles.cartItem || 'cart-item';
    itemEl.style.cssText = `
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    `;

    // Image
    const image = document.createElement('img');
    image.src = item.image || 'https://via.placeholder.com/100';
    image.alt = item.name;
    image.style.cssText = `
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      background: #f9fafb;
    `;
    itemEl.appendChild(image);

    // Details
    const details = document.createElement('div');
    details.style.cssText = 'flex: 1; display: flex; flex-direction: column;';

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-weight: 500; color: #111827; margin-bottom: 4px;';
    nameEl.textContent = item.name;
    details.appendChild(nameEl);

    if (item.variant) {
      const variantEl = document.createElement('div');
      variantEl.style.cssText = 'font-size: 13px; color: #6b7280; margin-bottom: 8px;';
      variantEl.textContent = item.variant;
      details.appendChild(variantEl);
    }

    // Quantity controls
    const quantityRow = document.createElement('div');
    quantityRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: auto;';

    const quantityControl = document.createElement('div');
    quantityControl.style.cssText = `
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      overflow: hidden;
    `;

    const createQtyBtn = (text, onClick) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width: 32px;
        height: 32px;
        background: #f9fafb;
        border: none;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.2s;
      `;
      btn.textContent = text;
      btn.addEventListener('click', onClick);
      btn.addEventListener('mouseenter', () => btn.style.background = '#e5e7eb');
      btn.addEventListener('mouseleave', () => btn.style.background = '#f9fafb');
      return btn;
    };

    quantityControl.appendChild(createQtyBtn('−', () => {
      if (item.quantity > 1) {
        item.quantity--;
        render();
        if (onUpdateQuantity) onUpdateQuantity(item.id, item.quantity);
      }
    }));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.style.cssText = 'padding: 0 12px; font-size: 14px;';
    qtyDisplay.textContent = item.quantity;
    quantityControl.appendChild(qtyDisplay);

    quantityControl.appendChild(createQtyBtn('+', () => {
      item.quantity++;
      render();
      if (onUpdateQuantity) onUpdateQuantity(item.id, item.quantity);
    }));

    quantityRow.appendChild(quantityControl);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.style.cssText = `
      background: none;
      border: none;
      color: #ef4444;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      cartItems = cartItems.filter(i => i.id !== item.id);
      render();
      if (onRemove) onRemove(item.id);
    });
    removeBtn.addEventListener('mouseenter', () => removeBtn.style.background = '#fef2f2');
    removeBtn.addEventListener('mouseleave', () => removeBtn.style.background = 'none');
    quantityRow.appendChild(removeBtn);

    details.appendChild(quantityRow);
    itemEl.appendChild(details);

    // Price
    const priceEl = document.createElement('div');
    priceEl.style.cssText = 'text-align: right;';

    const itemTotal = document.createElement('div');
    itemTotal.style.cssText = 'font-weight: 600; color: #111827;';
    itemTotal.textContent = `${currency}${(item.price * item.quantity).toFixed(2)}`;
    priceEl.appendChild(itemTotal);

    if (item.quantity > 1) {
      const unitPrice = document.createElement('div');
      unitPrice.style.cssText = 'font-size: 12px; color: #6b7280;';
      unitPrice.textContent = `${currency}${item.price.toFixed(2)} each`;
      priceEl.appendChild(unitPrice);
    }

    itemEl.appendChild(priceEl);

    return itemEl;
  }

  function renderSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * taxRate;
    const shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : shippingCost;
    const total = subtotal + tax + shipping;

    summary.innerHTML = `
      <h3 style="margin: 0 0 20px; font-size: 18px; color: #111827;">Order Summary</h3>

      <div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 14px;">
          <span>Subtotal</span>
          <span>${currency}${subtotal.toFixed(2)}</span>
        </div>

        ${shippingCost > 0 ? `
          <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 14px;">
            <span>Shipping</span>
            <span>${shipping === 0 ? '<span style="color: #10b981;">FREE</span>' : `${currency}${shipping.toFixed(2)}`}</span>
          </div>
        ` : ''}

        ${taxRate > 0 ? `
          <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 14px;">
            <span>Tax</span>
            <span>${currency}${tax.toFixed(2)}</span>
          </div>
        ` : ''}
      </div>

      ${freeShippingThreshold > 0 && subtotal < freeShippingThreshold ? `
        <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">
          Add ${currency}${(freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 18px; font-weight: 600; color: #111827;">
        <span>Total</span>
        <span>${currency}${total.toFixed(2)}</span>
      </div>

      ${cartItems.length > 0 ? `
        <button class="checkout-btn" style="
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        ">Proceed to Checkout</button>
      ` : ''}

      ${onContinueShopping ? `
        <button class="continue-btn" style="
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          background: none;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        ">Continue Shopping</button>
      ` : ''}
    `;

    const checkoutBtn = summary.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('mouseenter', () => checkoutBtn.style.background = '#374151');
      checkoutBtn.addEventListener('mouseleave', () => checkoutBtn.style.background = '#111827');
      checkoutBtn.addEventListener('click', () => {
        if (onCheckout) onCheckout({ items: cartItems, subtotal, tax, shipping, total });
      });
    }

    const continueBtn = summary.querySelector('.continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', onContinueShopping);
    }
  }

  container.appendChild(itemsList);
  if (summary) container.appendChild(summary);

  render();

  // API
  container.addItem = (item) => {
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cartItems.push({ ...item, quantity: item.quantity || 1 });
    }
    render();
  };

  container.removeItem = (id) => {
    cartItems = cartItems.filter(i => i.id !== id);
    render();
  };

  container.updateQuantity = (id, quantity) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      render();
    }
  };

  container.clear = () => {
    cartItems = [];
    render();
  };

  container.getItems = () => [...cartItems];
  container.getTotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return container;
}

// ============================================================================
// Checkout Form
// ============================================================================

export function createCheckoutForm(props = {}) {
  const {
    onSubmit = null,
    onBack = null,
    showShipping = true,
    showBilling = true,
    showPayment = true,
    savedAddresses = [],
    savedCards = []
  } = props;

  const container = document.createElement('div');
  container.className = styles.checkoutForm || 'checkout-form';
  container.style.cssText = `
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  `;

  const formData = {
    shipping: {},
    billing: {},
    payment: {},
    sameAsShipping: true
  };

  // Section component
  function createSection(title, content) {
    const section = document.createElement('div');
    section.className = styles.checkoutSection || 'checkout-section';
    section.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px 20px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #111827;
    `;
    header.textContent = title;
    section.appendChild(header);

    const body = document.createElement('div');
    body.style.cssText = 'padding: 20px;';
    body.appendChild(content);
    section.appendChild(body);

    return section;
  }

  // Input field
  function createField(label, name, type = 'text', options = {}) {
    const field = document.createElement('div');
    field.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
      ${options.halfWidth ? 'flex: 1;' : 'width: 100%;'}
    `;

    const labelEl = document.createElement('label');
    labelEl.style.cssText = 'font-size: 13px; font-weight: 500; color: #374151;';
    labelEl.textContent = label;
    if (options.required) {
      labelEl.innerHTML += '<span style="color: #ef4444;">*</span>';
    }
    field.appendChild(labelEl);

    let input;

    if (type === 'select' && options.options) {
      input = document.createElement('select');
      options.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = typeof opt === 'string' ? opt : opt.value;
        option.textContent = typeof opt === 'string' ? opt : opt.label;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = type;
      if (options.placeholder) input.placeholder = options.placeholder;
      if (options.pattern) input.pattern = options.pattern;
      if (options.maxLength) input.maxLength = options.maxLength;
    }

    input.name = name;
    input.required = options.required || false;
    input.style.cssText = `
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    `;

    input.addEventListener('focus', () => {
      input.style.borderColor = '#3b82f6';
      input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = '#d1d5db';
      input.style.boxShadow = 'none';
    });

    field.appendChild(input);

    return field;
  }

  // Shipping address
  if (showShipping) {
    const shippingContent = document.createElement('div');
    shippingContent.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Saved addresses
    if (savedAddresses.length > 0) {
      const savedSection = document.createElement('div');
      savedSection.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;';

      savedAddresses.forEach((addr, i) => {
        const option = document.createElement('label');
        option.style.cssText = `
          display: flex;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s;
        `;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'savedShipping';
        radio.value = i;
        if (i === 0) radio.checked = true;

        option.innerHTML = `
          <div style="flex: 1;">
            <div style="font-weight: 500; color: #111827;">${addr.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${addr.address}, ${addr.city} ${addr.zip}</div>
          </div>
        `;
        option.prepend(radio);

        option.addEventListener('click', () => {
          option.style.borderColor = '#3b82f6';
          savedSection.querySelectorAll('label').forEach(l => {
            if (l !== option) l.style.borderColor = '#e5e7eb';
          });
        });

        savedSection.appendChild(option);
      });

      shippingContent.appendChild(savedSection);
    }

    // New address form
    const row1 = document.createElement('div');
    row1.style.cssText = 'display: flex; gap: 12px;';
    row1.appendChild(createField('First Name', 'firstName', 'text', { halfWidth: true, required: true }));
    row1.appendChild(createField('Last Name', 'lastName', 'text', { halfWidth: true, required: true }));
    shippingContent.appendChild(row1);

    shippingContent.appendChild(createField('Address', 'address', 'text', { required: true, placeholder: 'Street address' }));
    shippingContent.appendChild(createField('Apartment, suite, etc.', 'address2', 'text', { placeholder: 'Optional' }));

    const row2 = document.createElement('div');
    row2.style.cssText = 'display: flex; gap: 12px;';
    row2.appendChild(createField('City', 'city', 'text', { halfWidth: true, required: true }));
    row2.appendChild(createField('ZIP Code', 'zip', 'text', { halfWidth: true, required: true }));
    shippingContent.appendChild(row2);

    shippingContent.appendChild(createField('Country', 'country', 'select', {
      required: true,
      options: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France']
    }));

    shippingContent.appendChild(createField('Phone', 'phone', 'tel', { placeholder: '+1 (555) 000-0000' }));

    container.appendChild(createSection('Shipping Address', shippingContent));
  }

  // Billing address
  if (showBilling) {
    const billingContent = document.createElement('div');
    billingContent.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Same as shipping checkbox
    const sameAs = document.createElement('label');
    sameAs.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer;';
    sameAs.innerHTML = `
      <input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer;" />
      <span style="font-size: 14px; color: #374151;">Same as shipping address</span>
    `;

    const checkbox = sameAs.querySelector('input');
    const billingFields = document.createElement('div');
    billingFields.style.cssText = 'display: none; flex-direction: column; gap: 16px; margin-top: 16px;';

    checkbox.addEventListener('change', () => {
      formData.sameAsShipping = checkbox.checked;
      billingFields.style.display = checkbox.checked ? 'none' : 'flex';
    });

    // Billing fields (same as shipping)
    const row1 = document.createElement('div');
    row1.style.cssText = 'display: flex; gap: 12px;';
    row1.appendChild(createField('First Name', 'billingFirstName', 'text', { halfWidth: true, required: true }));
    row1.appendChild(createField('Last Name', 'billingLastName', 'text', { halfWidth: true, required: true }));
    billingFields.appendChild(row1);

    billingFields.appendChild(createField('Address', 'billingAddress', 'text', { required: true }));

    const row2 = document.createElement('div');
    row2.style.cssText = 'display: flex; gap: 12px;';
    row2.appendChild(createField('City', 'billingCity', 'text', { halfWidth: true, required: true }));
    row2.appendChild(createField('ZIP Code', 'billingZip', 'text', { halfWidth: true, required: true }));
    billingFields.appendChild(row2);

    billingContent.appendChild(sameAs);
    billingContent.appendChild(billingFields);

    container.appendChild(createSection('Billing Address', billingContent));
  }

  // Payment
  if (showPayment) {
    const paymentContent = document.createElement('div');
    paymentContent.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Saved cards
    if (savedCards.length > 0) {
      const savedSection = document.createElement('div');
      savedSection.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;';

      savedCards.forEach((card, i) => {
        const option = document.createElement('label');
        option.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
        `;
        option.innerHTML = `
          <input type="radio" name="savedCard" value="${i}" ${i === 0 ? 'checked' : ''} />
          <span style="font-size: 20px;">${card.brand === 'visa' ? '💳' : '💳'}</span>
          <span style="flex: 1;">•••• ${card.last4}</span>
          <span style="color: #6b7280; font-size: 13px;">Expires ${card.expiry}</span>
        `;
        savedSection.appendChild(option);
      });

      paymentContent.appendChild(savedSection);
    }

    // New card form
    paymentContent.appendChild(createField('Card Number', 'cardNumber', 'text', {
      required: true,
      placeholder: '1234 5678 9012 3456',
      maxLength: 19
    }));

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 12px;';
    row.appendChild(createField('Expiry', 'expiry', 'text', { halfWidth: true, required: true, placeholder: 'MM/YY' }));
    row.appendChild(createField('CVC', 'cvc', 'text', { halfWidth: true, required: true, placeholder: '123', maxLength: 4 }));
    paymentContent.appendChild(row);

    paymentContent.appendChild(createField('Cardholder Name', 'cardName', 'text', { required: true }));

    container.appendChild(createSection('Payment', paymentContent));
  }

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; gap: 12px; justify-content: space-between;';

  if (onBack) {
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      padding: 14px 24px;
      background: none;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    backBtn.textContent = 'Back';
    backBtn.addEventListener('click', onBack);
    actions.appendChild(backBtn);
  }

  const submitBtn = document.createElement('button');
  submitBtn.style.cssText = `
    flex: 1;
    padding: 14px 24px;
    background: #111827;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  `;
  submitBtn.textContent = 'Place Order';
  submitBtn.addEventListener('mouseenter', () => submitBtn.style.background = '#374151');
  submitBtn.addEventListener('mouseleave', () => submitBtn.style.background = '#111827');
  submitBtn.addEventListener('click', () => {
    // Collect form data
    container.querySelectorAll('input, select').forEach(input => {
      if (input.name) {
        const section = input.closest('.checkout-section');
        const sectionName = section?.querySelector('div')?.textContent?.toLowerCase()?.includes('shipping') ? 'shipping' :
                           section?.querySelector('div')?.textContent?.toLowerCase()?.includes('billing') ? 'billing' : 'payment';
        formData[sectionName][input.name] = input.value;
      }
    });

    if (onSubmit) onSubmit(formData);
  });
  actions.appendChild(submitBtn);

  container.appendChild(actions);

  // API
  container.getData = () => formData;
  container.validate = () => {
    const inputs = container.querySelectorAll('input[required], select[required]');
    return Array.from(inputs).every(input => input.value.trim() !== '');
  };

  return container;
}

// ============================================================================
// Price Display
// ============================================================================

export function createPriceDisplay(props = {}) {
  const {
    price = 0,
    originalPrice = null,
    currency = '$',
    size = 'medium', // 'small' | 'medium' | 'large'
    showDiscount = true
  } = props;

  const container = document.createElement('div');
  container.className = styles.priceDisplay || 'price-display';

  const sizes = {
    small: { price: 16, original: 12 },
    medium: { price: 24, original: 14 },
    large: { price: 32, original: 16 }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  container.style.cssText = 'display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;';

  const priceEl = document.createElement('span');
  priceEl.style.cssText = `
    font-size: ${sizeConfig.price}px;
    font-weight: 600;
    color: #111827;
  `;
  priceEl.textContent = `${currency}${price.toFixed(2)}`;
  container.appendChild(priceEl);

  if (originalPrice && originalPrice > price) {
    const originalEl = document.createElement('span');
    originalEl.style.cssText = `
      font-size: ${sizeConfig.original}px;
      color: #9ca3af;
      text-decoration: line-through;
    `;
    originalEl.textContent = `${currency}${originalPrice.toFixed(2)}`;
    container.appendChild(originalEl);

    if (showDiscount) {
      const discount = Math.round((1 - price / originalPrice) * 100);
      const discountEl = document.createElement('span');
      discountEl.style.cssText = `
        font-size: ${sizeConfig.original}px;
        font-weight: 500;
        color: #ef4444;
        background: #fef2f2;
        padding: 2px 6px;
        border-radius: 4px;
      `;
      discountEl.textContent = `-${discount}%`;
      container.appendChild(discountEl);
    }
  }

  // API
  container.setPrice = (newPrice, newOriginal) => {
    priceEl.textContent = `${currency}${newPrice.toFixed(2)}`;
    // Update other elements...
  };

  return container;
}

// ============================================================================
// Quantity Selector
// ============================================================================

export function createQuantitySelector(props = {}) {
  const {
    value = 1,
    min = 1,
    max = 99,
    onChange = null,
    size = 'medium' // 'small' | 'medium' | 'large'
  } = props;

  const container = document.createElement('div');
  container.className = styles.quantitySelector || 'quantity-selector';

  const sizes = {
    small: { btn: 28, font: 13 },
    medium: { btn: 36, font: 14 },
    large: { btn: 44, font: 16 }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  container.style.cssText = `
    display: flex;
    align-items: center;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  `;

  let currentValue = value;

  const createBtn = (text, onClick) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      width: ${sizeConfig.btn}px;
      height: ${sizeConfig.btn}px;
      background: #f9fafb;
      border: none;
      cursor: pointer;
      font-size: ${sizeConfig.font}px;
      transition: background 0.2s;
    `;
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    btn.addEventListener('mouseenter', () => btn.style.background = '#e5e7eb');
    btn.addEventListener('mouseleave', () => btn.style.background = '#f9fafb');
    return btn;
  };

  const minusBtn = createBtn('−', () => {
    if (currentValue > min) {
      currentValue--;
      update();
    }
  });
  container.appendChild(minusBtn);

  const display = document.createElement('span');
  display.style.cssText = `
    min-width: ${sizeConfig.btn}px;
    text-align: center;
    font-size: ${sizeConfig.font}px;
    font-weight: 500;
    padding: 0 8px;
  `;
  display.textContent = currentValue;
  container.appendChild(display);

  const plusBtn = createBtn('+', () => {
    if (currentValue < max) {
      currentValue++;
      update();
    }
  });
  container.appendChild(plusBtn);

  function update() {
    display.textContent = currentValue;
    minusBtn.disabled = currentValue <= min;
    plusBtn.disabled = currentValue >= max;
    minusBtn.style.opacity = currentValue <= min ? '0.5' : '1';
    plusBtn.style.opacity = currentValue >= max ? '0.5' : '1';
    if (onChange) onChange(currentValue);
  }

  update();

  // API
  container.getValue = () => currentValue;
  container.setValue = (val) => {
    currentValue = Math.max(min, Math.min(max, val));
    update();
  };

  return container;
}

// Export all
export default {
  createProductCard,
  createShoppingCart,
  createCheckoutForm,
  createPriceDisplay,
  createQuantitySelector
};
