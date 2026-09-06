const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  validateObjectId,
  authorizeTeacher,
  authorizeStudent,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const {
  createClassroomSchema,
  updateClassroomSchema,
  joinClassroomSchema,
} = require('../schemas/validation.schemas');

// All classroom routes require authenticated MongoDB user
router.use(authenticate, requireExistingUser);

// General classroom endpoints
router.post('/', authorizeTeacher, validateBody(createClassroomSchema), classroomController.createClassroom);
router.get('/', classroomController.getClassrooms);
router.post('/join', authorizeStudent, validateBody(joinClassroomSchema), classroomController.joinClassroom);

// Specific classroom endpoints
router.get('/:id', validateObjectId('id'), authorizeClassroomMember, classroomController.getClassroomById);
router.put('/:id', validateObjectId('id'), authorizeClassroomOwner, validateBody(updateClassroomSchema), classroomController.updateClassroom);
router.delete('/:id', validateObjectId('id'), authorizeClassroomOwner, classroomController.deleteClassroom);
router.get('/:id/participants', validateObjectId('id'), authorizeClassroomMember, classroomController.getParticipants);

// Live session control endpoints (Teacher only)
router.post('/:id/start', validateObjectId('id'), authorizeClassroomOwner, classroomController.startLiveSession);
router.post('/:id/end', validateObjectId('id'), authorizeClassroomOwner, classroomController.endLiveSession);

module.exports = router;


