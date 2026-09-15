/**
 * Madhuraj Sweet House - Unified Frontend Application Logic
 * Integrates with Node.js/Express REST Backend, SQLite DB, JWT Auth, and Cart/Order System.
 */

// Global State
const API_BASE = '/api';
const CART_STORAGE_KEY = 'madhuraj_cart_v3';
const TOKEN_STORAGE_KEY = 'madhuraj_token';
const USER_STORAGE_KEY = 'madhuraj_user';

let currentCart = [];
let appliedCoupon = null;
let allCatalogProducts = [];

// ==========================================================================
// 1. Toast Notification System
// ==========================================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fas ${iconMap[type] || 'fa-bell'}" style="color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================================
// 2. Authentication & User Session
// ==========================================================================
function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  updateNavAuthState();
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  updateNavAuthState();
  showToast('You have been logged out.', 'info');
}

function updateNavAuthState() {
  const user = getCurrentUser();
  const profileBtn = document.getElementById('profile-btn');
  const userGreeting = document.getElementById('user-nav-greeting');

  if (profileBtn) {
    if (user) {
      profileBtn.innerHTML = '<i class="fas fa-user-check"></i>';
      profileBtn.title = `Logged in as ${user.name} (Click to Logout)`;
      if (userGreeting) {
        userGreeting.innerHTML = `
          <span class="user-display-name">Hi, ${user.name.split(' ')[0]}</span>
          ${user.role === 'admin' ? '<a href="admin.html" class="admin-header-badge" style="margin-left:6px;">Admin</a>' : ''}
          <button onclick="clearAuthSession()" class="btn btn-sm btn-secondary" style="padding:4px 10px; font-size:0.75rem; margin-left:8px;">Logout</button>
        `;
      }
    } else {
      profileBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
      profileBtn.title = 'Login / Register';
      if (userGreeting) {
        userGreeting.innerHTML = '';
      }
    }
  }
}

// ==========================================================================
// 3. Cart State & Storage
// ==========================================================================
function loadCart() {
  try {
    currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch (e) {
    currentCart = [];
  }
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    const totalCount = currentCart.reduce((acc, item) => acc + item.quantity, 0);
    badge.textContent = totalCount;
  }
}

function addToCart(product, weight = '500g', quantity = 1) {
  let priceMultiplier = 1;
  if (weight.includes('250g')) priceMultiplier = 0.55;
  else if (weight.includes('1kg')) priceMultiplier = 1.95;
  else if (weight.includes('2kg')) priceMultiplier = 1.9;

  const unitPrice = Math.round(product.price * priceMultiplier);
  const cartItemId = `${product.id}_${weight}`;

  const existing = currentCart.find(item => item.cartItemId === cartItemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    currentCart.push({
      cartItemId,
      id: product.id,
      name: product.name,
      category: product.category,
      price: unitPrice,
      basePrice: product.price,
      weight,
      quantity,
      image: product.image
    });
  }

  saveCart();
  showToast(`Added ${quantity}x ${product.name} (${weight}) to your cart! 🍬`, 'success');
  openCartDrawer();
}

function updateCartQty(cartItemId, delta) {
  const itemIndex = currentCart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex > -1) {
    currentCart[itemIndex].quantity += delta;
    if (currentCart[itemIndex].quantity <= 0) {
      currentCart.splice(itemIndex, 1);
    }
    saveCart();
  }
}

function removeFromCart(cartItemId) {
  currentCart = currentCart.filter(item => item.cartItemId !== cartItemId);
  saveCart();
  showToast('Item removed from cart.', 'info');
}

// ==========================================================================
// 4. Cart Drawer Rendering & Coupon Logic
// ==========================================================================
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('open');
    backdrop.classList.add('active');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
  }
}

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  const discountRow = document.getElementById('cart-drawer-discount-row');
  const discountEl = document.getElementById('cart-drawer-discount');
  const totalEl = document.getElementById('cart-drawer-total');
  const checkoutBtn = document.getElementById('drawer-checkout-btn');

  if (!body) return;

  if (currentCart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-view">
        <i class="fas fa-shopping-basket"></i>
        <h3>Your sweet box is empty</h3>
        <p>Explore our handcrafted traditional mithais and add some sweetness to your day.</p>
        <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:16px;">Browse Sweets</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (discountRow) discountRow.style.display = 'none';
    if (totalEl) totalEl.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let subtotal = 0;
  body.innerHTML = currentCart.map(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    return `
      <div class="cart-item-row" data-id="${item.cartItemId}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-weight"><i class="fas fa-weight-hanging"></i> ${item.weight}</span>
          <div class="cart-item-price">₹${item.price} x ${item.quantity} = <strong>₹${lineTotal}</strong></div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn" onclick="updateCartQty('${item.cartItemId}', -1)">-</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${item.cartItemId}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')" title="Remove">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  let discount = 0;
  if (appliedCoupon) {
    discount = Math.round((subtotal * appliedCoupon.discount_percent) / 100);
    if (discountRow) discountRow.style.display = 'flex';
    if (discountEl) discountEl.textContent = `- ₹${discount}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }

  const total = Math.max(0, subtotal - discount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

async function applyPromoCoupon() {
  const input = document.getElementById('coupon-input');
  const msgEl = document.getElementById('coupon-msg');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code.', 'error');
    return;
  }

  const subtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();

    if (data.success) {
      appliedCoupon = data;
      if (msgEl) {
        msgEl.textContent = data.message;
        msgEl.className = 'coupon-msg success';
      }
      showToast(data.message, 'success');
      renderCartDrawer();
    } else {
      appliedCoupon = null;
      if (msgEl) {
        msgEl.textContent = data.message;
        msgEl.className = 'coupon-msg error';
      }
      showToast(data.message, 'error');
      renderCartDrawer();
    }
  } catch (e) {
    showToast('Failed to validate coupon.', 'error');
  }
}

// ==========================================================================
// 5. Modals Management (Auth, Quick View, Checkout, Order Confirmation)
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Setup Auth Tabs
function switchAuthTab(mode) {
  const loginForm = document.getElementById('login-form-container');
  const regForm = document.getElementById('register-form-container');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabReg = document.getElementById('tab-register-btn');

  if (mode === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabReg) tabReg.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabReg) tabReg.classList.add('active');
  }
}

// Quick View Modal
function openQuickView(productId) {
  const product = allCatalogProducts.find(p => p.id === productId);
  if (!product) return;

  const modalBody = document.getElementById('quick-view-body');
  if (!modalBody) return;

  const weights = product.weight_options || ['250g', '500g', '1kg'];
  let selectedWeight = weights[0];

  const updateModalPrice = (weight) => {
    selectedWeight = weight;
    let mult = 1;
    if (weight.includes('250g')) mult = 0.55;
    else if (weight.includes('1kg')) mult = 1.95;
    const computedPrice = Math.round(product.price * mult);
    const priceEl = document.getElementById('qv-price');
    if (priceEl) priceEl.textContent = `₹${computedPrice}`;
  };

  modalBody.innerHTML = `
    <div class="quick-view-grid">
      <div>
        <img src="${product.image}" alt="${product.name}" class="quick-view-img">
      </div>
      <div>
        <span class="badge-bestseller" style="position:static; margin-bottom:10px; display:inline-block;">${product.category.toUpperCase()}</span>
        <h3 style="font-size:1.5rem; margin-bottom:6px;">${product.name}</h3>
        <div class="product-rating" style="margin-bottom:12px;">
          <i class="fas fa-star"></i> <span>${product.rating || '4.8'} (${product.reviews_count || 20} customer reviews)</span>
        </div>
        <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:14px;">${product.description}</p>
        
        <div style="background:#FAF5EF; padding:12px; border-radius:6px; margin-bottom:14px; font-size:0.85rem;">
          <p><strong><i class="fas fa-seedling" style="color:var(--accent-dark);"></i> Ingredients:</strong> ${product.ingredients || 'Pure Desi Ghee, Traditional Ingredients'}</p>
          <p style="margin-top:4px;"><strong><i class="fas fa-calendar-alt" style="color:var(--accent-dark);"></i> Shelf Life:</strong> ${product.shelf_life || '15 Days'}</p>
        </div>

        <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:6px;">SELECT WEIGHT / PACK SIZE:</label>
        <div class="weight-selector" id="qv-weights">
          ${weights.map((w, idx) => `
            <button class="weight-chip ${idx === 0 ? 'active' : ''}" onclick="window.handleQvWeight('${w}', this)">${w}</button>
          `).join('')}
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:16px; border-top:1px dashed #E5DCD2;">
          <div>
            <span style="font-size:0.8rem; color:#888; display:block;">PRICE:</span>
            <span id="qv-price" style="font-size:1.6rem; font-weight:800; color:var(--primary);">₹${Math.round(product.price * (weights[0].includes('250g') ? 0.55 : 1))}</span>
          </div>
          <button class="btn btn-primary" id="qv-add-btn">
            <i class="fas fa-cart-plus"></i> Add to Box
          </button>
        </div>
      </div>
    </div>
  `;

  window.handleQvWeight = (weight, btn) => {
    document.querySelectorAll('#qv-weights .weight-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateModalPrice(weight);
  };

  document.getElementById('qv-add-btn').onclick = () => {
    addToCart(product, selectedWeight, 1);
    closeModal('modal-quick-view');
  };

  openModal('modal-quick-view');
}

// Checkout Modal
function openCheckoutModal() {
  if (currentCart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCartDrawer();

  const user = getCurrentUser();
  if (user) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const addrInput = document.getElementById('checkout-address');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput && user.phone) phoneInput.value = user.phone;
    if (addrInput && user.address) addrInput.value = user.address;
  }

  // Calculate totals
  const subtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = Math.round((subtotal * appliedCoupon.discount_percent) / 100);
  }
  const total = Math.max(0, subtotal - discount);

  const subtotalDisplay = document.getElementById('checkout-subtotal');
  const discountDisplay = document.getElementById('checkout-discount');
  const totalDisplay = document.getElementById('checkout-total');

  if (subtotalDisplay) subtotalDisplay.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discountDisplay) discountDisplay.textContent = `₹${discount.toLocaleString('en-IN')}`;
  if (totalDisplay) totalDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;

  openModal('modal-checkout');
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
  }

  const name = document.getElementById('checkout-name').value;
  const email = document.getElementById('checkout-email').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const city = document.getElementById('checkout-city').value;
  const postalCode = document.getElementById('checkout-pincode').value;
  const notes = document.getElementById('checkout-notes')?.value || '';

  const paymentOption = document.querySelector('input[name="payment_method"]:checked')?.value || 'Cash on Delivery';

  const orderPayload = {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    delivery_address: address,
    city: city,
    postal_code: postalCode,
    items: currentCart,
    coupon_code: appliedCoupon ? appliedCoupon.code : null,
    payment_method: paymentOption,
    notes: notes
  };

  try {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (data.success) {
      // Clear Cart
      currentCart = [];
      appliedCoupon = null;
      saveCart();

      closeModal('modal-checkout');

      // Open Success Celebration Modal
      const confModal = document.getElementById('modal-order-success');
      if (confModal) {
        document.getElementById('confirmed-tracking-id').textContent = data.tracking_code;
        document.getElementById('confirmed-order-total').textContent = `₹${data.total}`;
        document.getElementById('confirmed-track-btn').onclick = () => {
          window.location.href = `trackorder.html?orderId=${data.tracking_code}`;
        };
        openModal('modal-order-success');
      } else {
        showToast(`Order Placed! Your Tracking ID: ${data.tracking_code}`, 'success');
        setTimeout(() => {
          window.location.href = `trackorder.html?orderId=${data.tracking_code}`;
        }, 1500);
      }
    } else {
      showToast(data.message || 'Failed to place order.', 'error');
    }
  } catch (err) {
    showToast('Network error while processing order.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Confirm & Place Order';
    }
  }
}

// ==========================================================================
// 6. Products Catalog & Card Renderer
// ==========================================================================
function createProductCardHTML(product) {
  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-image-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.is_bestseller ? '<span class="badge-bestseller">Bestseller ★</span>' : ''}
        <span class="badge-category">${product.category}</span>
      </div>
      <div class="product-details">
        <div class="product-rating">
          <i class="fas fa-star"></i>
          <span>${product.rating || '4.8'}</span>
          <span class="rating-count">(${product.reviews_count || 15})</span>
        </div>
        <h4 class="product-name">${product.name}</h4>
        <p class="product-description">${product.description}</p>
        <div class="product-meta">
          <div class="product-price">
            ₹${product.price} <small>/ 500g</small>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" onclick="openQuickView(${product.id})" title="Quick View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")}, "500g", 1)'>
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 7. Page Initializers
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  loadCart();
  updateNavAuthState();

  // Attach Header Action Handlers
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.onclick = openCartDrawer;

  const closeCartBtn = document.getElementById('drawer-close-btn');
  if (closeCartBtn) closeCartBtn.onclick = closeCartDrawer;

  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) backdrop.onclick = closeCartDrawer;

  const profileBtn = document.getElementById('profile-btn');
  if (profileBtn) {
    profileBtn.onclick = () => {
      const user = getCurrentUser();
      if (user) {
        if (confirm(`Logged in as ${user.name} (${user.email}). Do you want to logout?`)) {
          clearAuthSession();
        }
      } else {
        openModal('modal-login');
      }
    };
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav-links');
  if (menuToggle && mainNav) {
    menuToggle.onclick = () => {
      mainNav.classList.toggle('active');
    };
  }

  // Close buttons on generic modals
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.onclick = () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    };
  });

  // Modal overlay click outside to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  });

  // Auth form submissions
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSession(data.token, data.user);
          closeModal('modal-login');
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Login failed', 'error');
        }
      } catch (err) {
        showToast('Server connection error.', 'error');
      }
    };
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const phone = document.getElementById('reg-phone')?.value || '';

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSession(data.token, data.user);
          closeModal('modal-login');
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        showToast('Server connection error.', 'error');
      }
    };
  }

  // Load all products for caching & quick view
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    if (data.success) {
      allCatalogProducts = data.data;
    }
  } catch (err) {
    console.error('Failed to fetch catalog:', err);
  }

  // HOME PAGE: Render Bestsellers
  const bestsellerGrid = document.getElementById('bestseller-grid');
  if (bestsellerGrid) {
    const bestsellers = allCatalogProducts.filter(p => p.is_bestseller);
    bestsellerGrid.innerHTML = bestsellers.slice(0, 4).map(createProductCardHTML).join('');
  }

  // SHOP PAGE: Filter & Search
  const shopGrid = document.getElementById('shop-grid');
  if (shopGrid) {
    const renderShop = (items) => {
      if (items.length === 0) {
        shopGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align:center; padding:50px 20px;">
            <i class="fas fa-cookie-bite" style="font-size:3rem; color:#D5C6BA; margin-bottom:12px;"></i>
            <h3>No mithais found matching your selection</h3>
            <p style="color:var(--text-muted);">Try choosing a different category or search term.</p>
          </div>
        `;
      } else {
        shopGrid.innerHTML = items.map(createProductCardHTML).join('');
      }
    };

    const filterProducts = () => {
      const category = document.getElementById('category-filter')?.value || 'all';
      const sort = document.getElementById('price-sort')?.value || 'default';
      const search = document.getElementById('shop-search-input')?.value.toLowerCase().trim() || '';

      let results = [...allCatalogProducts];

      if (category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (search) {
        results = results.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.description.toLowerCase().includes(search)
        );
      }

      if (sort === 'low-high') {
        results.sort((a, b) => a.price - b.price);
      } else if (sort === 'high-low') {
        results.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      renderShop(results);
    };

    // Check URL parameters (e.g. ?category=kaju or ?search=laddoo)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (catParam && document.getElementById('category-filter')) {
      document.getElementById('category-filter').value = catParam;
    }
    if (searchParam && document.getElementById('shop-search-input')) {
      document.getElementById('shop-search-input').value = searchParam;
    }

    renderShop(allCatalogProducts);

    document.getElementById('category-filter')?.addEventListener('change', filterProducts);
    document.getElementById('price-sort')?.addEventListener('change', filterProducts);
    document.getElementById('shop-search-input')?.addEventListener('input', filterProducts);

    if (catParam || searchParam) {
      filterProducts();
    }
  }

  // CONTACT & GIFTING FORM HANDLERS
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.onsubmit = async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      const payload = {
        name: document.getElementById('contact-name')?.value,
        email: document.getElementById('contact-email')?.value,
        phone: document.getElementById('contact-phone')?.value,
        subject: document.getElementById('contact-subject')?.value || 'General Inquiry',
        message: document.getElementById('contact-message')?.value,
        type: 'contact'
      };

      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          contactForm.reset();
        } else {
          showToast(data.message || 'Failed to submit inquiry.', 'error');
        }
      } catch (err) {
        showToast('Failed to connect to server.', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    };
  }
});

// Demo helper login for evaluators
function useDemoCredentials(role) {
  if (role === 'admin') {
    document.getElementById('login-email').value = 'admin@madhuraj.in';
    document.getElementById('login-password').value = 'Admin@123';
  } else {
    document.getElementById('login-email').value = 'demo@example.com';
    document.getElementById('login-password').value = 'Demo@123';
  }
}