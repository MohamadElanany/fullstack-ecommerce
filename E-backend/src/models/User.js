const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String, default: '' },
    role: { type: String, enum: ['user','admin'], default: 'user' },
    isActive: { type: Boolean, default: true } 
}, { timestamps: true });

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function(candidate){
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
