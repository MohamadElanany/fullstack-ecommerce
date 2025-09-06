const express = require('express');
const router = express.Router();
const cc = require('../controllers/contactController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.post('/', cc.create);

router.get('/', requireAuth, role('admin'), cc.list);
router.put('/:id/seen', requireAuth, role('admin'), cc.markSeen);

module.exports = router;
