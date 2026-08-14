const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');

// Public/Initial Auth Sync Route: Creates or syncs user after Firebase login
router.post('/sync', authenticate, userController.syncUser);

// Protected routes (requires existing MongoDB user profile)
router.get('/me', authenticate, requireExistingUser, userController.getMe);
router.put('/me', authenticate, requireExistingUser, userController.updateMe);

module.exports = router;
