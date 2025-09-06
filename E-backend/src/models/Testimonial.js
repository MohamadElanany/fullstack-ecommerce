const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    dateIsSeen: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
