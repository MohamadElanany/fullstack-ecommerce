const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mergeCart = require('../utils/mergeCart');

function signToken(userId){
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ message: 'Email already used' });

    const user = new User({ name, email, password, phone, address });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role }});
  } catch(err){
    console.error('register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if(!ok) return res.status(400).json({ message: 'Invalid credentials' });

    if(req.session && req.session.cart){
      try {
        await mergeCart(user._id, req.session.cart);
        delete req.session.cart;
      } catch(e){
        console.warn('mergeCart failed (non-fatal):', e);
      }
    }

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role }});
  } catch(err){
    console.error('login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { _id, name, email, role, phone, address, isActive, createdAt } = req.user;
    res.json({ _id, name, email, role, phone, address, isActive, createdAt });
  } catch (err) {
    console.error('getCurrentUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
