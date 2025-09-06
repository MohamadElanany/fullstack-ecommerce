const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        return res.json({ cart: cart || { userId: req.user._id, products: [] } });
    } catch (err) {
        console.error('getCart error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/cart/add
 * body: { productId, quantity }
 */
exports.addItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const quantity = Math.max(1, parseInt(req.body.quantity || 1));

        const product = await Product.findById(productId);
        if (!product || product.isDeleted || !product.isActive) {
        return res.status(400).json({ message: 'Product not available' });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
        cart = new Cart({ userId: req.user._id, products: [{ productId, quantity }] });
        await cart.save();
        return res.json({ cart });
        }

        const idx = cart.products.findIndex(p => String(p.productId) === String(productId));
        if (idx >= 0) {
        cart.products[idx].quantity += quantity;
        } else {
        cart.products.push({ productId, quantity });
        }
        await cart.save();
        return res.json({ cart });
    } catch (err) {
        console.error('addItem error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/cart/update
 * body: { productId, quantity }  (quantity = 0 -> remove)
 */
exports.updateItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const quantity = Math.max(0, parseInt(req.body.quantity || 0));

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(400).json({ message: 'Cart not found' });

        const idx = cart.products.findIndex(p => String(p.productId) === String(productId));
        if (idx === -1) return res.status(400).json({ message: 'Product not in cart' });

        if (quantity === 0) cart.products.splice(idx, 1);
        else cart.products[idx].quantity = quantity;

        await cart.save();
        return res.json({ cart });
    } catch (err) {
        console.error('updateItem error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/cart/remove
 * body: { productId }
 */
exports.removeItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(400).json({ message: 'Cart not found' });

        cart.products = cart.products.filter(p => String(p.productId) !== String(productId));
        await cart.save();
        return res.json({ cart });
    } catch (err) {
        console.error('removeItem error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
