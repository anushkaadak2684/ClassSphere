const Classroom = require('../models/Classroom');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get classroom progress analytics
 * GET /api/classrooms/:id/progress
 */
const getClassroomProgress = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;
  const isTeacher = req.user.role === 'teacher';

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found.',
    });
  }

  // Get total unique session dates held for this classroom
  const distinctDates = await Attendance.distinct('sessionDate', { classroom: classroomId });
  const totalSessionsCount = distinctDates.length;

  // Get all assignments for this classroom
  const assignments = await Assignment.find({ classroom: classroomId }).lean();
  const totalAssignmentsCount = assignments.length;

  if (!isTeacher) {
    // -------------------------------------------------------------
    // STUDENT VIEW: Calculate specific metrics for current student
    // -------------------------------------------------------------
    const studentAttendanceRecords = await Attendance.find({
      classroom: classroomId,
      student: req.user._id,
    });

    const attendedSessionsCount = studentAttendanceRecords.filter((r) => r.status === 'present' || r.duration >= 60).length;
    const attendancePercentage = totalSessionsCount > 0
      ? Math.min(100, Math.round((attendedSessionsCount / totalSessionsCount) * 100))
      : 100;

    // Submissions by this student
    const submissions = await Submission.find({
      classroom: classroomId,
      student: req.user._id,
    }).populate('assignment').lean();

    const submittedCount = submissions.length;
    const pendingCount = Math.max(0, totalAssignmentsCount - submittedCount);

    // Calculate average score
    const gradedSubmissions = submissions.filter((s) => s.status === 'graded' && s.marks !== null);
    let averageScore = 0;
    if (gradedSubmissions.length > 0) {
      const totalPercent = gradedSubmissions.reduce((sum, s) => {
        const max = s.assignment?.maxMarks || 100;
        return sum + (s.marks / max) * 100;
      }, 0);
      averageScore = Math.round(totalPercent / gradedSubmissions.length);
    }

    // Detailed assignments breakdown
    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.assignment?._id?.toString() || s.assignment?.toString()] = s;
    });

    const assignmentBreakdown = assignments.map((a) => {
      const sub = submissionMap[a._id.toString()];
      return {
        _id: a._id,
        title: a.title,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        isSubmitted: Boolean(sub),
        submittedAt: sub ? sub.submittedAt : null,
        status: sub ? sub.status : (new Date() > new Date(a.dueDate) ? 'overdue' : 'pending'),
        marks: sub ? sub.marks : null,
        feedback: sub ? sub.feedback : '',
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        role: 'student',
        metrics: {
          attendancePercentage,
          attendedSessions: attendedSessionsCount,
          totalSessions: totalSessionsCount,
          totalAssignments: totalAssignmentsCount,
          completedAssignments: submittedCount,
          pendingAssignments: pendingCount,
          averageScore,
          gradedCount: gradedSubmissions.length,
        },
        assignmentBreakdown,
        attendanceRecords: studentAttendanceRecords,
      },
    });
  }

  // -------------------------------------------------------------
  // TEACHER VIEW: Overview of all enrolled students' progress
  // -------------------------------------------------------------
  const enrollments = await Enrollment.find({ classroom: classroomId, status: 'active' })
    .populate('student', 'name email avatarUrl')
    .lean();

  const studentIds = enrollments.map((e) => e.student?._id).filter(Boolean);

  // Fetch all attendance and submissions in bulk
  const [allAttendance, allSubmissions] = await Promise.all([
    Attendance.find({ classroom: classroomId, student: { $in: studentIds } }).lean(),
    Submission.find({ classroom: classroomId, student: { $in: studentIds } }).populate('assignment').lean(),
  ]);

  // Aggregate per student
  const studentProgressList = enrollments.map((e) => {
    const sId = e.student._id.toString();
    const studentAtt = allAttendance.filter((a) => a.student.toString() === sId);
    const attendedCount = studentAtt.filter((a) => a.status === 'present' || a.duration >= 60).length;
    const attPercent = totalSessionsCount > 0
      ? Math.min(100, Math.round((attendedCount / totalSessionsCount) * 100))
      : 100;

    const studentSubs = allSubmissions.filter((sub) => sub.student.toString() === sId);
    const gradedSubs = studentSubs.filter((sub) => sub.status === 'graded' && sub.marks !== null);

    let avgScore = 0;
    if (gradedSubs.length > 0) {
      const sumPercent = gradedSubs.reduce((sum, s) => {
        const max = s.assignment?.maxMarks || 100;
        return sum + (s.marks / max) * 100;
      }, 0);
      avgScore = Math.round(sumPercent / gradedSubs.length);
    }

    return {
      student: e.student,
      enrolledAt: e.joinedAt,
      attendancePercentage: attPercent,
      attendedSessions: attendedCount,
      completedAssignments: studentSubs.length,
      totalAssignments: totalAssignmentsCount,
      gradedCount: gradedSubs.length,
      averageScore: avgScore,
    };
  });

  // Calculate overall class average score
  let classAverageScore = 0;
  const studentsWithGrades = studentProgressList.filter((s) => s.gradedCount > 0);
  if (studentsWithGrades.length > 0) {
    classAverageScore = Math.round(
      studentsWithGrades.reduce((sum, s) => sum + s.averageScore, 0) / studentsWithGrades.length
    );
  }

  res.status(200).json({
    success: true,
    data: {
      role: 'teacher',
      summary: {
        totalStudents: enrollments.length,
        totalSessions: totalSessionsCount,
        totalAssignments: totalAssignmentsCount,
        classAverageScore,
      },
      students: studentProgressList,
    },
  });
});

module.exports = {
  getClassroomProgress,
};
