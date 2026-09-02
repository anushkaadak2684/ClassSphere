const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
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
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'dropped'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollments: A student cannot enroll twice in the same classroom
enrollmentSchema.index({ classroom: 1, student: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ classroom: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
