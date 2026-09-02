const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Classroom = require('../models/Classroom');

/**
 * Record attendance when student joins a live session
 * Closes any dangling unclosed attendance record for this student/classroom first.
 */
const recordStudentJoin = async (classroomId, studentId) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Close any previous unclosed session for this student in this classroom (e.g. from unclean disconnect)
    const openRecord = await Attendance.findOne({
      classroom: classroomId,
      student: studentId,
      leftAt: null,
    }).sort({ joinedAt: -1 });

    if (openRecord) {
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - new Date(openRecord.joinedAt).getTime()) / 1000)
      );
      openRecord.leftAt = now;
      openRecord.duration = (openRecord.duration || 0) + durationSeconds;
      openRecord.status = openRecord.duration >= 60 ? 'present' : 'partial';
      await openRecord.save();
    }

    const attendance = await Attendance.create({
      classroom: classroomId,
      student: studentId,
      sessionDate: today,
      joinedAt: now,
      leftAt: null,
      duration: 0,
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
    attendance.duration = (attendance.duration || 0) + durationSeconds;
    attendance.status = attendance.duration >= 60 ? 'present' : 'partial';

    await attendance.save();
    return attendance;
  } catch (error) {
    console.error('[Attendance Record Leave Error]:', error);
    return null;
  }
};

/**
 * Finalize all open attendance records when a classroom live session ends
 */
const finalizeClassroomSessions = async (classroomId) => {
  try {
    const now = new Date();
    const openRecords = await Attendance.find({
      classroom: classroomId,
      leftAt: null,
    });

    for (const record of openRecords) {
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - new Date(record.joinedAt).getTime()) / 1000)
      );
      record.leftAt = now;
      record.duration = (record.duration || 0) + durationSeconds;
      record.status = record.duration >= 60 ? 'present' : 'partial';
      await record.save();
    }
    return openRecords.length;
  } catch (error) {
    console.error('[Attendance Finalize Sessions Error]:', error);
    return 0;
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
  finalizeClassroomSessions,
  getClassroomAttendance,
  getStudentAttendance,
};


