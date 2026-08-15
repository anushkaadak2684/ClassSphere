const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const { authorizeClassroomMember } = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Get classroom progress report (Teacher or enrolled Student)
router.get(
  '/classrooms/:id/progress',
  authorizeClassroomMember,
  progressController.getClassroomProgress
);

module.exports = router;
