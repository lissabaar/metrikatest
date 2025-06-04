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
                id: '03', // Исправлено: было '02', теперь '03' (уникальные ID)
                name: 'Stray Kids - 樂 ROCK-STAR',
                price: 1900,
                image: 'https://candyshopkpop.ru/pictures/product/small/7443_small.png',
                variants: {
                    version: ['STANDART', 'HEADLINER ', 'LIMITED']
                }
            }
        ];

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

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

            updateCart();

            // Событие добавления в корзину
            dataLayer.push({
                // event: "addToCart",
                "ecommerce": {
                   "currencyCode": "RUB",
                    "add": {
                        "products": [{
                            "id": product.id,
                            "name": product.name,
                            "price": product.price,
                            "variant": JSON.stringify(variants),
                            "quantity": 1
                        }]
                    }
                }
            });
        }

        function renderCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <h3>${item.name} (${Object.values(item.variant).join(', ')})</h3>
                    <p>Цена: ${item.price.toLocaleString()} руб. x ${item.quantity}</p>
                    <button class="btn btn-outline" onclick="removeFromCart(${index})">Удалить</button>
                </div>
            `).join('');

            document.getElementById('cart-total').textContent = 
                cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
        }

        function removeFromCart(index) {
            const removed = cart.splice(index, 1)[0];
            updateCart();

            // Событие удаления из корзины
          dataLayer.push({
    "ecommerce": {
        "currencyCode": "RUB",
        "remove": {
            "products": [
                {
                            "id": removed.id,
                            "price": removed.price,
                            // "variant": removed.variants),
                            "quantity": 1
                }
            ]
        }
    }
});

        }

        function checkout() {
            if(cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }

            // Событие оформления заказа
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
            updateCart();
            alert('Заказ оформлен! Спасибо за покупку!');
            showSection('products');
        }

        function updateCart() {
            localStorage.setItem('cart', JSON.stringify(cart));
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            }
            renderCart();
        }

        // Инициализация
        document.addEventListener('DOMContentLoaded', function() {
            renderProducts();
            updateCart(); // Обновляем счетчик корзины при загрузке
        });
