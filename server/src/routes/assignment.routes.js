const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  validateObjectId,
  authorizeTeacher,
  authorizeStudent,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Classroom-scoped assignment endpoints
router.post(
  '/classrooms/:id/assignments',
  validateObjectId('id'),
  authorizeClassroomOwner,
  upload.single('file'),
  assignmentController.createAssignment
);

router.get(
  '/classrooms/:id/assignments',
  validateObjectId('id'),
  authorizeClassroomMember,
  assignmentController.getClassroomAssignments
);

// Individual assignment endpoints
router.get('/assignments/:id', validateObjectId('id'), assignmentController.getAssignmentById);
router.put('/assignments/:id', validateObjectId('id'), authorizeTeacher, assignmentController.updateAssignment);
router.delete('/assignments/:id', validateObjectId('id'), authorizeTeacher, assignmentController.deleteAssignment);

// Submissions endpoints
router.post(
  '/assignments/:id/submit',
  validateObjectId('id'),
  authorizeStudent,
  upload.single('file'),
  assignmentController.submitAssignment
);

router.get(
  '/assignments/:id/submissions',
  validateObjectId('id'),
  authorizeTeacher,
  assignmentController.getAssignmentSubmissions
);

router.get(
  '/assignments/:id/my-submission',
  validateObjectId('id'),
  authorizeStudent,
  assignmentController.getMySubmission
);

// Grading endpoint
router.put(
  '/submissions/:id/grade',
  validateObjectId('id'),
  authorizeTeacher,
  assignmentController.gradeSubmission
);

module.exports = router;

