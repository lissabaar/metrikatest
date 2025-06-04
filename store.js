// Упрощенная и надежная версия функций корзины

// Изменение количества товара
function updateQuantity(index, newQuantity) {
    // Приводим к числу и проверяем минимальное значение
    newQuantity = Math.max(1, parseInt(newQuantity) || 1);
    
    const item = cart[index];
    if (!item) return;
    
    const oldQuantity = item.quantity;
    if (newQuantity === oldQuantity) return;
    
    // Определяем тип события
    const eventType = newQuantity > oldQuantity ? 'add' : 'remove';
    const quantityDiff = Math.abs(newQuantity - oldQuantity);
    
    // Отправляем событие
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
            [eventType]: {
                "products": [{
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "brand": item.brand,
                    "category": item.category,
                    "quantity": quantityDiff,
                    "list": item.list,
                    "position": item.position
                }]
            }
        }
    });
    
    // Обновляем данные
    item.quantity = newQuantity;
    saveCart();
    renderCart();
}

// Удаление товара (максимально упрощенная версия)
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
            "remove": {
                "products": [{
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "brand": item.brand,
                    "category": item.category,
                    "quantity": item.quantity,
                    "list": item.list,
                    "position": item.position
                }]
            }
        }
    });
    
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Покупка (полное соответствие документации)
function checkout() {
    if (cart.length === 0) return;
    
    const orderId = 'order_' + Date.now();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
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
                    "quantity": item.quantity,
                    "position": item.position
                }))
            }
        }
    });
    
    cart = [];
    saveCart();
    alert('Заказ оформлен!');
    renderCart();
}
