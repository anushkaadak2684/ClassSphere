const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: [1, 'Maximum marks must be at least 1'],
    },
    attachment: {
      secureUrl: { type: String, default: '' },
      publicId: { type: String, default: '' },
      name: { type: String, default: '' },
      fileSize: { type: Number, default: 0 },
      resourceType: { type: String, default: 'auto' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ classroom: 1, dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
