const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  authorizeTeacher,
  authorizeStudent,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Classroom-scoped assignment endpoints
router.post(
  '/classrooms/:id/assignments',
  authorizeClassroomOwner,
  upload.single('file'),
  assignmentController.createAssignment
);

router.get(
  '/classrooms/:id/assignments',
  authorizeClassroomMember,
  assignmentController.getClassroomAssignments
);

// Individual assignment endpoints
router.get('/assignments/:id', assignmentController.getAssignmentById);
router.put('/assignments/:id', authorizeTeacher, assignmentController.updateAssignment);
router.delete('/assignments/:id', authorizeTeacher, assignmentController.deleteAssignment);

// Submissions endpoints
router.post(
  '/assignments/:id/submit',
  authorizeStudent,
  upload.single('file'),
  assignmentController.submitAssignment
);

router.get(
  '/assignments/:id/submissions',
  authorizeTeacher,
  assignmentController.getAssignmentSubmissions
);

router.get(
  '/assignments/:id/my-submission',
  authorizeStudent,
  assignmentController.getMySubmission
);

// Grading endpoint
router.put(
  '/submissions/:id/grade',
  authorizeTeacher,
  assignmentController.gradeSubmission
);

module.exports = router;
