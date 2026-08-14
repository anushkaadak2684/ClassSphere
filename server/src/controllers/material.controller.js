const Material = require('../models/Material');
const Classroom = require('../models/Classroom');
const cloudinaryService = require('../services/cloudinary.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Teacher uploads learning material to classroom
 * POST /api/classrooms/:id/materials
 */
const uploadMaterial = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;
  const { name, description } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a file to upload.',
    });
  }

  // Upload buffer to Cloudinary
  const uploadResult = await cloudinaryService.uploadBufferToCloudinary(
    req.file.buffer,
    `classsphere_${classroomId}`,
    req.file.originalname
  );

  const material = await Material.create({
    classroom: classroomId,
    uploadedBy: req.user._id,
    name: name || req.file.originalname,
    description: description || '',
    cloudinaryPublicId: uploadResult.publicId,
    secureUrl: uploadResult.secureUrl,
    resourceType: uploadResult.resourceType,
    fileSize: uploadResult.fileSize,
  });

  await material.populate('uploadedBy', 'name email avatarUrl');

  res.status(201).json({
    success: true,
    data: material,
    message: 'Material uploaded successfully.',
  });
});

/**
 * Get all materials for a classroom (Teacher or enrolled Student)
 * GET /api/classrooms/:id/materials
 */
const getClassroomMaterials = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;

  const materials = await Material.find({ classroom: classroomId })
    .populate('uploadedBy', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: materials,
  });
});

/**
 * Teacher deletes a material
 * DELETE /api/materials/:id
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const materialId = req.params.id;

  const material = await Material.findById(materialId);
  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Material not found.',
    });
  }

  // Verify ownership of the classroom or uploader
  const classroom = await Classroom.findById(material.classroom);
  if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only the classroom teacher can delete this material.',
    });
  }

  // Delete from Cloudinary
  try {
    await cloudinaryService.deleteCloudinaryAsset(material.cloudinaryPublicId, material.resourceType);
  } catch (cloudErr) {
    console.warn('[Cloudinary Delete Notice]:', cloudErr.message);
  }

  // Delete from MongoDB
  await Material.findByIdAndDelete(materialId);

  res.status(200).json({
    success: true,
    data: { message: 'Material deleted successfully.' },
  });
});

module.exports = {
  uploadMaterial,
  getClassroomMaterials,
  deleteMaterial,
};
