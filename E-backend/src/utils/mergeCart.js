const Cart = require('../models/Cart');


module.exports = async function mergeCart(userId, sessionCart){
    if(!sessionCart || !Array.isArray(sessionCart.products)) return;
    const sessionItems = sessionCart.products.map(p => ({
        productId: p.productId,
        quantity: Math.max(1, parseInt(p.quantity || 1))
    }));

    const existing = await Cart.findOne({ userId });
    if(!existing){
        const cart = new Cart({ userId, products: sessionItems });
        await cart.save();
        return;
    }

    const map = new Map();
    for(const it of existing.products) map.set(String(it.productId), it.quantity);
    for(const it of sessionItems){
        const id = String(it.productId);
        map.set(id, (map.get(id) || 0) + it.quantity);
    }
    existing.products = Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    await existing.save();
};
