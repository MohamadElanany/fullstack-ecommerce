const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).select('-password');
    const total = await User.countDocuments();

    res.json({ page, total, users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    const { role, isActive } = req.body;
    if(role) user.role = role;
    if(typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();
    res.json({ message: 'User updated', user });
  } catch (err) {
    console.error('updateUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = false;
    await user.save();
    res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
