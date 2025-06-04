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
        category: 'Albums',
        brand: 'JYP',
        list: 'Stray Kids Albums',
        position: 1
    },
    {
        id: '02',
        name: 'Stray Kids - ATE',
        price: 2250,
        image: 'https://candyshopkpop.ru/pictures/product/small/7493_small.jpg',
        variants: {
            version: ['ATE', 'ACCORDION', 'NEMO']
        },
        category: 'Albums',
        brand: 'JYP',
        list: 'Stray Kids Albums',
        position: 2
    },
    {
        id: '03',
        name: 'Stray Kids - 樂 ROCK-STAR',
        price: 1900,
        image: 'https://candyshopkpop.ru/pictures/product/small/7443_small.png',
        variants: {
            version: ['STANDARD', 'HEADLINER', 'LIMITED']
        },
        category: 'Albums',
        brand: 'JYP',
        list: 'Stray Kids Albums',
        position: 3
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== ОСНОВНЫЕ ФУНКЦИИ ===== //
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.textContent = count;
}

// ===== СОБЫТИЯ КОРЗИНЫ ===== //
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = document.querySelector(`[data-product="${productId}"]`).value;
    
    const existingIndex = cart.findIndex(item => 
        item.id === productId && item.variant === variant);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            ...product,
            variant: variant,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
    
    // Событие добавления
    dataLayer.push({
        "ecommerce": {
            "currencyCode": CURRENCY,
            "add": {
                "products": [{
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "brand": product.brand,
                    "category": product.category,
                    "quantity": 1,
                    "list": product.list,
                    "position": product.position
                }]
            }
        }
    });
}

function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity) || 1;
    if (newQuantity < 1) newQuantity = 1;
    
    const item = cart[index];
    const oldQuantity = item.quantity;
    const difference = newQuantity - oldQuantity;
    
    if (difference === 0) return;
    
    // Событие изменения количества
    if (difference > 0) {
        dataLayer.push({
            "ecommerce": {
                "currencyCode": CURRENCY,
                "add": {
                    "products": [{
                        "id": item.id,
                        "name": item.name,
                        "price": item.price,
                        "brand": item.brand,
                        "category": item.category,
                        "quantity": difference,
                        "list": item.list,
                        "position": item.position
                    }]
                }
            }
        });
    } else {
        dataLayer.push({
            "ecommerce": {
                "currencyCode": CURRENCY,
                "remove": {
                    "products": [{
                        "id": item.id,
                        "name": item.name,
                        "price": item.price,
                        "brand": item.brand,
                        "category": item.category,
                        "quantity": Math.abs(difference),
                        "list": item.list,
                        "position": item.position
                    }]
                }
            }
        });
    }
    
    item.quantity = newQuantity;
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const removedItem = cart[index];
    
    // Событие удаления
    dataLayer.push({
        "ecommerce": {
            "currencyCode": CURRENCY,
            "remove": {
                "products": [{
                    "id": removedItem.id,
                    "name": removedItem.name,
                    "price": removedItem.price,
                    "brand": removedItem.brand,
                    "category": removedItem.category,
                    "quantity": removedItem.quantity,
                    "list": removedItem.list,
                    "position": removedItem.position
                }]
            }
        }
    });
    
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function checkout() {
    console.log(cart);
    if (!cart.length) {
        alert('Корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = 'order_' + Date.now();
    
    // Событие покупки (точно по документации)
    dataLayer.push({
        "ecommerce": {
            "currencyCode": CURRENCY,
            "purchase": {
                "actionField": {
                    "id": orderId,
                    "revenue": total
                },
                "products": cart.map(item => ({
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "brand": item.brand,
                    "category": item.category,
                    "variant": item.variant,
                    "quantity": item.quantity,
                    "position": item.position
                }))
            }
        }
    });
    
    cart = [];
    saveCart();
    alert(`Заказ #${orderId} оформлен! Сумма: ${total.toLocaleString()} руб.`);
    renderCart();
}

// ===== РЕНДЕР ===== //
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

    // Просмотр товаров
    dataLayer.push({
        ecommerce: {
            currencyCode: CURRENCY,
            impressions: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                brand: p.brand,
                category: p.category,
                list: p.list,
                position: p.position
            }))
        }
    });
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const summary = document.getElementById('cart-summary');
    
    if (!container) return;
    
    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        if (summary) summary.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    
    if (emptyMsg) emptyMsg.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.variant}</p>
                <p class="price">${item.price.toLocaleString()} руб. × 
                    <input type="number" min="1" value="${item.quantity}" 
                           onchange="updateQuantity(${index}, this.value)">
                </p>
            </div>
            <button class="btn btn-outline" onclick="removeFromCart(${index})">Удалить</button>
        </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = 
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) renderProducts();
    if (document.getElementById('cart-items-container')) renderCart();
    updateCartCount();
});
