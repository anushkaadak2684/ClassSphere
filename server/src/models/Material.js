const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom reference is required'],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    secureUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    resourceType: {
      type: String,
      default: 'auto',
    },
    fileSize: {
      type: Number, // File size in bytes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

materialSchema.index({ classroom: 1, createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);
