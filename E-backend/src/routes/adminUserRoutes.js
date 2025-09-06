const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminUserController');

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, adminController.listUsers);

router.put('/users/:id/role', authMiddleware, adminMiddleware, adminController.updateUser); // body: { role, isActive }
router.patch('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);

router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

module.exports = router;
