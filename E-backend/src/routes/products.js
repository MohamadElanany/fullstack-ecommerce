const express = require('express');
const router = express.Router();
const pc = require('../controllers/productController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');
const upload = require('../middlewares/upload');

router.get('/', pc.list);
router.get('/:id', pc.get);

router.post('/', requireAuth, role('admin'), upload.single('photo'), pc.create);
router.put('/:id', requireAuth, role('admin'), upload.single('photo'), pc.update);
router.delete('/:id', requireAuth, role('admin'), pc.remove);

module.exports = router;
