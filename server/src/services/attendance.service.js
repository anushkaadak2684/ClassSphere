const Attendance = require('../models/Attendance');

/**
 * Record attendance when student joins a live session
 */
const recordStudentJoin = async (classroomId, studentId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.create({
      classroom: classroomId,
      student: studentId,
      sessionDate: today,
      joinedAt: new Date(),
      status: 'present',
    });

    return attendance;
  } catch (error) {
    console.error('[Attendance Record Join Error]:', error);
    return null;
  }
};

/**
 * Update attendance when student leaves live session
 */
const recordStudentLeave = async (attendanceId) => {
  try {
    if (!attendanceId) return null;
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return null;

    const leaveTime = new Date();
    const durationSeconds = Math.max(
      0,
      Math.round((leaveTime.getTime() - new Date(attendance.joinedAt).getTime()) / 1000)
    );

    attendance.leftAt = leaveTime;
    attendance.duration += durationSeconds;
    // If attended less than 60 seconds, mark as partial
    if (attendance.duration < 60) {
      attendance.status = 'partial';
    }

    await attendance.save();
    return attendance;
  } catch (error) {
    console.error('[Attendance Record Leave Error]:', error);
    return null;
  }
};

/**
 * Get attendance records for a classroom
 */
const getClassroomAttendance = async (classroomId) => {
  const records = await Attendance.find({ classroom: classroomId })
    .populate('student', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();

  return records;
};

module.exports = {
  recordStudentJoin,
  recordStudentLeave,
  getClassroomAttendance,
};
