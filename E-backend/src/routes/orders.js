const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.post('/', requireAuth, orderController.placeOrder);

router.get('/', requireAuth, orderController.getOrders);

router.get('/:id', requireAuth, orderController.getOrder);

router.put('/:id/status', requireAuth, role('admin'), orderController.updateStatus);

module.exports = router;
