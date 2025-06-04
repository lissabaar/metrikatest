window.dataLayer = window.dataLayer || [];

const products = [
    {
        id: '01',
        name: 'Stray Kids - SKZHOP HIPTAPE \'合 (HOP)\'',
        price: 2500,
        image: 'https://candyshopkpop.ru/pictures/product/small/7831_small.jpg',
        variants: {
            version: ['HIPTAPE', 'SKZHOP ', 'ACCORDION']
        }
    },
    {
        id: '02',
        name: 'Stray Kids - ATE',
        price: 2250,
        image: 'https://candyshopkpop.ru/pictures/product/small/7493_small.jpg',
        variants: {
            version: ['ATE', 'ACCORDION ', 'NEMO']
        }
    },
    {
        id: '03',
        name: 'Stray Kids - 樂 ROCK-STAR',
        price: 1900,
        image: 'https://candyshopkpop.ru/pictures/product/small/7443_small.png',
        variants: {
            version: ['STANDART', 'HEADLINER ', 'LIMITED']
        }
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функции для работы с интерфейсом
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    if(sectionId === 'products') renderProducts();
    if(sectionId === 'cart') renderCart();
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
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

    // Событие просмотра списка товаров
    dataLayer.push({
        ecommerce: {
            currencyCode: "RUB",
            impressions: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: 'Albums',
                list: 'Stray Kids Albums',
                position: +p.id
            }))
        }
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const variants = {};
    
    document.querySelectorAll(`[data-product="${productId}"]`).forEach(select => {
        const variantType = select.dataset.variant;
        variants[variantType] = select.value;
    });

    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variants));

    if(existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            ...product,
            variant: variants,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();

    // Событие добавления в корзину
    dataLayer.push({
        ecommerce: {
            currencyCode: "RUB",
            add: {
                products: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    variant: JSON.stringify(variants),
                    quantity: 1
                }]
            }
        }
    });
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container') || document.getElementById('cart-items');
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
    
    // Проверяем, какая версия корзины используется
    if (cartItemsContainer.id === 'cart-items-container') {
        // Расширенная версия корзины
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
    } else {
        // Упрощенная версия корзины
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <h3>${item.name} (${Object.values(item.variant).join(', ')})</h3>
                <p>Цена: ${item.price.toLocaleString()} руб. x ${item.quantity}</p>
                <button class="btn btn-outline" onclick="removeFromCart(${index})">Удалить</button>
            </div>
        `).join('');
    }
    
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = 
            cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
    }
}

function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) newQuantity = 1;
    
    cart[index].quantity = newQuantity;
    saveCart();
    renderCart();
    
    // Событие изменения количества
    dataLayer.push({
        event: "cartChange",
        ecommerce: {
            currencyCode: "RUB",
            change: {
                products: [{
                    id: cart[index].id,
                    name: cart[index].name,
                    price: cart[index].price,
                    variant: JSON.stringify(cart[index].variant),
                    quantity: newQuantity
                }]
            }
        }
    });
}

function removeFromCart(index) {
    const removedItem = cart.splice(index, 1)[0];
    saveCart();
    renderCart();
    updateCartCount();
    
    // Событие удаления из корзины
    dataLayer.push({
        event: "removeFromCart",
        ecommerce: {
            currencyCode: "RUB",
            remove: {
                products: [{
                    id: removedItem.id,
                    name: removedItem.name,
                    price: removedItem.price,
                    variant: JSON.stringify(removedItem.variant),
                    quantity: removedItem.quantity
                }]
            }
        }
    });
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    // Проверяем, есть ли форма с деталями заказа
    const nameInput = document.getElementById('name');
    if (nameInput) {
        // Расширенная версия с формой
        const name = nameInput.value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        
        if (!name || !phone || !email || !address) {
            alert('Пожалуйста, заполните все поля формы!');
            return;
        }
        
        // Создаем объект заказа
        const order = {
            id: 'order_' + Date.now(),
            date: new Date().toISOString(),
            customer: { name, phone, email, address },
            items: [...cart],
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        };
        
        // Событие оформления заказа
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                currencyCode: "RUB",
                purchase: {
                    actionField: {
                        id: order.id,
                        revenue: order.total,
                        tax: 0,
                        shipping: 0
                    },
                    products: order.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        variant: JSON.stringify(item.variant),
                        quantity: item.quantity,
                        category: item.category || 'Одежда'
                    }))
                }
            }
        });
        
        // Очищаем корзину
        cart = [];
        saveCart();
        updateCartCount();
        
        // Показываем сообщение об успешном заказе
        alert(`Заказ #${order.id} оформлен успешно!\nСумма: ${order.total.toLocaleString()} руб.`);
        
        // Перенаправляем на главную
        window.location.href = 'store.html';
    } else {
        // Упрощенная версия без формы
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                currencyCode: "RUB",
                purchase: {
                    actionField: {
                        id: "mock_order_" + Date.now(),
                        revenue: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
                    },
                    products: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        variant: JSON.stringify(item.variant),
                        quantity: item.quantity
                    }))
                }
            }
        });

        cart = [];
        saveCart();
        updateCartCount();
        alert('Заказ оформлен! Спасибо за покупку!');
        showSection('products');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Событие просмотра корзины при открытии страницы
    if (window.location.pathname.includes('cart.html') || document.getElementById('cart-items-container')) {
        dataLayer.push({
            ecommerce: {
                currencyCode: "RUB",
                cart: {
                    products: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        variant: JSON.stringify(item.variant),
                        quantity: item.quantity
                    }))
                }
            }
        });
    }
    
    // Инициализация интерфейса
    if (document.getElementById('products-grid')) {
        renderProducts();
    }
    if (document.getElementById('cart-items') || document.getElementById('cart-items-container')) {
        renderCart();
    }
    updateCartCount();
});
