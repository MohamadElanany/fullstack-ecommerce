const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    photo: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    section: { type: String, enum: ['mens','womens','unisex'], default: 'mens' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
