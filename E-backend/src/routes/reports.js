const express = require('express');
const router = express.Router();
const rc = require('../controllers/reportController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/sales', requireAuth, role('admin'), rc.sales);
router.get('/sold-products', requireAuth, role('admin'), rc.soldProducts);

module.exports = router;
