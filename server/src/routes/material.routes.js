const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate, requireExistingUser } = require('../middleware/auth.middleware');
const {
  authorizeClassroomMember,
  authorizeClassroomOwner,
} = require('../middleware/role.middleware');

router.use(authenticate, requireExistingUser);

// Upload material (Teacher only)
router.post(
  '/classrooms/:id/materials',
  authorizeClassroomOwner,
  upload.single('file'),
  materialController.uploadMaterial
);

// Get materials for classroom (Teacher or enrolled Student)
router.get(
  '/classrooms/:id/materials',
  authorizeClassroomMember,
  materialController.getClassroomMaterials
);

// Delete material (Teacher only)
router.delete('/materials/:id', materialController.deleteMaterial);

module.exports = router;
