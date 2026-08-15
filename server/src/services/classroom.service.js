const Classroom = require('../models/Classroom');
const Enrollment = require('../models/Enrollment');
const Material = require('../models/Material');
const Message = require('../models/Message');
const Attendance = require('../models/Attendance');
const generateJoinCode = require('../utils/generateJoinCode');

/**
 * Generate a guaranteed unique join code
 */
const generateUniqueJoinCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = generateJoinCode();
    const existing = await Classroom.findOne({ joinCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

/**
 * Create a new classroom
 */
const createClassroom = async (teacherId, { name, description, subject }) => {
  const joinCode = await generateUniqueJoinCode();
  const classroom = await Classroom.create({
    name,
    description: description || '',
    subject,
    teacher: teacherId,
    joinCode,
  });

  return await classroom.populate('teacher', 'name email avatarUrl');
};

/**
 * Get classrooms for a teacher or student
 */
const getUserClassrooms = async (userId, role) => {
  if (role === 'teacher') {
    const classrooms = await Classroom.find({ teacher: userId })
      .populate('teacher', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with student count
    const classroomIds = classrooms.map((c) => c._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { classroom: { $in: classroomIds }, status: 'active' } },
      { $group: { _id: '$classroom', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    enrollmentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    return classrooms.map((c) => ({
      ...c,
      studentCount: countMap[c._id.toString()] || 0,
    }));
  } else {
    // Student: find active enrollments
    const enrollments = await Enrollment.find({ student: userId, status: 'active' })
      .populate({
        path: 'classroom',
        populate: { path: 'teacher', select: 'name email avatarUrl' },
      })
      .sort({ joinedAt: -1 })
      .lean();

    return enrollments
      .filter((e) => e.classroom) // Filter out any dangling enrollments if classroom was deleted
      .map((e) => ({
        ...e.classroom,
        enrolledAt: e.joinedAt,
      }));
  }
};

/**
 * Get detailed classroom by ID
 */
const getClassroomById = async (classroomId) => {
  const classroom = await Classroom.findById(classroomId)
    .populate('teacher', 'name email avatarUrl')
    .lean();

  if (!classroom) return null;

  const studentCount = await Enrollment.countDocuments({
    classroom: classroomId,
    status: 'active',
  });

  return {
    ...classroom,
    studentCount,
  };
};

/**
 * Student joins classroom using joinCode
 */
const joinClassroomByCode = async (studentId, joinCode) => {
  const classroom = await Classroom.findOne({
    joinCode: joinCode.trim().toUpperCase(),
  }).populate('teacher', 'name email avatarUrl');

  if (!classroom) {
    const err = new Error('Invalid classroom join code. No classroom found.');
    err.status = 404;
    throw err;
  }

  // Check if student is the teacher of this classroom
  if (classroom.teacher._id.toString() === studentId.toString()) {
    const err = new Error('You are the teacher of this classroom.');
    err.status = 400;
    throw err;
  }

  // Check existing enrollment
  let enrollment = await Enrollment.findOne({
    classroom: classroom._id,
    student: studentId,
  });

  if (enrollment) {
    if (enrollment.status === 'active') {
      const err = new Error('You are already enrolled in this classroom.');
      err.status = 400;
      throw err;
    } else {
      // Re-activate dropped enrollment
      enrollment.status = 'active';
      enrollment.joinedAt = new Date();
      await enrollment.save();
    }
  } else {
    enrollment = await Enrollment.create({
      classroom: classroom._id,
      student: studentId,
      status: 'active',
    });
  }

  return {
    classroom,
    enrollment,
  };
};

/**
 * Get participants (teacher + enrolled students)
 */
const getClassroomParticipants = async (classroomId) => {
  const classroom = await Classroom.findById(classroomId).populate('teacher', 'name email avatarUrl role');
  if (!classroom) return null;

  const enrollments = await Enrollment.find({ classroom: classroomId, status: 'active' })
    .populate('student', 'name email avatarUrl role')
    .sort({ joinedAt: 1 });

  return {
    teacher: classroom.teacher,
    students: enrollments.map((e) => ({
      ...e.student.toObject(),
      enrolledAt: e.joinedAt,
      enrollmentId: e._id,
    })),
  };
};

const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

/**
 * Delete a classroom and all associated records
 */
const deleteClassroomCascade = async (classroomId) => {
  await Classroom.findByIdAndDelete(classroomId);
  await Enrollment.deleteMany({ classroom: classroomId });
  await Message.deleteMany({ classroom: classroomId });
  await Material.deleteMany({ classroom: classroomId });
  await Attendance.deleteMany({ classroom: classroomId });
  await Assignment.deleteMany({ classroom: classroomId });
  await Submission.deleteMany({ classroom: classroomId });
  return true;
};

module.exports = {
  generateUniqueJoinCode,
  createClassroom,
  getUserClassrooms,
  getClassroomById,
  joinClassroomByCode,
  getClassroomParticipants,
  deleteClassroomCascade,
};
