const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const idToFind = decoded.id || decoded.userId || decoded._id;
    if (idToFind) {
      const user = await User.findById(idToFind).select('-password');
      if (user) req.user = user;
    }
  } catch (err) {
    console.warn('authOptional: token invalid or expired');
  }
  next();
}

module.exports = authOptional;
