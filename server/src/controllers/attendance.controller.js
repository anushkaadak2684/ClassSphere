const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Teacher views attendance records for a classroom
 * GET /api/classrooms/:id/attendance
 */
const getAttendance = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;
  const records = await attendanceService.getClassroomAttendance(classroomId);

  res.status(200).json({
    success: true,
    data: records,
  });
});

module.exports = {
  getAttendance,
};
