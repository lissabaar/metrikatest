window.dataLayer = window.dataLayer || [];
const CURRENCY = "RUB";

// Товары магазина
const products = [
    {
        id: '01',
        name: 'Stray Kids - SKZHOP HIPTAPE \'合 (HOP)\'',
        price: 2500,
        image: 'https://candyshopkpop.ru/pictures/product/small/7831_small.jpg',
        variants: {
            version: ['HIPTAPE', 'SKZHOP', 'ACCORDION']
        },
        category: 'Albums'
    },
    {
        id: '02',
        name: 'Stray Kids - ATE',
        price: 2250,
        image: 'https://candyshopkpop.ru/pictures/product/small/7493_small.jpg',
        variants: {
            version: ['ATE', 'ACCORDION', 'NEMO']
        },
        category: 'Albums'
    },
    {
        id: '03',
        name: 'Stray Kids - 樂 ROCK-STAR',
        price: 1900,
        image: 'https://candyshopkpop.ru/pictures/product/small/7443_small.png',
        variants: {
            version: ['STANDARD', 'HEADLINER', 'LIMITED']
        },
        category: 'Albums'
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ========== ОСНОВНЫЕ ФУНКЦИИ ========== //

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.textContent = count;
}

// ========== ФУНКЦИИ ДЛЯ ОТПРАВКИ СОБЫТИЙ ========== //

function sendAddEvent(product, quantity = 1) {
    const event = {
        "ecommerce": {
            "currencyCode": CURRENCY,
            "add": {
                "products": [{
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "variant": JSON.stringify(product.variant),
                    "category": product.category,
                    "quantity": quantity
                }]
            }
        }
    };
    console.log('Sending add event:', event);
    dataLayer.push(event);
}

function sendRemoveEvent(product, quantity = 1) {
    const event = {
        "ecommerce": {
            "currencyCode": CURRENCY,
            "remove": {
                "products": [{
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "variant": JSON.stringify(product.variant),
                    "category": product.category,
                    "quantity": quantity
                }]
            }
        }
    };
    console.log('Sending remove event:', event);
    dataLayer.push(event);
}

function sendPurchaseEvent(orderId, products, revenue) {
    const event = {
        "ecommerce": {
            "currencyCode": CURRENCY,
            "purchase": {
                "actionField": {
                    "id": orderId,
                    "revenue": revenue
                },
                "products": products.map(item => ({
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "variant": JSON.stringify(item.variant),
                    "category": item.category,
                    "quantity": item.quantity
                }))
            }
        }
    };
    console.log('Sending purchase event:', event);
    dataLayer.push(event);
}

// ========== ФУНКЦИИ КОРЗИНЫ ========== //

function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) newQuantity = 1;
    if (newQuantity < 1) newQuantity = 1;
    
    const oldQuantity = cart[index].quantity;
    const quantityChange = newQuantity - oldQuantity;
    
    if (quantityChange === 0) return;
    
    cart[index].quantity = newQuantity;
    saveCart();
    
    if (quantityChange > 0) {
        sendAddEvent(cart[index], quantityChange);
    } else {
        sendRemoveEvent(cart[index], Math.abs(quantityChange));
    }
    
    renderCart();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variants = {};
    document.querySelectorAll(`[data-product="${productId}"]`).forEach(select => {
        variants[select.dataset.variant] = select.value;
    });

    const existingIndex = cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variants));

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
        sendAddEvent(cart[existingIndex]);
    } else {
        const newItem = {
            ...product,
            variant: variants,
            quantity: 1
        };
        cart.push(newItem);
        sendAddEvent(newItem);
    }

    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const [removedItem] = cart.splice(index, 1);
    sendRemoveEvent(removedItem, removedItem.quantity);
    
    saveCart();
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const address = document.getElementById('address')?.value.trim();

    if (name && phone && email && address) {
        if (!name || !phone || !email || !address) {
            alert('Пожалуйста, заполните все поля формы!');
            return;
        }
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = 'order_' + Date.now();
    
    // Отправляем событие покупки
    sendPurchaseEvent(orderId, [...cart], total);

    // Очищаем корзину
    cart = [];
    saveCart();
    
    // Показываем сообщение без редиректа
    alert(`Заказ #${orderId} оформлен успешно!\nСумма: ${total.toLocaleString()} руб.`);
    renderCart();
}

// ========== РЕНДЕР ФУНКЦИИ ========== //

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} руб.</p>
                ${Object.entries(product.variants).map(([key, values]) => `
                    <label class="variant-label">${key}:</label>
                    <select data-product="${product.id}" data-variant="${key}">
                        ${values.map(v => `<option>${v}</option>`).join('')}
                    </select>
                `).join('')}
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">В корзину</button>
                <a href="product-${product.id}.html" class="btn btn-outline">Подробнее</a>
            </div>
        </div>
    `).join('');

    // Событие просмотра товаров
    dataLayer.push({
        ecommerce: {
            currencyCode: CURRENCY,
            impressions: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                list: 'Stray Kids Albums',
                position: parseInt(p.id)
            }))
        }
    });
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        if (cartSummary) cartSummary.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
    if (cartSummary) cartSummary.classList.remove('hidden');
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${Object.entries(item.variant).map(([key, value]) => 
                    `<span class="variant">${key}: ${value}</span>`).join(' ')}</p>
                <p class="price">${item.price.toLocaleString()} руб. × 
                    <input type="number" min="1" value="${item.quantity}" 
                           onchange="updateQuantity(${index}, this.value)">
                </p>
            </div>
            <button class="btn btn-outline" onclick="removeFromCart(${index})">
                Удалить
            </button>
        </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = 
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
}

// ========== ИНИЦИАЛИЗАЦИЯ ========== //

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) renderProducts();
    if (document.getElementById('cart-items-container')) renderCart();
    updateCartCount();
});
