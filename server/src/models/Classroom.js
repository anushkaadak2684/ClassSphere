const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Classroom name is required'],
      trim: true,
      maxlength: [100, 'Classroom name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher reference is required'],
      index: true,
    },
    joinCode: {
      type: String,
      required: [true, 'Join code is required'],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    liveStartedAt: {
      type: Date,
      default: null,
    },
    liveEndedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for student count (populated dynamically or through aggregates)
classroomSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'classroom',
});

module.exports = mongoose.model('Classroom', classroomSchema);
