const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, required: true }, 
    timestamp: { type: Date, default: Date.now },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [orderItemSchema],
    statusHistory: [statusHistorySchema],
    cancellationReason: { type: String, default: null },
    totalPrice: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
