const classroomService = require('../services/classroom.service');
const Classroom = require('../models/Classroom');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Teacher creates a new classroom
 * POST /api/classrooms
 */
const createClassroom = asyncHandler(async (req, res) => {
  const { name, description, subject } = req.body;

  if (!name || !subject) {
    return res.status(400).json({
      success: false,
      message: 'Classroom name and subject are required.',
    });
  }

  const classroom = await classroomService.createClassroom(req.user._id, {
    name,
    description,
    subject,
  });

  res.status(201).json({
    success: true,
    data: classroom,
  });
});

/**
 * Get classrooms relevant to user (Teacher created / Student enrolled)
 * GET /api/classrooms
 */
const getClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await classroomService.getUserClassrooms(req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    data: classrooms,
  });
});

/**
 * Get classroom details by ID
 * GET /api/classrooms/:id
 */
const getClassroomById = asyncHandler(async (req, res) => {
  const classroom = await classroomService.getClassroomById(req.params.id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: classroom,
  });
});

/**
 * Teacher updates classroom
 * PUT /api/classrooms/:id
 */
const updateClassroom = asyncHandler(async (req, res) => {
  const { name, description, subject } = req.body;

  const classroom = req.classroom; // Provided by authorizeClassroomOwner middleware
  if (name) classroom.name = name;
  if (description !== undefined) classroom.description = description;
  if (subject) classroom.subject = subject;

  await classroom.save();
  await classroom.populate('teacher', 'name email avatarUrl');

  res.status(200).json({
    success: true,
    data: classroom,
  });
});

/**
 * Teacher deletes classroom
 * DELETE /api/classrooms/:id
 */
const deleteClassroom = asyncHandler(async (req, res) => {
  await classroomService.deleteClassroomCascade(req.params.id);

  res.status(200).json({
    success: true,
    data: { message: 'Classroom and associated records deleted successfully.' },
  });
});

/**
 * Student joins classroom using join code
 * POST /api/classrooms/join
 */
const joinClassroom = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    return res.status(400).json({
      success: false,
      message: 'Classroom join code is required.',
    });
  }

  try {
    const result = await classroomService.joinClassroomByCode(req.user._id, joinCode);

    res.status(200).json({
      success: true,
      data: result,
      message: `Successfully joined classroom ${result.classroom.name}`,
    });
  } catch (err) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * Get classroom participants
 * GET /api/classrooms/:id/participants
 */
const getParticipants = asyncHandler(async (req, res) => {
  const participants = await classroomService.getClassroomParticipants(req.params.id);

  if (!participants) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: participants,
  });
});

/**
 * Teacher starts live session
 * POST /api/classrooms/:id/start
 */
const startLiveSession = asyncHandler(async (req, res) => {
  const classroom = req.classroom;
  classroom.isLive = true;
  classroom.liveStartedAt = new Date();
  classroom.liveEndedAt = null;

  await classroom.save();

  res.status(200).json({
    success: true,
    data: classroom,
    message: 'Live class started.',
  });
});

/**
 * Teacher ends live session
 * POST /api/classrooms/:id/end
 */
const endLiveSession = asyncHandler(async (req, res) => {
  const classroom = req.classroom;
  classroom.isLive = false;
  classroom.liveEndedAt = new Date();

  await classroom.save();

  res.status(200).json({
    success: true,
    data: classroom,
    message: 'Live class ended.',
  });
});

module.exports = {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  joinClassroom,
  getParticipants,
  startLiveSession,
  endLiveSession,
};
