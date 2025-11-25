// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const cartCountEl = document.getElementById('cart-count');
    const bestsellerGrid = document.getElementById('bestseller-grid');
    const shopGrid = document.getElementById('shop-grid');
    const cartItemsDisplay = document.getElementById('cart-items-display');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // --- Modals ---
    const modalLogin = document.getElementById('modal-login');
    const modalCart = document.getElementById('modal-cart');
    const profileBtn = document.getElementById('profile-btn');
    const cartBtn = document.getElementById('cart-btn');
    const closeBtns = document.querySelectorAll('.close-btn');

    // --- Mobile Menu & Search ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNavLinks = document.querySelector('.main-nav-links');
    const searchToggle = document.getElementById('search-toggle');
    const searchBarMobile = document.getElementById('search-bar-mobile');

    /* ==================================
       1. UI & MODAL MANAGEMENT
       ================================== */

    // Open Modals
    profileBtn?.addEventListener('click', () => {
        modalLogin.style.display = 'flex';
        modalLogin.setAttribute('aria-hidden', 'false');
    });

    cartBtn?.addEventListener('click', () => {
        renderCart(); // Always update cart content before showing
        modalCart.style.display = 'flex';
        modalCart.setAttribute('aria-hidden', 'false');
    });

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            document.getElementById(modalId).style.display = 'none';
            document.getElementById(modalId).setAttribute('aria-hidden', 'true');
        });
    });

    // Close Modals when clicking outside
    window.onclick = function(event) {
        if (event.target === modalLogin) {
            modalLogin.style.display = 'none';
            modalLogin.setAttribute('aria-hidden', 'true');
        }
        if (event.target === modalCart) {
            modalCart.style.display = 'none';
            modalCart.setAttribute('aria-hidden', 'true');
        }
    }

    // Mobile Menu Toggle
    menuToggle?.addEventListener('click', () => {
        mainNavLinks.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });

    // Mobile Search Toggle
    searchToggle?.addEventListener('click', () => {
        searchBarMobile.classList.toggle('active');
    });


    /* ==================================
       2. PRODUCT & CART LOGIC
       ================================== */

    const CART_KEY = 'madhuraj_cart_v2';

    // Load cart from LocalStorage
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        } catch (e) {
            console.error("Failed to load cart.", e);
            return [];
        }
    }

    // Save cart to LocalStorage and update count
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        if (cartCountEl) {
            cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
        renderCart(); // Re-render cart modal immediately
    }
    
    // Initial load: update cart count on page load
    saveCart(getCart()); 

    // Add To Cart Event Listener (delegated)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-cart')) {
            const productId = parseInt(e.target.dataset.id);
            const product = productsData.find(p => p.id === productId);

            if (product) {
                let cart = getCart();
                const existingItem = cart.find(item => item.id === productId);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                
                saveCart(cart);

                // Quick UI feedback on button
                e.target.textContent = 'Added! ✓';
                e.target.disabled = true;
                setTimeout(() => {
                    e.target.textContent = 'Add to Cart';
                    e.target.disabled = false;
                }, 1000);
            }
        }
    });

    // Render Cart Modal Content
    function renderCart() {
        if (!cartItemsDisplay || !cartSubtotalEl || !emptyCartMessage) return;

        const cart = getCart();
        cartItemsDisplay.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsDisplay.appendChild(emptyCartMessage);
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>₹${item.price} x ${item.quantity}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span class="item-qty">${item.quantity}</span>
                            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                            <button class="remove-btn" data-id="${item.id}" title="Remove"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
                cartItemsDisplay.insertAdjacentHTML('beforeend', itemHTML);
                subtotal += item.price * item.quantity;
            });
        }
        
        cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    }

    // Cart Quantity/Remove Handlers (delegated inside the modal)
    modalCart?.addEventListener('click', (e) => {
        const target = e.target;
        const cart = getCart();
        const productId = parseInt(target.dataset.id);
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            if (target.classList.contains('qty-btn')) {
                const action = target.dataset.action;
                if (action === 'increase') {
                    cart[itemIndex].quantity += 1;
                } else if (action === 'decrease' && cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                }
                saveCart(cart);
            } else if (target.classList.contains('remove-btn') || target.closest('.remove-btn')) {
                cart.splice(itemIndex, 1); // Remove the item
                saveCart(cart);
            }
        }
    });


    /* ==================================
       3. PAGE SPECIFIC RENDERING
       ================================== */
    
    // HOME PAGE: Render Bestsellers
    if (bestsellerGrid) {
        const bestsellers = productsData.filter(p => p.isBestseller);
        bestsellers.slice(0, 4).forEach(product => { // Show max 4 on home
            bestsellerGrid.insertAdjacentHTML('beforeend', createProductCard(product));
        });
    }

    // SHOP PAGE: Render All Products and Filter Logic
    if (shopGrid) {
        // Initial rendering of all products
        productsData.forEach(product => {
            shopGrid.insertAdjacentHTML('beforeend', createProductCard(product));
        });

        const filterSelect = document.getElementById('category-filter');
        const priceSort = document.getElementById('price-sort');
        
        function filterAndSortProducts() {
            let filteredProducts = productsData;
            
            // 1. Filtering by Category
            const selectedCategory = filterSelect.value;
            if (selectedCategory !== 'all') {
                filteredProducts = productsData.filter(p => p.category === selectedCategory);
            }

            // 2. Sorting by Price
            const sortOrder = priceSort.value;
            if (sortOrder === 'low-high') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortOrder === 'high-low') {
                filteredProducts.sort((a, b) => b.price - a.price);
            }

            // 3. Re-render Grid
            shopGrid.innerHTML = '';
            filteredProducts.forEach(product => {
                shopGrid.insertAdjacentHTML('beforeend', createProductCard(product));
            });
            
            // 4. Handle Search Query from URL (e.g., from main search bar)
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search')?.toLowerCase();
            if (searchQuery) {
                 // Clear search query from URL after use (optional, but cleaner)
                 window.history.replaceState(null, null, window.location.pathname);
                 
                 const searchedProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery));
                 if (searchedProducts.length > 0) {
                     shopGrid.innerHTML = '';
                     searchedProducts.forEach(product => {
                        shopGrid.insertAdjacentHTML('beforeend', createProductCard(product));
                     });
                     document.querySelector('.shop-header h2').textContent = `Search Results for "${searchQuery}"`;
                 } else {
                     shopGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">Sorry, no products found matching your search term.</p>';
                 }
            }
        }

        filterSelect?.addEventListener('change', filterAndSortProducts);
        priceSort?.addEventListener('change', filterAndSortProducts);
        
        // Initial filter/sort run (to catch URL search query)
        filterAndSortProducts(); 
    }
});