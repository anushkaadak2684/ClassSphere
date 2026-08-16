const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Classroom = require('../models/Classroom');

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
 * Get attendance records for a classroom (Teacher view)
 */
const getClassroomAttendance = async (classroomId) => {
  const records = await Attendance.find({ classroom: classroomId })
    .populate('student', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();

  return records;
};

/**
 * Get full attendance overview and session logs for a student across all enrolled classrooms
 */
const getStudentAttendance = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId, status: 'active' })
    .populate('classroom', 'name subject joinCode isLive')
    .lean();

  const classroomIds = enrollments.map((e) => e.classroom?._id).filter(Boolean);

  // Fetch all attendance logs for this student
  const studentLogs = await Attendance.find({
    student: studentId,
    classroom: { $in: classroomIds },
  })
    .populate('classroom', 'name subject')
    .sort({ joinedAt: -1 })
    .lean();

  // For each enrolled classroom, calculate sessions and attendance
  let totalPlatformSessions = 0;
  let totalPlatformAttended = 0;

  const classroomBreakdown = await Promise.all(
    enrollments.map(async (e) => {
      const cId = e.classroom._id;
      const distinctSessions = await Attendance.distinct('sessionDate', { classroom: cId });
      const totalSessions = distinctSessions.length;

      const classLogs = studentLogs.filter(
        (log) => log.classroom?._id?.toString() === cId.toString()
      );
      const attendedCount = classLogs.filter(
        (log) => log.status === 'present' || log.duration >= 60
      ).length;

      const percentage = totalSessions > 0
        ? Math.min(100, Math.round((attendedCount / totalSessions) * 100))
        : 100;

      totalPlatformSessions += totalSessions;
      totalPlatformAttended += attendedCount;

      return {
        classroom: e.classroom,
        totalSessions,
        attendedSessions: attendedCount,
        missedSessions: Math.max(0, totalSessions - attendedCount),
        attendancePercentage: percentage,
      };
    })
  );

  const overallPercentage = totalPlatformSessions > 0
    ? Math.min(100, Math.round((totalPlatformAttended / totalPlatformSessions) * 100))
    : 100;

  return {
    overall: {
      attendancePercentage: overallPercentage,
      totalSessions: totalPlatformSessions,
      attendedSessions: totalPlatformAttended,
      missedSessions: Math.max(0, totalPlatformSessions - totalPlatformAttended),
    },
    classroomBreakdown,
    history: studentLogs,
  };
};

module.exports = {
  recordStudentJoin,
  recordStudentLeave,
  getClassroomAttendance,
  getStudentAttendance,
};

