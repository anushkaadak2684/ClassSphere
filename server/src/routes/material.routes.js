const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  validateObjectId,
  authorizeTeacher,
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Upload material (Teacher only)
router.post(
  '/classrooms/:id/materials',
  validateObjectId('id'),
  authorizeClassroomOwner,
  upload.single('file'),
  materialController.uploadMaterial
);

// Get materials for classroom (Teacher or enrolled Student)
router.get(
  '/classrooms/:id/materials',
  validateObjectId('id'),
  authorizeClassroomMember,
  materialController.getClassroomMaterials
);

// Delete material (Teacher only)
router.delete('/materials/:id', validateObjectId('id'), authorizeTeacher, materialController.deleteMaterial);

module.exports = router;

