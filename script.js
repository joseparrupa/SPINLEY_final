// =====================
// STORAGE UTILITIES
// =====================
function getCart() {
    const cartData = localStorage.getItem('spinley_cart');
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cart) {
    localStorage.setItem('spinley_cart', JSON.stringify(cart));
}

function getFavorites() {
    const favoritesData = localStorage.getItem('spinley_favorites');
    return favoritesData ? JSON.parse(favoritesData) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('spinley_favorites', JSON.stringify(favorites));
}

// =====================
// CART MANAGEMENT
// =====================
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

function addToCart(id, name, price, quantity = 1, image = null) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ 
            id, 
            name, 
            price, 
            quantity, 
            color: 'Negro', 
            size: 'M',
            image: image || getProductImage(id)
        });
    }
    
    saveCart(cart);
    updateCartCount();
}

function getProductImage(id) {
    const images = {
        1: 'images/FOTO MAILLOT ROJO .png',
        2: 'images/FOTO MODELO MAILLOT VERDE .png',
        3: 'images/FOTO MODELO MAILLOT AZUL.png',
        4: 'images/CASCO 1.png',
        5: 'images/CASCO.png',
        6: 'images/CASCO 3.png',
        7: 'images/RELOJ SPINLEY.png',
        8: 'images/CALCETINES 1.png',
        9: 'images/ZAPATILLAS SPINLE.png',
        10: 'images/BOTELLIN SPINLEY (1).png',
        11: 'images/CALCETINES 2.png',
        12: 'images/CASCO 2.png',
        13: 'images/CASCO 4.png',
        14: 'images/BOTELLIN SPINLEY (2).png'
    };
    return images[id] || 'images/CASCO.png';
}

function addToCartQuick(id, name, price) {
    addToCart(id, name, price, 1);
    showNotification(`${name} añadido al carrito`);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateCartItem(id, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    
    updateCartCount();
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const cartLayout = document.querySelector('.cart-layout');
    const emptyCart = document.getElementById('cart-empty');
    const cart = getCart();

    if (!container) return;

    if (cart.length === 0) {
        container.style.display = 'none';
        if (cartLayout) cartLayout.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (cartLayout) cartLayout.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image || getProductImage(item.id)}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">Color: ${item.color} | Talla: ${item.size}</div>
                <div class="cart-item-qty">
                    <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 80 ? 0 : 5;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const amountForFreeEl = document.getElementById('amount-for-free');
    const freeShippingNotice = document.getElementById('free-shipping-notice');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + '€';
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : shipping.toFixed(2) + '€';
    if (totalEl) totalEl.textContent = total.toFixed(2) + '€';

    if (amountForFreeEl) {
        const amountForFree = Math.max(0, 80 - subtotal);
        amountForFreeEl.textContent = amountForFree.toFixed(2) + '€';
    }

    if (freeShippingNotice) {
        freeShippingNotice.style.display = subtotal >= 80 ? 'none' : 'block';
    }
}

// =====================
// FAVORITES MANAGEMENT
// =====================
function updateFavoritesCount() {
    const favorites = getFavorites();
    const favCount = favorites.length;
    
    // Update favorites icon if exists
    const favBtns = document.querySelectorAll('.icon-btn');
    favBtns.forEach(btn => {
        const svg = btn.querySelector('svg path[d*="M20.84"]');
        if (svg) {
            let countBadge = btn.querySelector('.fav-count');
            if (favCount > 0) {
                if (!countBadge) {
                    countBadge = document.createElement('span');
                    countBadge.className = 'fav-count';
                    countBadge.style.cssText = `
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background: #9eef6b;
                        color: #050505;
                        font-size: 10px;
                        font-weight: 700;
                        min-width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    btn.style.position = 'relative';
                    btn.appendChild(countBadge);
                }
                countBadge.textContent = favCount;
            } else if (countBadge) {
                countBadge.remove();
            }
        }
    });
}

function toggleFavorite(id, name, price, image) {
    let favorites = getFavorites();
    const existingIndex = favorites.findIndex(item => item.id === id);
    
    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        showNotification(`${name} eliminado de favoritos`);
    } else {
        favorites.push({ id, name, price, image: image || getProductImage(id) });
        showNotification(`${name} añadido a favoritos`);
    }
    
    saveFavorites(favorites);
    updateFavoritesCount();
    updateFavoriteButtons();
}

function isFavorite(id) {
    const favorites = getFavorites();
    return favorites.some(item => item.id === id);
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId);
        if (isFavorite(productId)) {
            btn.classList.add('active');
            btn.querySelector('svg').style.fill = '#9eef6b';
        } else {
            btn.classList.remove('active');
            btn.querySelector('svg').style.fill = 'none';
        }
    });
}

function initFavoriteButtons() {
    // Add favorite buttons to product cards
    document.querySelectorAll('.product-card-catalog').forEach(card => {
        const productId = parseInt(card.querySelector('.quick-add')?.getAttribute('onclick')?.match(/\d+/)?.[0] || 0);
        const productName = card.querySelector('.product-name-catalog')?.textContent || '';
        const productPrice = parseFloat(card.dataset.price) || 0;
        const productImage = card.querySelector('img')?.src || '';
        
        const imageContainer = card.querySelector('.product-image-catalog');
        if (imageContainer && !imageContainer.querySelector('.favorite-btn')) {
            const favBtn = document.createElement('button');
            favBtn.className = 'favorite-btn';
            favBtn.dataset.productId = productId;
            favBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            `;
            favBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(5, 5, 5, 0.8);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
                color: #9eef6b;
            `;
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(productId, productName, productPrice, productImage);
            });
            imageContainer.appendChild(favBtn);
        }
    });
    
    updateFavoriteButtons();
}

// Show favorites modal when clicking favorites icon
function initFavoritesModal() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        const svg = btn.querySelector('svg path[d*="M20.84"]');
        if (svg) {
            btn.addEventListener('click', () => {
                showFavoritesModal();
            });
        }
    });
}

function showFavoritesModal() {
    const favorites = getFavorites();
    
    // Remove existing modal
    const existingModal = document.getElementById('favorites-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'favorites-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a0a;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        padding: 30px;
        border: 1px solid #1a1a1a;
    `;
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #fff; margin: 0;">Tus Favoritos</h2>
                <button id="close-favorites" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 24px;">&times;</button>
            </div>
            <div style="text-align: center; padding: 40px 0;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9eef6b" stroke-width="1">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <p style="color: #888; margin-top: 20px;">No tienes productos en favoritos</p>
                <a href="productos.html" style="color: #9eef6b; text-decoration: none; font-weight: 600;">Explorar productos</a>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #fff; margin: 0;">Tus Favoritos (${favorites.length})</h2>
                <button id="close-favorites" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 24px;">&times;</button>
            </div>
            <div class="favorites-list">
                ${favorites.map(item => `
                    <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #1a1a1a; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div style="flex: 1;">
                            <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 14px;">${item.name}</h4>
                            <p style="color: #9eef6b; font-weight: 600; margin: 0;">${item.price.toFixed(2)}€</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="addToCartFromFavorites(${item.id}, '${item.name}', ${item.price})" style="background: #9eef6b; color: #050505; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;">Añadir</button>
                            <button onclick="removeFavorite(${item.id})" style="background: none; border: 1px solid #333; color: #fff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal events
    document.getElementById('close-favorites').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function addToCartFromFavorites(id, name, price) {
    addToCart(id, name, price, 1);
    showNotification(`${name} añadido al carrito`);
}

function removeFavorite(id) {
    let favorites = getFavorites();
    const item = favorites.find(f => f.id === id);
    favorites = favorites.filter(f => f.id !== id);
    saveFavorites(favorites);
    updateFavoritesCount();
    updateFavoriteButtons();
    showFavoritesModal(); // Refresh modal
    if (item) {
        showNotification(`${item.name} eliminado de favoritos`);
    }
}

// =====================
// HEADER & NAVIGATION
// =====================
function initHeader() {
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    const navDropdown = document.getElementById('nav-dropdown');
    const header = document.getElementById('header');

    if (hamburgerBtn && navDropdown) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navDropdown.classList.toggle('open');
            hamburgerBtn.classList.toggle('open', isOpen);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !navDropdown.contains(e.target)) {
                navDropdown.classList.remove('open');
                hamburgerBtn.classList.remove('open');
            }
        });

        // Close when clicking a link
        navDropdown.querySelectorAll('.nav-dropdown-link').forEach(link => {
            link.addEventListener('click', () => {
                navDropdown.classList.remove('open');
                hamburgerBtn.classList.remove('open');
            });
        });
    }

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// =====================
// SEARCH FUNCTIONALITY
// =====================
function initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchIcons = document.querySelectorAll('.search-icon');
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const headerSearch = document.querySelector('.header-search');

    // Product data for search
    const allProducts = [
        { id: 1, name: 'MAILLOT BLEND 1.0', category: 'maillots', price: 79.99, url: 'producto.html?id=1' },
        { id: 2, name: 'MAILLOT AERO PRO', category: 'maillots', price: 89.99, url: 'producto.html?id=2' },
        { id: 3, name: 'MAILLOT TRAIL MOUNTAIN', category: 'maillots', price: 74.99, url: 'producto.html?id=3' },
        { id: 4, name: 'CASCO AERO ROAD', category: 'cascos', price: 149.99, url: 'producto.html?id=4' },
        { id: 5, name: 'CASCO PERFORMANCE', category: 'cascos', price: 129.99, url: 'producto.html?id=5' },
        { id: 6, name: 'CASCO MTB PRO', category: 'cascos', price: 139.99, url: 'producto.html?id=6' },
        { id: 7, name: 'RELOJ SPINLEY', category: 'accesorios', price: 294.99, url: 'producto.html?id=7' },
        { id: 8, name: 'CALCETINES PERFORMANCE', category: 'calcetines', price: 19.99, url: 'producto.html?id=8' },
        { id: 9, name: 'ZAPATILLAS CARBON ROAD', category: 'zapatillas', price: 199.99, url: 'producto.html?id=9' },
        { id: 10, name: 'BIDÓN ECO 750ML', category: 'accesorios', price: 14.99, url: 'producto.html?id=10' },
        { id: 11, name: 'CALCETINES ECO', category: 'calcetines', price: 24.99, url: 'producto.html?id=11' },
        { id: 12, name: 'CASCO URBAN LITE', category: 'cascos', price: 119.99, url: 'producto.html?id=12' },
        { id: 13, name: 'CASCO ENDURO EXTREME', category: 'cascos', price: 159.99, url: 'producto.html?id=13' },
        { id: 14, name: 'BIDÓN PRO 750ML', category: 'accesorios', price: 17.99, url: 'producto.html?id=14' }
    ];

    // ---- Toggle helper ----
    function openSearch() {
        if (!headerSearch) return;
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            headerSearch.classList.add('mobile-active');
        } else {
            headerSearch.classList.add('active');
        }
        if (searchToggleBtn) searchToggleBtn.classList.add('search-toggle-active');
        const input = headerSearch.querySelector('.search-input');
        if (input) {
            input.focus();
            input.select();
        }
    }

    function closeSearch() {
        if (!headerSearch) return;
        headerSearch.classList.remove('active', 'mobile-active');
        if (searchToggleBtn) searchToggleBtn.classList.remove('search-toggle-active');
    }

    function toggleSearch() {
        if (!headerSearch) return;
        const isOpen = headerSearch.classList.contains('active') || headerSearch.classList.contains('mobile-active');
        if (isOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    }

    // Wire the search toggle button (the lupa in header-actions)
    if (searchToggleBtn) {
        searchToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSearch();
        });
    }

    // Close when clicking outside the search bar
    document.addEventListener('click', (e) => {
        if (
            headerSearch &&
            !headerSearch.contains(e.target) &&
            e.target !== searchToggleBtn &&
            !searchToggleBtn?.contains(e.target)
        ) {
            closeSearch();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    // ---- Dropdown suggestions per input ----
    searchInputs.forEach(input => {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(dropdown);

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            const results = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );

            if (results.length > 0) {
                dropdown.innerHTML = results.map(p => `
                    <a href="${p.url}" style="display: flex; justify-content: space-between; padding: 12px 15px; color: #fff; text-decoration: none; border-bottom: 1px solid #1a1a1a; transition: background 0.2s;">
                        <span style="font-size: 14px;">${p.name}</span>
                        <span style="color: #9eef6b; font-weight: 600;">${p.price.toFixed(2)}€</span>
                    </a>
                `).join('');
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('a').forEach(a => {
                    a.addEventListener('mouseenter', () => a.style.background = '#1a1a1a');
                    a.addEventListener('mouseleave', () => a.style.background = 'transparent');
                });
            } else {
                dropdown.innerHTML = `
                    <div style="padding: 15px; color: #888; text-align: center;">
                        No se encontraron productos
                    </div>
                `;
                dropdown.style.display = 'block';
            }
        });

        // Handle Enter key — redirect to catalog with query
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
                }
            }
        });

        // Hide dropdown when clicking outside the input
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });

    // ---- Search icon (inside input bar) triggers search ----
    searchIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const input = icon.parentElement.querySelector('.search-input');
            if (input) {
                const query = input.value.trim();
                if (query) {
                    window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
                } else {
                    input.focus();
                }
            }
        });
    });

    // ---- Filter products on productos.html based on URL params ----
    if (window.location.pathname.includes('productos')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery) {
            filterProductsBySearch(searchQuery);
            searchInputs.forEach(input => {
                input.value = searchQuery;
            });
            // Open the search bar so the query is visible
            if (headerSearch) headerSearch.classList.add('active');
        }
    }
}

function filterProductsBySearch(query) {
    const catalogGrid = document.getElementById('catalog-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!catalogGrid) return;
    
    const products = Array.from(document.querySelectorAll('.product-card-catalog'));
    let visibleCount = 0;
    
    products.forEach(product => {
        const name = product.querySelector('.product-name-catalog')?.textContent.toLowerCase() || '';
        const category = product.querySelector('.product-category-small')?.textContent.toLowerCase() || '';
        const dataCategory = product.dataset.category?.toLowerCase() || '';
        
        const matches = name.includes(query.toLowerCase()) || 
                       category.includes(query.toLowerCase()) ||
                       dataCategory.includes(query.toLowerCase());
        
        if (matches) {
            product.style.display = '';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    if (resultsCount) {
        resultsCount.textContent = `Mostrando ${visibleCount} productos para "${query}"`;
    }
}

// =====================
// CAROUSEL - FIXED
// =====================
function initCarousel() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!carousel || !prevBtn || !nextBtn) return;

    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    let currentIndex = 0;
    const totalItems = items.length;
    const visibleItems = getVisibleItems();
    
    function getVisibleItems() {
        const containerWidth = carousel.parentElement.offsetWidth - 100; // Account for buttons
        const itemWidth = window.innerWidth <= 768 ? 170 : 220; // item + gap
        return Math.floor(containerWidth / itemWidth);
    }

    function updateCarousel() {
        // Update active states
        items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentIndex) {
                item.classList.add('active');
            }
        });

        // Calculate scroll position
        const itemWidth = items[0].offsetWidth;
        const gap = 20;
        const scrollPosition = currentIndex * (itemWidth + gap);
        
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    });

    // Auto-play carousel
    let autoPlayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }, 4000);
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carousel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }, 4000);
    });
    
    // Handle window resize
    window.addEventListener('resize', updateCarousel);
    
    // Initialize
    updateCarousel();
}

// =====================
// PRODUCT FILTERS
// =====================
function initFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const genderFilter = document.getElementById('gender-filter');
    const sortFilter = document.getElementById('sort-filter');
    const catalogGrid = document.getElementById('catalog-grid');
    const resultsCount = document.getElementById('results-count');

    if (!catalogGrid) return;
    
    // Store original products
    const originalProducts = Array.from(document.querySelectorAll('.product-card-catalog'));

    function applyFilters() {
        const category = categoryFilter?.value || '';
        const gender = genderFilter?.value || '';
        const sort = sortFilter?.value || 'featured';
        
        let products = [...originalProducts];

        // Filter by category
        if (category) {
            products = products.filter(product => product.dataset.category === category);
        }
        
        // Filter by gender
        if (gender) {
            products = products.filter(product => product.dataset.gender === gender);
        }

        // Sort products
        if (sort === 'price-asc') {
            products.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        } else if (sort === 'price-desc') {
            products.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        } else if (sort === 'newest') {
            products.sort((a, b) => (b.dataset.new === 'true' ? 1 : 0) - (a.dataset.new === 'true' ? 1 : 0));
        }

        // Clear and re-add products
        catalogGrid.innerHTML = '';
        products.forEach(product => {
            const clone = product.cloneNode(true);
            catalogGrid.appendChild(clone);
        });
        
        // Re-initialize favorite buttons after DOM update
        initFavoriteButtons();

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${products.length} productos`;
        }
    }

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (genderFilter) genderFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

// =====================
// PRODUCT DATABASE
// =====================
const productsDatabase = {
    1: {
        id: 1,
        name: 'MAILLOT SPINLEY BLEND 1.0',
        category: 'LONG SLEEVE JERSEY',
        price: 79.99,
        stock: true,
        rating: 4.1,
        reviews: 45,
        description: 'Maillot de manga larga diseñado para ciclistas exigentes que buscan rendimiento y sostenibilidad. Fabricado con tejidos técnicos reciclados de alta calidad.',
        descriptionExtended: {
            intro: 'El Maillot SPINLEY Blend 1.0 es la elección perfecta para ciclistas comprometidos con el medio ambiente sin renunciar al rendimiento. Este maillot de manga larga combina tecnología avanzada con materiales sostenibles.',
            features: [
                'Tejido técnico reciclado de alta transpirabilidad',
                'Sistema de control de humedad avanzado',
                'Ajuste aerodinámico para máxima eficiencia',
                'Bolsillos traseros con capacidad reforzada',
                'Cremallera YKK de alta calidad',
                'Elementos reflectantes para mayor visibilidad',
                'Fabricado con materiales 100% reciclados'
            ],
            sustainability: 'En SPINLEY nos preocupamos por el planeta. Este maillot está fabricado con botellas de plástico recicladas, reduciendo el impacto ambiental sin comprometer la calidad ni el rendimiento.'
        },
        specs: [
            { label: 'Material', value: '85% poliéster reciclado, 15% elastano' },
            { label: 'Peso', value: '180g (talla M)' },
            { label: 'Ajuste', value: 'Slim fit / Race fit' },
            { label: 'Temperatura recomendada', value: '10°C - 20°C' },
            { label: 'Cuidados', value: 'Lavar a máquina 30°C, no usar secadora' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Portugal' }
        ],
        reviewsList: [
            { name: 'Carlos M.', stars: 5, date: '15 de marzo de 2026', text: 'Excelente calidad y muy cómodo. El ajuste es perfecto y la transpirabilidad es increíble incluso en rutas largas.' },
            { name: 'Laura G.', stars: 4, date: '8 de marzo de 2026', text: 'Muy contenta con la compra. El diseño es espectacular y me encanta que sea eco-friendly. Solo le doy 4 estrellas porque me gustaría que tuviera más opciones de color.' },
            { name: 'Miguel A.', stars: 5, date: '2 de marzo de 2026', text: 'Relación calidad-precio inmejorable. Llevo usándolo 3 semanas y está como el primer día.' },
            { name: 'Ana R.', stars: 4, date: '28 de febrero de 2026', text: 'Buen maillot en general, aunque el tallaje es un poco ajustado. Recomiendo pedir una talla más.' }
        ],
        images: [
            'images/FOTO MAILLOT ROJO .png',
            'images/LATERLA MAILLOT ROJO.png',
            'images/TRASERA MAILLOT ROJO.png',
            'images/DETALLE MAILLOT ROJO.png'
        ],
        colors: ['#c4382e', '#9eef6b', '#2e5c8e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    2: {
        id: 2,
        name: 'MAILLOT AERO PRO',
        category: 'PERFORMANCE JERSEY',
        price: 89.99,
        stock: true,
        rating: 4.5,
        reviews: 67,
        description: 'Maillot aerodinámico de alto rendimiento para ciclistas competitivos. Diseño ajustado que reduce la resistencia al viento.',
        descriptionExtended: {
            intro: 'El Maillot SPINLEY Aero Pro está diseñado para quienes buscan el máximo rendimiento en competición. Su perfil aerodinámico y sus materiales técnicos de última generación marcan la diferencia en cada kilómetro.',
            features: [
                'Tejido AeroTech de baja resistencia al viento',
                'Paneles de silicona antideslizante en bajo',
                'Costuras planas termoselladas sin rozaduras',
                '3 bolsillos traseros más bolsillo de cremallera',
                'Cuello con protección UV 50+',
                'Reflectantes 360° para máxima visibilidad',
                'Compatible con potencia y sensores de cadencia'
            ],
            sustainability: 'El Maillot Aero Pro incorpora un 60% de fibras recicladas certificadas bluesign®, reduciendo el consumo de agua en su producción en un 50% respecto a tejidos convencionales.'
        },
        specs: [
            { label: 'Material', value: '78% poliéster reciclado, 22% elastano' },
            { label: 'Peso', value: '155g (talla M)' },
            { label: 'Ajuste', value: 'Race fit / Ultra slim' },
            { label: 'Temperatura recomendada', value: '15°C - 28°C' },
            { label: 'Cuidados', value: 'Lavar a mano o máquina 30°C, no planchar' },
            { label: 'Certificaciones', value: 'bluesign®, OEKO-TEX Standard 100' },
            { label: 'Origen', value: 'Diseñado y fabricado en España' }
        ],
        reviewsList: [
            { name: 'Javier P.', stars: 5, date: '10 de abril de 2026', text: 'El mejor maillot que he usado en competición. Se nota la diferencia aerodinámica y el ajuste es perfecto.' },
            { name: 'Sofía L.', stars: 5, date: '3 de abril de 2026', text: 'Increíble calidad. Lo usé en mi última carrera y quedé encantada. La transpirabilidad es brutal.' },
            { name: 'Roberto F.', stars: 4, date: '25 de marzo de 2026', text: 'Muy buen producto. La tela es suave y resistente. Le quito una estrella porque el color verde es algo diferente al de la foto.' },
            { name: 'Elena V.', stars: 4, date: '18 de marzo de 2026', text: 'Excelente relación calidad-precio para un maillot de competición. El bolsillo de cremallera es muy útil.' }
        ],
        images: [
            'images/FOTO MODELO MAILLOT VERDE .png',
            'images/LATERAL MAILLOT VERDE.png',
            'images/TRASERA MAILLOT VERDE.png',
            'images/DETALLE MAILLOT VERDE.png'
        ],
        colors: ['#9eef6b', '#c4382e', '#2e5c8e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    3: {
        id: 3,
        name: 'MAILLOT TRAIL MOUNTAIN',
        category: 'MTB JERSEY',
        price: 74.99,
        stock: true,
        rating: 4.3,
        reviews: 38,
        description: 'Maillot diseñado especialmente para mountain bike. Tejido resistente y transpirable ideal para rutas de montaña.',
        descriptionExtended: {
            intro: 'El Maillot Trail Mountain de SPINLEY nace de la necesidad de los riders de montaña: un jersey que aguante el trote de los senderos más exigentes sin sacrificar la comodidad ni el aspecto técnico.',
            features: [
                'Tejido TrailShield reforzado en hombros y codos',
                'Corte holgado para mayor libertad de movimiento',
                'Sistema de ventilación con paneles de malla',
                '2 bolsillos laterales de fácil acceso',
                'Bajo ajustable con cordón regulador',
                'Protección UV 40+',
                'Compatible con protecciones de trail'
            ],
            sustainability: 'Fabricado con un 70% de poliéster reciclado postconsumo. Cada maillot evita el uso de aproximadamente 5 botellas de plástico de 500ml.'
        },
        specs: [
            { label: 'Material', value: '70% poliéster reciclado, 30% poliéster técnico' },
            { label: 'Peso', value: '210g (talla M)' },
            { label: 'Ajuste', value: 'Regular fit / Trail fit' },
            { label: 'Temperatura recomendada', value: '8°C - 22°C' },
            { label: 'Cuidados', value: 'Lavar a máquina 40°C, no usar secadora' },
            { label: 'Protección UV', value: 'UPF 40+' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Portugal' }
        ],
        reviewsList: [
            { name: 'Marcos T.', stars: 5, date: '5 de abril de 2026', text: 'Perfecto para el trail. Los bolsillos laterales son muy prácticos y el tejido aguanta bien los roces con las ramas.' },
            { name: 'Patricia S.', stars: 4, date: '29 de marzo de 2026', text: 'Muy cómodo para rutas largas de montaña. El corte holgado permite una gran libertad de movimiento.' },
            { name: 'Diego N.', stars: 4, date: '20 de marzo de 2026', text: 'Buen maillot, muy transpirable. Solo echo en falta un bolsillo trasero clásico para guardar el móvil.' },
            { name: 'Carmen R.', stars: 4, date: '12 de marzo de 2026', text: 'La calidad es muy buena y la tela es resistente. Lo recomiendo para rutas de montaña.' }
        ],
        images: [
            'images/FOTO MODELO MAILLOT AZUL.png',
            'images/LATERAL MAILLOT AZUL.png',
            'images/TRASERA MAILLOT AZUL.png',
            'images/DETALLE MAILLOT AZUL.png'
        ],
        colors: ['#2e5c8e', '#9eef6b', '#c4382e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    4: {
        id: 4,
        name: 'CASCO AERO ROAD',
        category: 'CASCOS',
        price: 149.99,
        stock: true,
        rating: 4.7,
        reviews: 52,
        description: 'Casco aerodinámico para ciclismo de carretera. Diseño ventilado con máxima protección y comodidad.',
        descriptionExtended: {
            intro: 'El Casco Aero Road de SPINLEY redefine el equilibrio entre aerodinámica y ventilación. Diseñado en colaboración con ingenieros de túnel de viento, ofrece un rendimiento aerodinámico excepcional sin sacrificar la circulación de aire.',
            features: [
                'Carcasa In-Mold de policarbonato de alto impacto',
                '16 canales de ventilación optimizados por CFD',
                'Sistema de ajuste RideFit de precisión milimétrica',
                'Almohadillas antiodor extraíbles y lavables',
                'Compatible con gafas de todas las marcas',
                'Homologado CE EN 1078',
                'Visera magnética opcional (no incluida)'
            ],
            sustainability: 'La espuma EPS del interior está fabricada con un 30% de material reciclado. El embalaje es 100% reciclable y libre de plásticos de un solo uso.'
        },
        specs: [
            { label: 'Material exterior', value: 'Policarbonato In-Mold' },
            { label: 'Material interior', value: 'EPS de alta densidad (30% reciclado)' },
            { label: 'Peso', value: '260g (talla M)' },
            { label: 'Tallas disponibles', value: 'S (52-55cm), M (55-58cm), L (58-62cm)' },
            { label: 'Ventilación', value: '16 canales aerodinámicos' },
            { label: 'Homologación', value: 'CE EN 1078, CPSC' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Italia' }
        ],
        reviewsList: [
            { name: 'Fernando G.', stars: 5, date: '8 de abril de 2026', text: 'El mejor casco que he tenido. Ligero, bien ventilado y con un ajuste perfecto. Lo recomiendo al 100%.' },
            { name: 'Isabel M.', stars: 5, date: '1 de abril de 2026', text: 'Increíblemente cómodo. Lo uso en rutas largas y no noto presión en ningún punto de la cabeza.' },
            { name: 'Andrés C.', stars: 4, date: '22 de marzo de 2026', text: 'Muy buen casco. La ventilación es excelente, aunque en días muy fríos quizás necesites algo con menos aireación.' },
            { name: 'María J.', stars: 5, date: '15 de marzo de 2026', text: 'Diseño espectacular y muy ligero. El sistema de ajuste es sencillo y preciso.' }
        ],
        images: [
            'images/CASCO 1.png',
            'images/LATERAL CASCO 1.png',
            'images/TRASERA CASCO 1.png',
            'images/DETALLE CASCO 1.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#c4382e'],
        sizes: ['S', 'M', 'L']
    },
    5: {
        id: 5,
        name: 'CASCO PERFORMANCE',
        category: 'CASCOS',
        price: 129.99,
        stock: true,
        rating: 4.4,
        reviews: 41,
        description: 'Casco versátil con excelente ventilación y ajuste personalizable. Perfecto para entrenamientos y competiciones.',
        descriptionExtended: {
            intro: 'El Casco Performance de SPINLEY es el compañero ideal para cualquier tipo de ciclista. Su diseño versátil y su amplio rango de ventilación lo convierten en el casco perfecto tanto para entrenamientos diarios como para competiciones de nivel medio.',
            features: [
                'Construcción In-Mold de alta resistencia',
                '20 ranuras de ventilación distribuidas estratégicamente',
                'Sistema de retención ajustable en 3 posiciones',
                'Correas de tejido suave antirozaduras',
                'Almohadillas de espuma viscoelástica',
                'Insertos reflectantes traseros',
                'Homologado CE EN 1078 y AS/NZS 2063'
            ],
            sustainability: 'Producido en una fábrica certificada ISO 14001. Los materiales de embalaje son reciclables al 100% y la empresa compensa su huella de carbono con plantaciones forestales.'
        },
        specs: [
            { label: 'Material exterior', value: 'ABS + Policarbonato' },
            { label: 'Material interior', value: 'EPS multicapa' },
            { label: 'Peso', value: '290g (talla M)' },
            { label: 'Tallas disponibles', value: 'S (51-55cm), M (55-59cm), L (59-63cm)' },
            { label: 'Ventilación', value: '20 ranuras de flujo cruzado' },
            { label: 'Homologación', value: 'CE EN 1078, AS/NZS 2063' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Portugal' }
        ],
        reviewsList: [
            { name: 'Pablo R.', stars: 5, date: '12 de abril de 2026', text: 'Muy buena relación calidad-precio. Cómodo desde el primer momento y bien ventilado.' },
            { name: 'Lucía F.', stars: 4, date: '6 de abril de 2026', text: 'Me encanta el ajuste. Las correas son muy suaves y no generan marcas en la piel.' },
            { name: 'Tomás A.', stars: 4, date: '28 de marzo de 2026', text: 'Sólido y fiable. Lo uso a diario para ir al trabajo en bici y es muy cómodo.' },
            { name: 'Natalia B.', stars: 5, date: '20 de marzo de 2026', text: 'Excelente casco. La ventilación es suficiente incluso en verano. Muy recomendable.' }
        ],
        images: [
            'images/CASCO.png',
            'images/LATERAL CASCO.png',
            'images/TRASERA CASCO.png',
            'images/DETALLE CASCO.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#9eef6b'],
        sizes: ['S', 'M', 'L']
    },
    6: {
        id: 6,
        name: 'CASCO MTB PRO',
        category: 'CASCOS',
        price: 139.99,
        stock: true,
        rating: 4.6,
        reviews: 29,
        description: 'Casco específico para mountain bike con protección extendida. Visera ajustable y sistema de ventilación optimizado.',
        descriptionExtended: {
            intro: 'El Casco MTB Pro de SPINLEY está diseñado para los amantes del trail y el enduro suave. Su cobertura extendida en occipital y sus robustos materiales ofrecen una protección superior para los senderos más técnicos.',
            features: [
                'Cobertura occipital extendida para trail',
                'Visera ajustable en 3 posiciones',
                'Interior de espuma EPS y EPP dual-density',
                'Sistema MIPS de protección ante impactos rotacionales',
                '14 canales de ventilación de alto flujo',
                'Almohadillas magnéticas extraíbles y lavables',
                'Compatible con gafas de MTB y máscaras faciales'
            ],
            sustainability: 'El Casco MTB Pro incorpora tecnología MIPS para mayor seguridad. Los materiales empleados son conformes a la directiva REACH europea sobre sustancias químicas.'
        },
        specs: [
            { label: 'Material exterior', value: 'Policarbonato reforzado In-Mold' },
            { label: 'Material interior', value: 'EPS + EPP dual-density + MIPS' },
            { label: 'Peso', value: '310g (talla M)' },
            { label: 'Tallas disponibles', value: 'S (52-56cm), M (56-60cm), L (60-64cm)' },
            { label: 'Ventilación', value: '14 canales de alto flujo' },
            { label: 'Homologación', value: 'CE EN 1078, ASTM F1952' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Taiwan' }
        ],
        reviewsList: [
            { name: 'Álvaro D.', stars: 5, date: '14 de abril de 2026', text: 'El sistema MIPS da mucha confianza. Se nota que es un casco pensado para el trail de verdad.' },
            { name: 'Sandra M.', stars: 5, date: '7 de abril de 2026', text: 'Muy bien protegido y con buena ventilación. La visera ajustable es un must para el monte.' },
            { name: 'Raúl G.', stars: 4, date: '30 de marzo de 2026', text: 'Buena construcción y materiales de calidad. Un poco más pesado que los de gama alta, pero el precio lo justifica.' },
            { name: 'Cristina L.', stars: 4, date: '22 de marzo de 2026', text: 'Me lo compré para hacer trail y estoy muy contenta. Muy cómodo y la visera es muy útil.' }
        ],
        images: [
            'images/CASCO 3.png',
            'images/LATERLA CASCO 3.png',
            'images/TRASERA CASCO 3.png',
            'images/DETALLE CASCO 3.png'
        ],
        colors: ['#1a1a1a', '#c4382e', '#2e5c8e'],
        sizes: ['S', 'M', 'L']
    },
    7: {
        id: 7,
        name: 'RELOJ SPINLEY',
        category: 'ACCESORIOS',
        price: 294.99,
        stock: true,
        rating: 4.5,
        reviews: 32,
        description: 'Reloj deportivo inteligente diseñado para ciclistas. Monitoriza tu rendimiento, GPS integrado y resistente al agua.',
        descriptionExtended: {
            intro: 'El Reloj SPINLEY es el compañero tecnológico definitivo para el ciclista moderno. Con GPS de alta precisión, monitor cardíaco óptico y conectividad ANT+/Bluetooth, pone a tu disposición todos los datos que necesitas para optimizar tu rendimiento.',
            features: [
                'GPS dual-band de alta precisión (GPS + GLONASS)',
                'Monitor cardíaco óptico de 24 pulsos por segundo',
                'Conectividad ANT+ y Bluetooth 5.0',
                'Pantalla AMOLED de 1.4" con 454x454px',
                'Autonomía de 20h en modo GPS activo',
                'Resistencia al agua 5ATM (50m)',
                'Compatible con sensores de potencia, cadencia y velocidad'
            ],
            sustainability: 'La correa del Reloj SPINLEY está fabricada con caucho reciclado libre de látex. El embalaje es 100% papel FSC y el producto viene sin plásticos innecesarios.'
        },
        specs: [
            { label: 'Pantalla', value: 'AMOLED 1.4", 454x454px, cristal Gorilla Glass' },
            { label: 'GPS', value: 'Dual-band GPS + GLONASS + Galileo' },
            { label: 'Autonomía', value: '20h GPS activo / 14 días en uso normal' },
            { label: 'Resistencia al agua', value: '5ATM (50 metros)' },
            { label: 'Conectividad', value: 'ANT+, Bluetooth 5.0, Wi-Fi 802.11b/g/n' },
            { label: 'Peso', value: '52g (sin correa)' },
            { label: 'Sensores', value: 'Cardíaco óptico, altímetro barométrico, brújula, termómetro' }
        ],
        reviewsList: [
            { name: 'Hugo S.', stars: 5, date: '16 de abril de 2026', text: 'El GPS es muy preciso y la pantalla se ve perfectamente al sol. Totalmente recomendable para ciclismo.' },
            { name: 'Marta C.', stars: 4, date: '9 de abril de 2026', text: 'Muy completo. La app de acompañamiento es intuitiva y la autonomía es suficiente para salidas largas.' },
            { name: 'Víctor E.', stars: 5, date: '2 de abril de 2026', text: 'Lo tengo desde hace un mes y estoy encantado. La cardio óptica es muy precisa y el altímetro funciona genial.' },
            { name: 'Rosa T.', stars: 4, date: '25 de marzo de 2026', text: 'Muy buen reloj. La interfaz es moderna y fácil de usar. Le doy 4 porque la correa podría ser más resistente.' }
        ],
        images: [
            'images/RELOJ SPINLEY.png',
            'images/LATERAL RELOJ SPINLEY.png',
            'images/TRASERA RELOJ SPINLEY.png',
            'images/DETALLE RELOJ SPINLEY.png'
        ],
        colors: ['#1a1a1a', '#9eef6b'],
        sizes: ['Único']
    },
    8: {
        id: 8,
        name: 'CALCETINES PERFORMANCE',
        category: 'CALCETINES',
        price: 19.99,
        stock: true,
        rating: 4.0,
        reviews: 33,
        description: 'Calcetines técnicos con compresión graduada. Tejido antibacteriano y costuras planas para evitar rozaduras.',
        descriptionExtended: {
            intro: 'Los Calcetines Performance de SPINLEY han sido desarrollados junto a fisioterapeutas deportivos para ofrecer la compresión ideal en cada zona del pie y el tobillo. El tejido antibacteriano mantiene los pies frescos durante toda la jornada.',
            features: [
                'Compresión graduada: 15-20 mmHg en tobillo',
                'Tejido antibacteriano con iones de plata',
                'Costuras planas invisibles antirrozaduras',
                'Zona de acolchado en talón y metatarso',
                'Arco de soporte anatómico',
                'Altura sobre el tobillo de 15cm',
                'Banda elástica superior antideslizante'
            ],
            sustainability: 'Los Calcetines Performance incorporan un 40% de algodón orgánico certificado GOTS. Fabricados en una planta que usa energía 100% renovable.'
        },
        specs: [
            { label: 'Material', value: '40% algodón orgánico, 35% poliéster, 20% poliamida, 5% elastano' },
            { label: 'Compresión', value: '15-20 mmHg (graduada)' },
            { label: 'Altura', value: '15cm sobre el tobillo' },
            { label: 'Tallas', value: 'S (36-39), M (40-43), L (44-47)' },
            { label: 'Cuidados', value: 'Lavar a máquina 40°C, no usar lejía' },
            { label: 'Certificaciones', value: 'GOTS (algodón orgánico), Oeko-Tex 100' },
            { label: 'Origen', value: 'Fabricado en España' }
        ],
        reviewsList: [
            { name: 'Ignacio P.', stars: 4, date: '11 de abril de 2026', text: 'Muy cómodos y la compresión se nota. Mis pies agradecen el acolchado en el talón.' },
            { name: 'Beatriz H.', stars: 4, date: '4 de abril de 2026', text: 'Buenos calcetines. No generan rozaduras y aguantan bien lavado tras lavado.' },
            { name: 'César O.', stars: 4, date: '27 de marzo de 2026', text: 'La calidad es buena para el precio. El tejido antibacteriano funciona, no hay olores después de una ruta larga.' },
            { name: 'Pilar M.', stars: 4, date: '18 de marzo de 2026', text: 'Muy buenos calcetines técnicos. Se ajustan bien y no bajan durante el pedaleo.' }
        ],
        images: [
            'images/CALCETINES 1.png',
            'images/LATERAL CALCETINES 1.png',
            'images/TRASERA CALCETINES 1.png',
            'images/DETALLE CALCETINES 1.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#9eef6b'],
        sizes: ['S', 'M', 'L']
    },
    9: {
        id: 9,
        name: 'ZAPATILLAS CARBON ROAD',
        category: 'ZAPATILLAS',
        price: 199.99,
        stock: true,
        rating: 4.8,
        reviews: 74,
        description: 'Zapatillas de carretera con suela de carbono. Máxima transferencia de potencia y cierre BOA de precisión.',
        descriptionExtended: {
            intro: 'Las Zapatillas Carbon Road de SPINLEY representan el estado del arte en calzado ciclista de carretera. La suela de carbono unidireccional garantiza una transferencia de potencia del 98%, mientras que el sistema de cierre BOA L6 permite un ajuste perfecto y rápido incluso en marcha.',
            features: [
                'Suela de carbono unidireccional 100% (índice 12)',
                'Sistema de cierre BOA L6 dual con microprecisión',
                'Upper de malla 3D termoformada',
                'Plantilla EVA con soporte de arco personalizable',
                'Compatible con calas 3 tornillos (Look, Shimano SPD-SL)',
                'Forro interior transpirable con tejido Dry-Technology',
                'Talón reforzado con TPU rígido'
            ],
            sustainability: 'La producción de las Zapatillas Carbon Road está certificada por la norma ISO 14001 de gestión ambiental. El 30% de los materiales del upper proceden de fuentes recicladas.'
        },
        specs: [
            { label: 'Suela', value: 'Carbono unidireccional, índice de rigidez 12' },
            { label: 'Upper', value: 'Malla 3D termoformada + refuerzos TPU' },
            { label: 'Cierre', value: 'BOA L6 dual (2 diales independientes)' },
            { label: 'Compatibilidad', value: '3 tornillos: Look, Shimano SPD-SL, Time' },
            { label: 'Peso', value: '240g por zapatilla (talla 42)' },
            { label: 'Tallas', value: '38 al 45 (disponible en ½ talla desde la 40)' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Italia' }
        ],
        reviewsList: [
            { name: 'Alberto M.', stars: 5, date: '17 de abril de 2026', text: 'Las mejores zapatillas que he tenido. La suela de carbono transmite toda la potencia y el BOA es comodísimo de ajustar.' },
            { name: 'Silvia R.', stars: 5, date: '10 de abril de 2026', text: 'Increíblemente ligeras. Noté la diferencia desde el primer pedaleo. Muy recomendables.' },
            { name: 'Jorge L.', stars: 5, date: '3 de abril de 2026', text: 'Producto de gama alta a un precio muy competitivo. El ajuste BOA es una maravilla.' },
            { name: 'Elena G.', stars: 4, date: '26 de marzo de 2026', text: 'Muy buenas zapatillas. El upper es muy transpirable y la suela rígida se nota mucho. Le quito una estrella porque tardaron en amoldarse al pie.' }
        ],
        images: [
            'images/ZAPATILLAS SPINLE.png',
            'images/LATERAL ZAPATILLAS SPINLE.png',
            'images/TRASERA ZAPATILLAS SPINLE.png',
            'images/DETALLE ZAPATILLAS SPINLE.png'
        ],
        colors: ['#1a1a1a', '#ffffff'],
        sizes: ['38', '39', '40', '41', '42', '43', '44', '45']
    },
    10: {
        id: 10,
        name: 'BIDON ECO 750ML',
        category: 'ACCESORIOS',
        price: 14.99,
        stock: true,
        rating: 4.1,
        reviews: 28,
        description: 'Bidón ecológico fabricado con materiales reciclados. Sin BPA, fácil de limpiar y compatible con todos los portabidones.',
        descriptionExtended: {
            intro: 'El Bidón Eco 750ml de SPINLEY es la opción más sostenible para hidratarte durante tus rutas. Fabricado íntegramente con plástico reciclado certificado sin BPA, ofrece una solución ecológica sin renunciar a la funcionalidad.',
            features: [
                'Plástico reciclado certificado libre de BPA y ftalatos',
                'Boquilla de silicona de apertura fácil con una mano',
                'Boca ancha para llenado y limpieza fáciles',
                'Compatible con todos los portabidones estándar',
                'Graduado en ml para control exacto de la hidratación',
                'Tapón de seguridad contra derrames',
                'Apto para bebidas calientes hasta 60°C'
            ],
            sustainability: 'El Bidón Eco está fabricado con un 95% de plástico postconsumo reciclado. Su producción consume un 70% menos de energía que un bidón convencional. Cada unidad reutiliza el equivalente a 3 botellas de plástico de 500ml.'
        },
        specs: [
            { label: 'Capacidad', value: '750ml' },
            { label: 'Material', value: '95% HDPE reciclado, 5% silicona (boquilla)' },
            { label: 'Libre de', value: 'BPA, ftalatos, plomo y PVC' },
            { label: 'Temperatura máx.', value: '60°C (bebidas calientes)' },
            { label: 'Peso', value: '85g (vacío)' },
            { label: 'Compatibilidad', value: 'Portabidones estándar (diámetro 74mm)' },
            { label: 'Origen', value: 'Fabricado en España con materiales 100% locales' }
        ],
        reviewsList: [
            { name: 'Manuel V.', stars: 4, date: '13 de abril de 2026', text: 'Buena calidad para el precio. Me gusta que sea ecológico y la boquilla funciona bien.' },
            { name: 'Nerea A.', stars: 4, date: '6 de abril de 2026', text: 'Práctico y ligero. Entra bien en los portabidones y no da sabor al agua.' },
            { name: 'Sergio P.', stars: 4, date: '29 de marzo de 2026', text: 'Buen bidón. La apertura con una mano es muy cómoda durante el pedaleo.' },
            { name: 'Laura S.', stars: 4, date: '21 de marzo de 2026', text: 'Me gusta que sea reciclado. Funciona perfectamente y es muy fácil de limpiar.' }
        ],
        images: [
            'images/BOTELLIN SPINLEY (1).png',
            'images/LATERAL BOTELLIN SPINLEY 1.png',
            'images/TRASERA BOTELLIN SPINLEY 1.png',
            'images/DETALLE BOTELLIN SPINLEY 1.png'
        ],
        colors: ['#9eef6b', '#2e5c8e', '#1a1a1a'],
        sizes: ['750ml']
    },
    12: {
        id: 12,
        name: 'CALCETINES ECO',
        category: 'CALCETINES',
        price: 24.99,
        stock: true,
        rating: 4.3,
        reviews: 25,
        description: 'Calcetines ecológicos fabricados con materiales reciclados. Transpirables y cómodos para largas rutas.',
        descriptionExtended: {
            intro: 'Los Calcetines Eco de SPINLEY son la opción más comprometida con el planeta sin renunciar al rendimiento. Fabricados con fibras recicladas y orgánicas, ofrecen una comodidad superior durante toda la ruta mientras cuidan el medioambiente.',
            features: [
                'Tejido EcoBlend: 60% algodón orgánico + 40% poliéster reciclado',
                'Tejido de punto tridimensional para máxima transpirabilidad',
                'Costuras planas ultrafinas sin rozaduras',
                'Zona de acolchado diferencial por zonas',
                'Altura media (sobre el tobillo: 12cm)',
                'Diseño ergonómico derecho/izquierdo',
                'Tinte libre de metales pesados'
            ],
            sustainability: 'Los Calcetines Eco usan fibras de algodón orgánico certificado GOTS y poliéster reciclado de botellas PET. El proceso de tinte no usa metales pesados y el agua residual es tratada y reutilizada en planta.'
        },
        specs: [
            { label: 'Material', value: '60% algodón orgánico GOTS, 40% poliéster reciclado' },
            { label: 'Altura', value: '12cm sobre el tobillo' },
            { label: 'Tallas', value: 'S (36-39), M (40-43), L (44-47)' },
            { label: 'Cuidados', value: 'Lavar a máquina 30°C, no usar secadora ni lejía' },
            { label: 'Certificaciones', value: 'GOTS, Global Recycled Standard (GRS)' },
            { label: 'Diseño', value: 'Ergonómico derecho/izquierdo' },
            { label: 'Origen', value: 'Fabricado en España con materiales certificados' }
        ],
        reviewsList: [
            { name: 'Carla N.', stars: 5, date: '15 de abril de 2026', text: 'Los mejores calcetines de ciclismo que he tenido. Muy suaves y sin rozaduras en ningún punto.' },
            { name: 'Óscar F.', stars: 4, date: '8 de abril de 2026', text: 'Muy cómodos y transpirables. Me gusta la diferenciación izquierdo/derecho, se nota en el ajuste.' },
            { name: 'Inés T.', stars: 4, date: '1 de abril de 2026', text: 'Buenos calcetines. Me gustan especialmente porque son ecológicos. La calidad es muy buena.' },
            { name: 'David C.', stars: 4, date: '24 de marzo de 2026', text: 'Muy buen producto. Aguantan bien los lavados y mantienen la forma.' }
        ],
        images: [
            'images/CALCETINES 2.png',
            'images/LATERAL CALCETINES 2.png',
            'images/TRASERA CALCETINES 2.png',
            'images/DETALLE CALCETINES 2.png'
        ],
        colors: ['#1a1a1a', '#9eef6b', '#c4382e'],
        sizes: ['S', 'M', 'L']
    },
    13: {
        id: 13,
        name: 'CASCO URBAN LITE',
        category: 'CASCOS',
        price: 119.99,
        stock: true,
        rating: 4.2,
        reviews: 35,
        description: 'Casco urbano ligero con diseño moderno. Ideal para desplazamientos diarios con máxima seguridad y estilo.',
        descriptionExtended: {
            intro: 'El Casco Urban Lite de SPINLEY está pensado para el ciclista urbano que busca seguridad sin renunciar al estilo. Su perfil minimalista y su peso ultraligero lo hacen perfecto para los desplazamientos diarios en ciudad.',
            features: [
                'Construcción micro shell de perfil ultra bajo',
                'Forma semiredonda de inspiración retro-moderna',
                '10 ranuras de ventilación integradas en el diseño',
                'Forro interior en tejido cachemir antibacteriano',
                'Sistema de ajuste dial trasero de giro rápido',
                'Compatible con luz trasera magnética (accesorio opcional)',
                'Disponible en 6 combinaciones de color'
            ],
            sustainability: 'El Casco Urban Lite está fabricado con un 25% de materiales reciclados y su embalaje es 100% kraft reciclado. La empresa fabrica los cascos urbanos con energía solar en su planta de producción.'
        },
        specs: [
            { label: 'Material exterior', value: 'PC micro-shell ultrafino' },
            { label: 'Material interior', value: 'EPS expandido de baja densidad' },
            { label: 'Peso', value: '240g (talla M)' },
            { label: 'Tallas disponibles', value: 'S (52-55cm), M (55-58cm), L (58-62cm)' },
            { label: 'Ventilación', value: '10 ranuras integradas' },
            { label: 'Homologación', value: 'CE EN 1078' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Taiwan' }
        ],
        reviewsList: [
            { name: 'Alicia B.', stars: 5, date: '19 de abril de 2026', text: 'Me encanta el diseño. Es ligero y cómodo para usarlo todos los días para ir al trabajo.' },
            { name: 'Ernesto M.', stars: 4, date: '12 de abril de 2026', text: 'Muy buen casco urbano. El ajuste dial es muy preciso y se coloca en segundos.' },
            { name: 'Valeria C.', stars: 4, date: '5 de abril de 2026', text: 'Bonito diseño y muy cómodo. La ventilación es suficiente para el uso diario en ciudad.' },
            { name: 'Rubén S.', stars: 4, date: '28 de marzo de 2026', text: 'Ligero y estiloso. Perfecto para el día a día. La ventilación es básica pero suficiente.' }
        ],
        images: [
            'images/CASCO 2.png',
            'images/LATERAL CASCO 2.png',
            'images/TRASERA CASCO 2.png',
            'images/DETALLE CASCO 2.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#9eef6b'],
        sizes: ['S', 'M', 'L']
    },
    14: {
        id: 14,
        name: 'CASCO ENDURO EXTREME',
        category: 'CASCOS',
        price: 159.99,
        stock: true,
        rating: 4.8,
        reviews: 48,
        description: 'Casco de enduro con protección integral y mentonera desmontable. Diseñado para los descensos más exigentes.',
        descriptionExtended: {
            intro: 'El Casco Enduro Extreme de SPINLEY es la máxima expresión en protección para enduro y descenso. Su mentonera desmontable en segundos permite usarlo como casco integral en DH o como casco abierto en los ascensos.',
            features: [
                'Mentonera desmontable con sistema de liberación rápida',
                'Carcasa exterior de fibra de vidrio reforzada',
                'Interior de EPS triple densidad con MIPS 2.0',
                'Visera ajustable y desmontable',
                'Almohadillas de espuma viscoelástica de memoria',
                'Cierre de mentonera Fidlock magnético',
                'Compatible con gafas de enduro y masks completas'
            ],
            sustainability: 'El Casco Enduro Extreme cumple con el Reglamento Europeo de Sustancias Químicas (REACH). La empresa colabora con programas de reciclaje de cascos al final de su vida útil.'
        },
        specs: [
            { label: 'Material exterior', value: 'Fibra de vidrio reforzada (FRP)' },
            { label: 'Material interior', value: 'EPS triple densidad + MIPS 2.0' },
            { label: 'Peso', value: '890g con mentonera / 620g sin mentonera (talla M)' },
            { label: 'Tallas disponibles', value: 'S (53-56cm), M (57-59cm), L (60-62cm)' },
            { label: 'Ventilación', value: '8 canales de gran sección' },
            { label: 'Homologación', value: 'CE EN 1078 (abierto), CE EN 1078 + ASTM F1952 DH (integral)' },
            { label: 'Origen', value: 'Diseñado en España, fabricado en Italia' }
        ],
        reviewsList: [
            { name: 'Adrián G.', stars: 5, date: '18 de abril de 2026', text: 'El mejor casco que he tenido para enduro. La mentonera se quita y pone en segundos y la protección es excelente.' },
            { name: 'Miriam L.', stars: 5, date: '11 de abril de 2026', text: 'Muy sólido y bien construido. La tecnología MIPS da mucha tranquilidad en los descensos técnicos.' },
            { name: 'Guillermo P.', stars: 5, date: '4 de abril de 2026', text: 'Increíble casco. Las almohadillas de memoria se adaptan perfectamente a la cabeza.' },
            { name: 'Ana M.', stars: 4, date: '27 de marzo de 2026', text: 'Muy buena protección. Pesa bastante con la mentonera pero es lo esperado en esta categoría.' }
        ],
        images: [
            'images/CASCO 4.png',
            'images/LATERAL CASCO 4.png',
            'images/TRASERA CASCO 4.png',
            'images/DETALLE CASCO 4.png'
        ],
        colors: ['#1a1a1a', '#c4382e', '#2e5c8e'],
        sizes: ['S', 'M', 'L']
    },
    15: {
        id: 15,
        name: 'BIDON PRO 750ML',
        category: 'ACCESORIOS',
        price: 17.99,
        stock: true,
        rating: 4.4,
        reviews: 31,
        description: 'Bidón profesional con sistema de flujo optimizado. Agarre ergonómico y materiales de alta calidad.',
        descriptionExtended: {
            intro: 'El Bidón Pro 750ml de SPINLEY está diseñado para los ciclistas más exigentes. Su sistema de válvula de flujo optimizado permite una hidratación rápida y eficiente sin interrumpir el ritmo de pedaleo, mientras que el agarre ergonómico garantiza un manejo seguro incluso con guantes.',
            features: [
                'Válvula de flujo optimizado (200ml en 2 segundos)',
                'Cuerpo ergonómico con zonas de agarre antideslizante',
                'Material Tritan libre de BPA y ftalatos',
                'Boquilla de silicona autoobturante sin goteo',
                'Capacidad real de 750ml hasta el borde',
                'Compatible con portabidones estándar y competición',
                'Resistente al lavavajillas (temperatura baja)'
            ],
            sustainability: 'El Bidón Pro está fabricado en Tritan, un copoliéster de alta resistencia que no contiene BPA, BPS ni otros bisfenoles. Su producción cumple con los más altos estándares ambientales de la industria europea.'
        },
        specs: [
            { label: 'Capacidad', value: '750ml' },
            { label: 'Material', value: 'Tritan copoliéster (BPA free, BPS free)' },
            { label: 'Flujo', value: '200ml en 2 segundos (válvula optimizada)' },
            { label: 'Temperatura máx.', value: '50°C' },
            { label: 'Peso', value: '95g (vacío)' },
            { label: 'Compatibilidad', value: 'Portabidones estándar y de competición' },
            { label: 'Lavavajillas', value: 'Apto (temperatura baja)' }
        ],
        reviewsList: [
            { name: 'Emilio R.', stars: 5, date: '20 de abril de 2026', text: 'El flujo de este bidón es increíble. En un segundo tengo agua en la boca sin reducir el ritmo.' },
            { name: 'Clara V.', stars: 4, date: '13 de abril de 2026', text: 'Muy buena calidad. La boquilla no gotea en absoluto y el agarre es excelente.' },
            { name: 'Iván M.', stars: 4, date: '6 de abril de 2026', text: 'Buen bidón profesional. Se nota la diferencia respecto a los básicos en el flujo y en la comodidad del agarre.' },
            { name: 'Rebeca O.', stars: 5, date: '29 de marzo de 2026', text: 'Excelente producto. Fácil de limpiar, no da sabor al agua y la válvula funciona perfectamente.' }
        ],
        images: [
            'images/BOTELLIN SPINLEY (2).png',
            'images/LATERAL BOTELLIN SPINLEY 2.png',
            'images/TRASERA BOTELLIN SPINLEY 2.png',
            'images/DETALLE BOTELLIN SPINLEY 2.png'
        ],
        colors: ['#2e5c8e', '#9eef6b', '#1a1a1a'],
        sizes: ['750ml']
    }
};

// =====================
// PRODUCT DETAIL
// =====================
function changeImage(imgElement) {
    // Para el grid de 4 imágenes, simplemente aplicamos un efecto visual
    const galleryImages = document.querySelectorAll('.gallery-image');
    galleryImages.forEach(img => img.classList.remove('active'));
    imgElement.classList.add('active');
}

function loadProductFromURL() {
    // Only run on product detail page
    if (!window.location.pathname.includes('producto.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;
    const product = productsDatabase[productId];
    
    if (!product) {
        // Redirect to products page if product not found
        window.location.href = 'productos.html';
        return;
    }
    
    // Update page title
    document.title = `${product.name} - SPINLEY`;
    
    // Update breadcrumb
    const breadcrumbSpan = document.querySelector('.breadcrumb span:last-child');
    if (breadcrumbSpan) breadcrumbSpan.textContent = product.name;
    
    // Update gallery grid with all product images
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid && product.images.length > 0) {
        galleryGrid.innerHTML = product.images.map((img, index) => `
            <img class="gallery-image" src="${img}" alt="Vista ${index + 1}" onclick="changeImage(this)">
        `).join('');
    }
    
    // Update product category
    const categoryTag = document.querySelector('.product-category-tag');
    if (categoryTag) categoryTag.textContent = product.category;
    
    // Update product name
    const productTitle = document.querySelector('.product-title');
    if (productTitle) productTitle.textContent = product.name;
    
    // Update rating
    const starsContainer = document.querySelector('.product-rating .stars');
    if (starsContainer) {
        const fullStars = Math.floor(product.rating);
        const emptyStars = 5 - fullStars;
        starsContainer.innerHTML = `<span>${'★'.repeat(fullStars)}</span><span class="empty">${'★'.repeat(emptyStars)}</span>`;
    }
    
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) ratingText.textContent = `${product.rating} / 5 (${product.reviews} valoraciones)`;
    
    // Update price
    const priceElement = document.querySelector('.product-price-large');
    if (priceElement) priceElement.textContent = product.price.toFixed(2).replace('.', ',') + '€';
    
    // Update stock
    const stockElement = document.querySelector('.product-stock');
    if (stockElement) {
        stockElement.textContent = product.stock ? 'En stock' : 'Agotado';
        stockElement.style.color = product.stock ? '#9eef6b' : '#ff4444';
    }
    
    // Update description
    const descriptionElement = document.querySelector('.product-description p');
    if (descriptionElement) descriptionElement.textContent = product.description;
    
    // Update colors
    const colorSelector = document.querySelector('.color-selector');
    if (colorSelector && product.colors) {
        colorSelector.innerHTML = product.colors.map((color, index) => `
            <button class="color-btn ${index === 0 ? 'active' : ''}" data-color="${color}" style="background: ${color}"></button>
        `).join('');
        
        // Re-attach click events
        colorSelector.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                colorSelector.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Update sizes
    const sizeSelector = document.querySelector('.size-selector');
    if (sizeSelector && product.sizes) {
        sizeSelector.innerHTML = product.sizes.map((size, index) => `
            <button class="size-btn ${index === Math.floor(product.sizes.length / 2) ? 'active' : ''}">${size}</button>
        `).join('');
        
        // Re-attach click events
        sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Update description tab
    const descTab = document.getElementById('description');
    if (descTab && product.descriptionExtended) {
        const d = product.descriptionExtended;
        descTab.innerHTML = `
            <h3>Descripción del producto</h3>
            <p>${d.intro}</p>
            <h4>Características principales:</h4>
            <ul>
                ${d.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <h4>Sostenibilidad:</h4>
            <p>${d.sustainability}</p>
        `;
    }

    // Update specs tab
    const specsTab = document.getElementById('specs');
    if (specsTab && product.specs) {
        specsTab.innerHTML = `
            <h3>Especificaciones técnicas</h3>
            <ul>
                ${product.specs.map(s => `<li><strong>${s.label}:</strong> ${s.value}</li>`).join('')}
            </ul>
        `;
    }

    // Update reviews tab
    const reviewsRatingNumber = document.querySelector('.rating-number');
    if (reviewsRatingNumber) reviewsRatingNumber.textContent = product.rating;

    const reviewsStars = document.querySelector('.stars-large');
    if (reviewsStars) {
        const fullStars = Math.floor(product.rating);
        const emptyStars = 5 - fullStars;
        reviewsStars.innerHTML = '★'.repeat(fullStars) + `<span class="empty">${'★'.repeat(emptyStars)}</span>`;
    }

    const reviewsCount = document.querySelector('.reviews-summary p');
    if (reviewsCount) reviewsCount.textContent = `${product.reviews} valoraciones`;

    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList && product.reviewsList) {
        reviewsList.innerHTML = product.reviewsList.map(r => {
            const fullStars = '★'.repeat(r.stars);
            const emptyStars = r.stars < 5 ? `<span class="empty">${'★'.repeat(5 - r.stars)}</span>` : '';
            return `
                <div class="review-item">
                    <div class="review-header">
                        <strong>${r.name}</strong>
                        <div class="stars-small">${fullStars}${emptyStars}</div>
                    </div>
                    <p class="review-date">${r.date}</p>
                    <p>${r.text}</p>
                </div>
            `;
        }).join('') + `<button class="btn btn-secondary">Ver más valoraciones</button>`;
    }
}

function initProductDetail() {
    // Load product data from URL
    loadProductFromURL();
    
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const quantity = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (qtyMinus && quantity) {
        qtyMinus.addEventListener('click', () => {
            quantity.value = Math.max(1, parseInt(quantity.value) - 1);
        });
    }

    if (qtyPlus && quantity) {
        qtyPlus.addEventListener('click', () => {
            quantity.value = parseInt(quantity.value) + 1;
        });
    }

    if (addToCartBtn && quantity) {
        addToCartBtn.addEventListener('click', () => {
            const qty = parseInt(quantity.value);
            // Get product info from URL or page
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id')) || 1;
            const product = productsDatabase[productId];
            
            if (product) {
                addToCart(productId, product.name, product.price, qty);
                showNotification(`Añadido al carrito (${qty} unidad${qty > 1 ? 'es' : ''})`);
                quantity.value = 1;
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            const targetTab = document.getElementById(tabName);
            if (targetTab) targetTab.classList.add('active');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// =====================
// EVENTS SECTION
// =====================
function initEvents() {
    const eventsSection = document.querySelector('.events');
    const eventsBtn = eventsSection?.querySelector('.btn');
    
    if (eventsBtn) {
        eventsBtn.href = '#';
        eventsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showEventsModal();
        });
    }
}

function showEventsModal() {
    // Remove existing modal
    const existingModal = document.getElementById('events-modal');
    if (existingModal) existingModal.remove();
    
    const events = [
        {
            date: '15 Mayo 2026',
            title: 'Ruta Costera Barcelona',
            description: 'Recorrido de 80km por la costa catalana con paradas en puntos panorámicos.',
            location: 'Barcelona',
            participants: 45
        },
        {
            date: '22 Mayo 2026',
            title: 'Mountain Challenge',
            description: 'Ascenso a los puertos de montaña más emblemáticos del Pirineo.',
            location: 'Pirineos',
            participants: 30
        },
        {
            date: '5 Junio 2026',
            title: 'Night Ride Madrid',
            description: 'Rodada nocturna por el centro de Madrid con luces LED.',
            location: 'Madrid',
            participants: 60
        },
        {
            date: '19 Junio 2026',
            title: 'Gravel Experience',
            description: 'Aventura por caminos de tierra y senderos forestales.',
            location: 'Navarra',
            participants: 35
        }
    ];
    
    const modal = document.createElement('div');
    modal.id = 'events-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a0a;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        padding: 30px;
        border: 1px solid #1a1a1a;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h2 style="color: #fff; margin: 0; font-size: 28px;">Próximos Eventos</h2>
            <button id="close-events" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 28px; line-height: 1;">&times;</button>
        </div>
        <p style="color: #888; margin-bottom: 30px;">Únete a nuestra comunidad ciclista en estas experiencias únicas</p>
        <div class="events-list">
            ${events.map(event => `
                <div style="background: #111; border-radius: 12px; padding: 25px; margin-bottom: 20px; border: 1px solid #1a1a1a; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 250px;">
                            <span style="color: #9eef6b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${event.date}</span>
                            <h3 style="color: #fff; margin: 10px 0; font-size: 20px;">${event.title}</h3>
                            <p style="color: #888; font-size: 14px; line-height: 1.6;">${event.description}</p>
                            <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
                                <span style="color: #666; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    ${event.location}
                                </span>
                                <span style="color: #666; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    ${event.participants} inscritos
                                </span>
                            </div>
                        </div>
                        <button style="background: #9eef6b; color: #050505; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; transition: all 0.3s ease;" 
                            onmouseover="this.style.background='#8ae05c'" 
                            onmouseout="this.style.background='#9eef6b'"
                            onclick="registerForEvent('${event.title}')">
                            Inscribirse
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal events
    document.getElementById('close-events').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function registerForEvent(eventName) {
    showNotification(`Te has inscrito en "${eventName}". Recibirás más información por email.`);
}

// =====================
// CONTACT FORM
// =====================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const subject = document.getElementById('subject')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const privacy = document.getElementById('privacy')?.checked;

        if (!name || !email || !subject || !message || !privacy) {
            showNotification('Por favor, completa todos los campos requeridos');
            return;
        }

        if (!email.includes('@')) {
            showNotification('Por favor, introduce un email válido');
            return;
        }

        showNotification('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
        form.reset();
    });
}

// =====================
// CHECKOUT
// =====================
function initCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                showNotification('Tu carrito está vacío');
                return;
            }
            showNotification('Redirigiendo al proceso de pago...');
            // Here you would redirect to checkout page
            setTimeout(() => {
                showNotification('Funcionalidad de pago en desarrollo');
            }, 1500);
        });
    }
    
    // Discount code
    const discountBtn = document.querySelector('.discount-code .btn-secondary');
    const discountInput = document.querySelector('.discount-input');
    
    if (discountBtn && discountInput) {
        discountBtn.addEventListener('click', () => {
            const code = discountInput.value.trim().toUpperCase();
            if (!code) {
                showNotification('Introduce un código de descuento');
                return;
            }
            
            const validCodes = {
                'SPINLEY10': 10,
                'CICLISMO20': 20,
                'BIENVENIDO': 15
            };
            
            if (validCodes[code]) {
                showNotification(`Código aplicado: ${validCodes[code]}% de descuento`);
                // Apply discount to total
                applyDiscount(validCodes[code]);
            } else {
                showNotification('Código de descuento no válido');
            }
        });
    }
}

function applyDiscount(percent) {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * (percent / 100);
    const shipping = (subtotal - discount) >= 80 ? 0 : 5;
    const total = subtotal - discount + shipping;
    
    const totalEl = document.getElementById('total');
    if (totalEl) {
        totalEl.innerHTML = `<span style="text-decoration: line-through; color: #666; margin-right: 10px;">${subtotal.toFixed(2)}€</span>${total.toFixed(2)}€`;
    }
}

// =====================
// NOTIFICATIONS
// =====================
function showNotification(message) {
    // Remove existing notifications
    document.querySelectorAll('.spinley-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'spinley-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #9eef6b;
        color: #050505;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(158, 239, 107, 0.4);
        max-width: 350px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initSearch();
    initCarousel();
    initFilters();
    initProductDetail();
    initContactForm();
    initEvents();
    initCheckout();
    initFavoriteButtons();
    initFavoritesModal();

    // Load cart page if on cart page
    if (window.location.pathname.includes('carrito')) {
        renderCart();
    }

    updateCartCount();
    updateFavoritesCount();

    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// =====================
// CSS ANIMATIONS
// =====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .header-search.mobile-active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #050505;
        padding: 15px;
        border-bottom: 1px solid #1a1a1a;
    }
    
    .search-dropdown a:hover {
        background: #1a1a1a !important;
    }
    
    .favorite-btn:hover {
        transform: scale(1.1);
    }
    
    .favorite-btn.active svg {
        fill: #9eef6b !important;
    }
`;
document.head.appendChild(style);

// =====================
// LEAD CAPTURE POP-UP
// =====================
function initLeadPopup() {
    const overlay = document.getElementById('lead-popup-overlay');
    if (!overlay) return;

    // Show after 2 seconds if not already dismissed
    const dismissed = sessionStorage.getItem('spinley_popup_dismissed');
    if (!dismissed) {
        setTimeout(() => {
            overlay.classList.remove('hidden');
        }, 2000);
    } else {
        overlay.classList.add('hidden');
    }

    // Close button
    const closeBtn = document.getElementById('lead-popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Close on overlay click (outside modal)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });

    // Carousel logic
    const slides = overlay.querySelectorAll('.lead-popup-slide');
    const dots = overlay.querySelectorAll('.lead-popup-dot');
    let currentSlide = 0;
    let autoplayTimer = null;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function startAutoplay() {
        autoplayTimer = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 3500);
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    const prevBtn = document.getElementById('popup-prev');
    const nextBtn = document.getElementById('popup-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            resetAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            resetAutoplay();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.index));
            resetAutoplay();
        });
    });

    startAutoplay();

    // Form submission
    const form = document.getElementById('lead-popup-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('lead-email');
            const privacyCheck = document.getElementById('consent-privacy');

            if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                emailInput.style.borderColor = '#ff4444';
                emailInput.focus();
                return;
            }
            emailInput.style.borderColor = '';

            if (!privacyCheck.checked) {
                privacyCheck.parentElement.style.outline = '1px solid #ff4444';
                return;
            }
            privacyCheck.parentElement.style.outline = '';

            // Replace form with success message
            const formSide = form.parentElement;
            form.style.display = 'none';

            const successEl = document.createElement('div');
            successEl.className = 'lead-popup-success visible';
            successEl.innerHTML = `
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
                <h3>&#161;Ya tienes tu 15% de descuento!</h3>
                <p>Hemos enviado tu c&oacute;digo a <strong>${emailInput.value}</strong>.<br>Revisa tu bandeja de entrada.</p>
            `;
            formSide.appendChild(successEl);

            // Auto-close after 4 seconds
            setTimeout(closePopup, 4000);
        });
    }

    function closePopup() {
        overlay.classList.add('hidden');
        sessionStorage.setItem('spinley_popup_dismissed', '1');
        clearInterval(autoplayTimer);
    }
}

// Initialize popup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initLeadPopup();
});
