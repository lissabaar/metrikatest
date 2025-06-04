window.dataLayer = window.dataLayer || [];

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
        category: 'Albums/K-Pop',
        brand: 'Stray Kids',
        list: 'Catalog',
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
        category: 'Albums/K-Pop',
        brand: 'Stray Kids',
        list: 'Catalog',
        position: 2
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Добавление в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = document.querySelector(`[data-product="${productId}"]`).value;
    
    // Ищем товар в корзине
    const existingItem = cart.find(item => 
        item.id === productId && item.variant === variant);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            variant: variant,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    
    // Отправляем событие добавления
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
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

// Изменение количества
function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity) || 1;
    if (newQuantity < 1) newQuantity = 1;
    
    const oldQuantity = cart[index].quantity;
    const difference = newQuantity - oldQuantity;
    cart[index].quantity = newQuantity;
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    
    // Отправляем событие add или remove
    if (difference > 0) {
        dataLayer.push({
            "ecommerce": {
                "currencyCode": "RUB",
                "add": {
                    "products": [{
                        "id": cart[index].id,
                        "name": cart[index].name,
                        "price": cart[index].price,
                        "brand": cart[index].brand,
                        "category": cart[index].category,
                        "quantity": difference,
                        "list": cart[index].list,
                        "position": cart[index].position
                    }]
                }
            }
        });
    } else {
        dataLayer.push({
            "ecommerce": {
                "currencyCode": "RUB",
                "remove": {
                    "products": [{
                        "id": cart[index].id,
                        "name": cart[index].name,
                        "price": cart[index].price,
                        "brand": cart[index].brand,
                        "category": cart[index].category,
                        "quantity": Math.abs(difference),
                        "list": cart[index].list,
                        "position": cart[index].position
                    }]
                }
            }
        });
    }
}

// Удаление из корзины
function removeFromCart(index) {
    const removedItem = cart.splice(index, 1)[0];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
    
    // Отправляем событие удаления
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
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
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = 'order_' + Date.now();
    
    // Отправляем событие покупки
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
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
                    "list": item.list,
                    "position": item.position
                }))
            }
        }
    });
    
    // Очищаем корзину
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    alert('Заказ оформлен! Спасибо за покупку!');
}

// Остальные функции
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
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
            <button class="btn btn-outline" onclick="removeFromCart(${index})">
                Удалить
            </button>
        </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = 
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) {
        // Рендер товаров
    }
    if (document.getElementById('cart-items-container')) {
        renderCart();
    }
    updateCartCount();
});
