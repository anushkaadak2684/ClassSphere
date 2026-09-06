const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { syncUserSchema, updateMeSchema } = require('../schemas/validation.schemas');

// Public/Initial Auth Sync Route: Creates or syncs user after Firebase login
router.post('/sync', authenticate, validateBody(syncUserSchema), userController.syncUser);

// Protected routes (requires existing MongoDB user profile)
router.get('/me', authenticate, requireExistingUser, userController.getMe);
router.put('/me', authenticate, requireExistingUser, validateBody(updateMeSchema), userController.updateMe);

module.exports = router;

