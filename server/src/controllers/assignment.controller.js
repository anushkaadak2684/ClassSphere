const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const Enrollment = require('../models/Enrollment');
const cloudinaryService = require('../services/cloudinary.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Teacher creates a new assignment with optional attachment
 * POST /api/classrooms/:id/assignments
 */
const createAssignment = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;
  const { title, description, dueDate, maxMarks } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Assignment title and due date are required.',
    });
  }

  let attachment = {
    secureUrl: '',
    publicId: '',
    name: '',
    fileSize: 0,
    resourceType: 'auto',
  };

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadBufferToCloudinary(
      req.file.buffer,
      `classsphere_assignments_${classroomId}`,
      req.file.originalname
    );
    attachment = {
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      name: req.file.originalname,
      fileSize: uploadResult.fileSize,
      resourceType: uploadResult.resourceType,
    };
  }

  const assignment = await Assignment.create({
    classroom: classroomId,
    title: title.trim(),
    description: description ? description.trim() : '',
    dueDate: new Date(dueDate),
    maxMarks: maxMarks ? Number(maxMarks) : 100,
    attachment,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: assignment,
    message: 'Assignment created successfully.',
  });
});

/**
 * Get all assignments for a classroom (Teacher or enrolled Student)
 * GET /api/classrooms/:id/assignments
 */
const getClassroomAssignments = asyncHandler(async (req, res) => {
  const classroomId = req.params.id;

  const assignments = await Assignment.find({ classroom: classroomId })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ dueDate: 1 })
    .lean();

  if (req.user.role === 'student') {
    // Enrich with student's own submission for each assignment
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: req.user._id,
    }).lean();

    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.assignment.toString()] = s;
    });

    const enriched = assignments.map((a) => ({
      ...a,
      mySubmission: submissionMap[a._id.toString()] || null,
      hasSubmitted: Boolean(submissionMap[a._id.toString()]),
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
    });
  }

  // If teacher, enrich with total submission counts
  const assignmentIds = assignments.map((a) => a._id);
  const totalStudents = await Enrollment.countDocuments({ classroom: classroomId, status: 'active' });
  const submissionCounts = await Submission.aggregate([
    { $match: { assignment: { $in: assignmentIds } } },
    { $group: { _id: '$assignment', count: { $sum: 1 }, gradedCount: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } } } },
  ]);

  const countMap = {};
  submissionCounts.forEach((item) => {
    countMap[item._id.toString()] = item;
  });

  const enriched = assignments.map((a) => ({
    ...a,
    totalStudents,
    submissionCount: countMap[a._id.toString()]?.count || 0,
    gradedCount: countMap[a._id.toString()]?.gradedCount || 0,
  }));

  res.status(200).json({
    success: true,
    data: enriched,
  });
});

/**
 * Get single assignment details by ID
 * GET /api/assignments/:id
 */
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('classroom', 'name subject teacher')
    .populate('createdBy', 'name email avatarUrl');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

/**
 * Teacher updates an assignment
 * PUT /api/assignments/:id
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  // Check teacher ownership
  const classroom = await Classroom.findById(assignment.classroom);
  if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not own this classroom.',
    });
  }

  const { title, description, dueDate, maxMarks } = req.body;
  if (title) assignment.title = title.trim();
  if (description !== undefined) assignment.description = description.trim();
  if (dueDate) assignment.dueDate = new Date(dueDate);
  if (maxMarks) assignment.maxMarks = Number(maxMarks);

  await assignment.save();

  res.status(200).json({
    success: true,
    data: assignment,
    message: 'Assignment updated successfully.',
  });
});

/**
 * Teacher deletes an assignment and its submissions
 * DELETE /api/assignments/:id
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  const classroom = await Classroom.findById(assignment.classroom);
  if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not own this classroom.',
    });
  }

  // Delete attachment from Cloudinary if present
  if (assignment.attachment?.publicId) {
    try {
      await cloudinaryService.deleteCloudinaryAsset(
        assignment.attachment.publicId,
        assignment.attachment.resourceType
      );
    } catch (e) {
      console.warn('[Cloudinary Delete Notice]:', e.message);
    }
  }

  // Delete all submissions and their files
  const submissions = await Submission.find({ assignment: assignment._id });
  for (const sub of submissions) {
    if (sub.file?.publicId) {
      try {
        await cloudinaryService.deleteCloudinaryAsset(sub.file.publicId, sub.file.resourceType);
      } catch (e) {
        // Continue
      }
    }
  }
  await Submission.deleteMany({ assignment: assignment._id });
  await Assignment.findByIdAndDelete(assignment._id);

  res.status(200).json({
    success: true,
    data: { message: 'Assignment and associated submissions deleted successfully.' },
  });
});

/**
 * Student submits an assignment
 * POST /api/assignments/:id/submit
 */
const submitAssignment = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  const { comment } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload your assignment submission file.',
    });
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  // Verify student is enrolled in the classroom
  const enrollment = await Enrollment.findOne({
    classroom: assignment.classroom,
    student: req.user._id,
    status: 'active',
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You are not enrolled in this classroom.',
    });
  }

  // Upload submission file to Cloudinary
  const uploadResult = await cloudinaryService.uploadBufferToCloudinary(
    req.file.buffer,
    `classsphere_submissions_${assignmentId}`,
    req.file.originalname
  );

  const fileData = {
    secureUrl: uploadResult.secureUrl,
    publicId: uploadResult.publicId,
    name: req.file.originalname,
    fileSize: uploadResult.fileSize,
    resourceType: uploadResult.resourceType,
  };

  // Upsert / Create submission
  let submission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id,
  });

  if (submission) {
    // Replace existing submission file
    submission.file = fileData;
    submission.comment = comment ? comment.trim() : submission.comment;
    submission.submittedAt = new Date();
    submission.status = 'submitted';
    submission.marks = null;
    submission.feedback = '';
    await submission.save();
  } else {
    submission = await Submission.create({
      assignment: assignmentId,
      classroom: assignment.classroom,
      student: req.user._id,
      file: fileData,
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
      status: 'submitted',
    });
  }

  await submission.populate('student', 'name email avatarUrl');

  res.status(201).json({
    success: true,
    data: submission,
    message: 'Assignment submitted successfully.',
  });
});

/**
 * Teacher views all submissions for an assignment
 * GET /api/assignments/:id/submissions
 */
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  const classroom = await Classroom.findById(assignment.classroom);
  if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only the teacher of this classroom can view submissions.',
    });
  }

  const submissions = await Submission.find({ assignment: assignmentId })
    .populate('student', 'name email avatarUrl')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    data: submissions,
  });
});

/**
 * Student views their own submission for an assignment
 * GET /api/assignments/:id/my-submission
 */
const getMySubmission = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;

  const submission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id,
  }).populate('student', 'name email avatarUrl');

  res.status(200).json({
    success: true,
    data: submission || null,
  });
});

/**
 * Teacher grades a student submission
 * PUT /api/submissions/:id/grade
 */
const gradeSubmission = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;
  const { marks, feedback } = req.body;

  if (marks === undefined || marks === null) {
    return res.status(400).json({
      success: false,
      message: 'Marks are required to grade submission.',
    });
  }

  const submission = await Submission.findById(submissionId).populate('assignment');
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found.',
    });
  }

  // Check teacher ownership
  const classroom = await Classroom.findById(submission.classroom);
  if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only the teacher can grade this submission.',
    });
  }

  const numericMarks = Number(marks);
  if (isNaN(numericMarks) || numericMarks < 0) {
    return res.status(400).json({
      success: false,
      message: 'Marks must be a non-negative number.',
    });
  }

  if (numericMarks > submission.assignment.maxMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks cannot exceed maximum marks (${submission.assignment.maxMarks}).`,
    });
  }

  submission.marks = numericMarks;
  submission.feedback = feedback ? feedback.trim() : '';
  submission.status = 'graded';
  submission.gradedAt = new Date();

  await submission.save();
  await submission.populate('student', 'name email avatarUrl');

  res.status(200).json({
    success: true,
    data: submission,
    message: 'Submission graded successfully.',
  });
});

module.exports = {
  createAssignment,
  getClassroomAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  getMySubmission,
  gradeSubmission,
};
