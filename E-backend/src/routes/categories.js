const express = require('express');
const router = express.Router();
const cc = require('../controllers/categoryController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/', cc.list);
router.get('/:id', cc.get);

router.post('/', requireAuth, role('admin'), cc.create);
router.put('/:id', requireAuth, role('admin'), cc.update);
router.delete('/:id', requireAuth, role('admin'), cc.remove);

module.exports = router;
