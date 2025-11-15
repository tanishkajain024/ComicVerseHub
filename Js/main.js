// Main JavaScript for ComicVerse Hub

// ========== UTILITY FUNCTIONS ==========

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('comicverseCart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('comicverseCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => badge.textContent = count);
}

// Add item to cart
function addToCart(comicId) {
    const comic = comics.find(c => c.id === comicId);
    if (!comic) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === comicId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: comic.id,
            title: comic.title,
            publisher: comic.publisher,
            price: comic.price,
            image: comic.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showNotification(`${comic.title} added to cart!`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        font-weight: 700;
        z-index: 10000;
        animation: slideIn 0.5s ease;
        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ========== MOBILE MENU ==========
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.style.display === 'block') {
                mobileMenu.style.display = 'none';
            } else {
                mobileMenu.style.display = 'block';
            }
        });
    }

    // Update cart count on all pages
    updateCartCount();
});

// ========== HOMEPAGE FUNCTIONALITY ==========
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize carousel
        initCarousel();
        
        // Load new releases
        loadNewReleases();
        
        // Load popular series
        loadPopularSeries();
    });
}

function initCarousel() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.getElementById('carouselIndicators');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!slides.length) return;

    // Create indicators
    slides.forEach((_, index) => {
        const indicator = document.createElement('span');
        indicator.className = index === 0 ? 'active' : '';
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        indicators.children[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        indicators.children[currentSlide].classList.add('active');
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Auto-advance carousel
    setInterval(() => goToSlide(currentSlide + 1), 5000);
}

function loadNewReleases() {
    const container = document.getElementById('newReleases');
    if (!container) return;

    const featuredComics = comics.filter(c => c.featured).slice(0, 4);
    container.innerHTML = featuredComics.map(comic => createComicCard(comic)).join('');
}

function loadPopularSeries() {
    const container = document.getElementById('popularSeries');
    if (!container) return;

    const popularComics = comics
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
    
    container.innerHTML = popularComics.map(comic => createComicCard(comic)).join('');
}

function createComicCard(comic) {
    return `
        <div class="comic-card" onclick="window.location.href='comic-detail.html?id=${comic.id}'">
            <img src="${comic.image}" alt="${comic.title}" class="comic-image">
            <div class="comic-info">
                <h3 class="comic-title">${comic.title}</h3>
                <p class="comic-meta">${comic.publisher} • ${comic.genre}</p>
                <div class="comic-price-row">
                    <span class="comic-price">$${comic.price.toFixed(2)}</span>
                    <span class="comic-rating">⭐ ${comic.rating}</span>
                </div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${comic.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// ========== BROWSE PAGE FUNCTIONALITY ==========
if (window.location.pathname.includes('browse.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const publisherParam = urlParams.get('publisher');
        
        if (publisherParam) {
            document.getElementById('publisherFilter').value = publisherParam;
        }
        
        loadComics();
        
        // Add event listeners for filters
        document.getElementById('publisherFilter').addEventListener('change', loadComics);
        document.getElementById('genreFilter').addEventListener('change', loadComics);
        document.getElementById('sortFilter').addEventListener('change', loadComics);
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
    });
}

function loadComics() {
    const publisherFilter = document.getElementById('publisherFilter').value;
    const genreFilter = document.getElementById('genreFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filteredComics = [...comics];
    
    // Apply filters
    if (publisherFilter !== 'all') {
        filteredComics = filteredComics.filter(c => c.publisher === publisherFilter);
    }
    
    if (genreFilter !== 'all') {
        filteredComics = filteredComics.filter(c => c.genre === genreFilter);
    }
    
    // Apply sorting
    switch(sortFilter) {
        case 'title':
            filteredComics.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'price-low':
            filteredComics.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredComics.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredComics.sort((a, b) => b.rating - a.rating);
            break;
        case 'date':
            filteredComics.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            break;
    }
    
    const container = document.getElementById('comicGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = filteredComics.length;
    container.innerHTML = filteredComics.map(comic => createComicCard(comic)).join('');
}

function resetFilters() {
    document.getElementById('publisherFilter').value = 'all';
    document.getElementById('genreFilter').value = 'all';
    document.getElementById('sortFilter').value = 'title';
    loadComics();
}

// ========== DETAIL PAGE FUNCTIONALITY ==========
if (window.location.pathname.includes('comic-detail.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const comicId = parseInt(urlParams.get('id'));
        
        if (comicId) {
            loadComicDetail(comicId);
            loadRelatedComics(comicId);
        } else {
            window.location.href = 'browse.html';
        }
    });
}

function loadComicDetail(comicId) {
    const comic = comics.find(c => c.id === comicId);
    if (!comic) {
        window.location.href = 'browse.html';
        return;
    }
    
    const container = document.getElementById('comicDetail');
    container.innerHTML = `
        <div class="detail-image">
            <img src="${comic.image}" alt="${comic.title}">
        </div>
        <div class="detail-content">
            <span class="detail-badge">${comic.publisher} • ${comic.genre}</span>
            <h1 class="detail-title">${comic.title}</h1>
            <div class="detail-rating">
                <span>⭐⭐⭐⭐⭐</span>
                <span>${comic.rating} / 5.0</span>
            </div>
            <div class="detail-price">$${comic.price.toFixed(2)}</div>
            <div class="detail-synopsis">
                <h3>Synopsis</h3>
                <p>${comic.synopsis}</p>
            </div>
            <div class="detail-meta">
                <div class="meta-item">
                    <p>Creators</p>
                    <p>${comic.creators}</p>
                </div>
                <div class="meta-item">
                    <p>Release Date</p>
                    <p>${new Date(comic.releaseDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn-large btn-add-to-cart" onclick="addToCart(${comic.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

function loadRelatedComics(currentComicId) {
    const currentComic = comics.find(c => c.id === currentComicId);
    if (!currentComic) return;
    
    const relatedComics = comics
        .filter(c => c.id !== currentComicId && c.publisher === currentComic.publisher)
        .slice(0, 4);
    
    const container = document.getElementById('relatedComics');
    container.innerHTML = relatedComics.map(comic => createComicCard(comic)).join('');
}

// ========== CART PAGE FUNCTIONALITY ==========
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCartItems();
        
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
        
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
    });
}

function loadCartItems() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Start adding some amazing comics!</p>
                <a href="browse.html" class="btn-primary">Browse Comics</a>
            </div>
        `;
        updateCartSummary(0, 0, 0);
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-meta">${item.publisher}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
    
    calculateCartTotal();
}

function updateQuantity(itemId, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        saveCart(cart);
        loadCartItems();
    }
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    loadCartItems();
    showNotification('Item removed from cart');
}

function calculateCartTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const shipping = cart.length > 0 ? 5.99 : 0;
    const total = subtotal + tax + shipping;
    
    updateCartSummary(subtotal, tax, shipping, total);
}

function updateCartSummary(subtotal, tax, shipping, total) {
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'FREE';
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const modalDetails = document.getElementById('modalDetails');
    
    const itemsList = cart.map(item => 
        `<p>✓ ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`
    ).join('');
    
    modalDetails.innerHTML = itemsList;
    modal.classList.add('active');
    
    // Clear cart
    localStorage.removeItem('comicverseCart');
    updateCartCount();
}

function closeModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    window.location.href = 'index.html';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);