const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  programme: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true
  },
  year: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: false
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for faster search
FileSchema.index({ semester: 1, uploadDate: -1 });
FileSchema.index({ programme: 1, branch: 1 });

module.exports = mongoose.model('File', FileSchema);