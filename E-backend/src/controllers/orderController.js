const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');


exports.placeOrder = async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.products.length) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const orderItems = [];
        let total = 0;

        for (const item of cart.products) {
        const product = await Product.findById(item.productId).session(session);
        if (!product || product.isDeleted || !product.isActive) {
            throw new Error(`Product not available: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Out of stock for product ${product._id}`);
        }

        const upd = await Product.updateOne(
            { _id: product._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
        );
        if (upd.matchedCount === 0) {
            throw new Error(`Failed to reserve stock for ${product._id}`);
        }

        orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity
        });
        total += product.price * item.quantity;
        }

        const order = new Order({
        userId,
        products: orderItems,
        totalPrice: total,
        statusHistory: [{ status: 'placed', timestamp: new Date(), adminId: null }]
        });

        await order.save({ session });

        await Cart.deleteOne({ userId }).session(session);

        await session.commitTransaction();
        session.endSession();

        const created = await Order.findById(order._id).populate('userId', 'name email');
        res.status(201).json({ order: created });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('placeOrder error:', err);
        return res.status(400).json({ message: err.message || 'Order failed' });
    }
};


exports.getOrders = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        return res.json({ orders });
        }
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        console.error('getOrders error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email');
        if (!order) return res.status(404).json({ message: 'Not found' });
        if (req.user.role !== 'admin' && String(order.userId._id) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
        }
        res.json({ order });
    } catch (err) {
        console.error('getOrder error', err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateStatus = async (req, res) => {
    try {
        const { status, cancellationReason, restock } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Not found' });

        order.statusHistory.push({ status, timestamp: new Date(), adminId: req.user._id });

        if (status === 'cancelled') {
        order.cancellationReason = cancellationReason || null;
        if (restock) {
            for (const p of order.products) {
            await Product.updateOne({ _id: p.productId }, { $inc: { stock: p.quantity } });
            }
        }
        }

        await order.save();
        res.json({ order });
    } catch (err) {
        console.error('updateStatus error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
