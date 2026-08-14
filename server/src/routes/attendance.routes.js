const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const { authorizeClassroomOwner } = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// View classroom attendance (Teacher only)
router.get(
  '/classrooms/:id/attendance',
  authorizeClassroomOwner,
  attendanceController.getAttendance
);

module.exports = router;
