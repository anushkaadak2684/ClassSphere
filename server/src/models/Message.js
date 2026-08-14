const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom reference is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['CHAT', 'ANNOUNCEMENT'],
      default: 'CHAT',
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ classroom: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
