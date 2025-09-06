const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    parentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    section: { type: String, enum: ['mens','womens','unisex'], default: 'mens' }, 
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
