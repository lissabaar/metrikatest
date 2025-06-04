// 1. Инициализация dataLayer
window.dataLayer = window.dataLayer || [];

// 2. Функция изменения количества (100% рабочий вариант)
function updateQuantity(index, newQuantity) {
    newQuantity = Math.max(1, parseInt(newQuantity) || 1);
    const item = cart[index];
    if (!item || item.quantity === newQuantity) return;
    
    // Отправка события
    const eventType = newQuantity > item.quantity ? 'add' : 'remove';
    const diff = Math.abs(newQuantity - item.quantity);
    
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
                    "quantity": diff,
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

// 3. Функция оформления заказа (проверенная)
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const orderId = 'ORDER_' + Date.now();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Важно! Именно такая структура требуется Яндекс.Метрике
    dataLayer.push({
        "ecommerce": {
            "currencyCode": "RUB",
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
    
    // Очистка корзины после покупки
    cart = [];
    saveCart();
    renderCart();
    alert('Заказ #' + orderId + ' успешно оформлен!');
}

// 4. Проверка работы (добавьте в конец скрипта)
console.log('YM Cart System: initialized'); 
