const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const requireAuth = require('../middlewares/auth');

router.get('/', requireAuth, cartController.getCart);
router.post('/add', requireAuth, cartController.addItem);
router.post('/update', requireAuth, cartController.updateItem);
router.post('/remove', requireAuth, cartController.removeItem);

module.exports = router;
