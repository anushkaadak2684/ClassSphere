const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const { validateObjectId, authorizeClassroomOwner } = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Student views own attendance metrics & session logs across all classrooms
router.get(
  '/attendance/my',
  attendanceController.getMyAttendance
);

// View classroom attendance (Teacher only)
router.get(
  '/classrooms/:id/attendance',
  validateObjectId('id'),
  authorizeClassroomOwner,
  attendanceController.getAttendance
);

module.exports = router;


