const express = require('express');
const router = express.Router();
const tc = require('../controllers/testimonialController');
const requireAuth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/', tc.listPublic);

router.post('/', requireAuth, tc.add);

router.get('/admin/all', requireAuth, role('admin'), tc.listAll);
router.put('/admin/:id/approve', requireAuth, role('admin'), tc.approve);

module.exports = router;
