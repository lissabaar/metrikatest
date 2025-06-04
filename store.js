// 1. Инициализация
window.dataLayer = window.dataLayer || [];
const CURRENCY = "RUB";

// 2. Товары
const products = [
    {
        id: '01',
        name: 'Stray Kids - SKZHOP HIPTAPE \'合 (HOP)\'',
        price: 2500,
        image: 'https://candyshopkpop.ru/pictures/product/small/7831_small.jpg',
        variants: { version: ['HIPTAPE', 'SKZHOP', 'ACCORDION'] },
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
        variants: { version: ['ATE', 'ACCORDION', 'NEMO'] },
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
        variants: { version: ['STANDARD', 'HEADLINER', 'LIMITED'] },
        category: 'Albums',
        brand: 'JYP',
        list: 'Stray Kids Albums',
        position: 3
    }
];

// 3. Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 4. Основные функции
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// 5. Работа с корзиной
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = document.querySelector(`select[data-product="${productId}"]`).value;
    const existingItem = cart.find(item => item.id === productId && item.variant === variant);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, variant, quantity: 1 });
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
    newQuantity = Math.max(1, parseInt(newQuantity) || 1);
    const item = cart[index];
    if (!item || item.quantity === newQuantity) return;

    const diff = newQuantity - item.quantity;
    const eventType = diff > 0 ? 'add' : 'remove';
    
    dataLayer.push({
        "ecommerce": {
            "currencyCode": CURRENCY,
            [eventType]: {
                "products": [{
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "brand": item.brand,
                    "category": item.category,
                    "quantity": Math.abs(diff),
                    "list": "Cart",
                    "position": index + 1
                }]
            }
        }
    });

    item.quantity = newQuantity;
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    const item = cart[index];
    
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
                    "quantity": item.quantity,
                    "list": "Cart",
                    "position": index + 1
                }]
            }
        }
    });

    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const orderId = 'ORDER_' + Date.now();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    dataLayer.push({
        "ecommerce": {
            "currencyCode": CURRENCY,
            "purchase": {
                "actionField": {
                    "id": orderId,
                    "revenue": total
                },
                "products": cart.map((item, index) => ({
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "brand": item.brand,
                    "category": item.category,
                    "quantity": item.quantity,
                    "variant": item.variant,
                    "position": index + 1
                }))
            }
        }
    });

    cart = [];
    saveCart();
    renderCart();
    alert('Заказ #' + orderId + ' оформлен! Сумма: ' + total.toLocaleString() + ' руб.');
}

// 6. Рендер
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" width="100">
            <h3>${product.name}</h3>
            <p>${product.price.toLocaleString()} руб.</p>
            <select data-product="${product.id}">
                ${product.variants.version.map(v => `<option>${v}</option>`).join('')}
            </select>
            <button onclick="addToCart('${product.id}')">В корзину</button>
        </div>
    `).join('');
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const summary = document.getElementById('cart-summary');

    if (!container) return;

    if (cart.length === 0) {
        emptyMsg.classList.remove('hidden');
        summary.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    emptyMsg.classList.add('hidden');
    summary.classList.remove('hidden');

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" width="50">
            <div>
                <h4>${item.name} (${item.variant})</h4>
                <p>${item.price.toLocaleString()} руб. × 
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateQuantity(${index}, this.value)"></p>
            </div>
            <button onclick="removeFromCart(${index})">×</button>
        </div>
    `).join('');

    document.getElementById('cart-total').textContent = 
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
}

// 7. Инициализация
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    renderCart();
    updateCartCount();
});
