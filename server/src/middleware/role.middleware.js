const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');
const Enrollment = require('../models/Enrollment');

/**
 * Validates that an ID parameter is a valid MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName] || req.body[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format for '${paramName}'.`,
    });
  }
  next();
};

/**
 * Authorize only users with role 'teacher'
 */
const authorizeTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Teacher role required.',
    });
  }
  next();
};

/**
 * Authorize only users with role 'student'
 */
const authorizeStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Student role required.',
    });
  }
  next();
};

/**
 * Authorize user if they are either:
 * 1. The teacher who owns the classroom, or
 * 2. An active enrolled student in the classroom
 */
const authorizeClassroomMember = async (req, res, next) => {
  try {
    const classroomId = req.params.id || req.params.classroomId || req.body.classroomId;
    if (!classroomId) {
      return res.status(400).json({
        success: false,
        message: 'Classroom ID parameter missing.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid classroom ID format.',
      });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found.',
      });
    }

    // Attach classroom to request object to prevent redundant queries in controllers
    req.classroom = classroom;

    // Check if user is the teacher
    if (classroom.teacher.toString() === req.user._id.toString()) {
      req.isTeacher = true;
      return next();
    }

    // Check if user is an enrolled student
    const enrollment = await Enrollment.findOne({
      classroom: classroomId,
      student: req.user._id,
      status: 'active',
    });

    if (enrollment) {
      req.isTeacher = false;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access forbidden: You are not enrolled in this classroom.',
    });
  } catch (error) {
    console.error('[Role Auth Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying classroom permissions.',
    });
  }
};

/**
 * Authorize only the teacher who owns the specified classroom
 */
const authorizeClassroomOwner = async (req, res, next) => {
  try {
    const classroomId = req.params.id || req.params.classroomId || req.body.classroomId;
    if (!classroomId) {
      return res.status(400).json({
        success: false,
        message: 'Classroom ID parameter missing.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid classroom ID format.',
      });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found.',
      });
    }

    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this classroom.',
      });
    }

    req.classroom = classroom;
    req.isTeacher = true;
    next();
  } catch (error) {
    console.error('[Classroom Owner Auth Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying classroom ownership.',
    });
  }
};

module.exports = {
  validateObjectId,
  authorizeTeacher,
  authorizeStudent,
  authorizeClassroomMember,
  authorizeClassroomOwner,
};

