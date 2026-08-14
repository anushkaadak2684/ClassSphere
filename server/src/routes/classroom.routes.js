const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  authorizeTeacher,
  authorizeStudent,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

// All classroom routes require authenticated MongoDB user
router.use(authenticate, requireExistingUser);

// General classroom endpoints
router.post('/', authorizeTeacher, classroomController.createClassroom);
router.get('/', classroomController.getClassrooms);
router.post('/join', authorizeStudent, classroomController.joinClassroom);

// Specific classroom endpoints
router.get('/:id', authorizeClassroomMember, classroomController.getClassroomById);
router.put('/:id', authorizeClassroomOwner, classroomController.updateClassroom);
router.delete('/:id', authorizeClassroomOwner, classroomController.deleteClassroom);
router.get('/:id/participants', authorizeClassroomMember, classroomController.getParticipants);

// Live session control endpoints (Teacher only)
router.post('/:id/start', authorizeClassroomOwner, classroomController.startLiveSession);
router.post('/:id/end', authorizeClassroomOwner, classroomController.endLiveSession);

module.exports = router;
