const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    file: {
      secureUrl: { type: String, required: [true, 'Submission file URL is required'] },
      publicId: { type: String, required: [true, 'Cloudinary public ID is required'] },
      name: { type: String, required: [true, 'File name is required'] },
      fileSize: { type: Number, default: 0 },
      resourceType: { type: String, default: 'auto' },
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
    marks: {
      type: Number,
      default: null,
      min: 0,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate submissions per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
