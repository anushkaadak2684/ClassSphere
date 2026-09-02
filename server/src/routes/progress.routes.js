const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  validateObjectId,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Get classroom progress report (Teacher or enrolled Student)
router.get(
  '/classrooms/:id/progress',
  validateObjectId('id'),
  authorizeClassroomMember,
  progressController.getClassroomProgress
);

// Teacher views individual student details in classroom
router.get(
  '/classrooms/:id/students/:studentId/details',
  validateObjectId('id'),
  validateObjectId('studentId'),
  authorizeClassroomOwner,
  progressController.getStudentDetailsInClassroom
);

module.exports = router;


