const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    sessionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'partial', 'absent'],
      default: 'present',
    },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for frequent queries
attendanceSchema.index({ classroom: 1, sessionDate: -1 });
attendanceSchema.index({ student: 1, classroom: 1, sessionDate: -1 });
attendanceSchema.index({ classroom: 1, student: 1, sessionDate: 1 });
attendanceSchema.index({ classroom: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
