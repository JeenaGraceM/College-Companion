const mongoose = require('mongoose');

// Define schema
const FileSchema = new mongoose.Schema({
  programme: {
    type: String,
    default: "N/A",
    trim: true
  },
  course: {
    type: String,
    default: "N/A",
    trim: true
  },
  branch: {
    type: String,
    default: "N/A",
    trim: true
  },
  semester: {
    type: Number,
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Add an index for faster search (optional)
FileSchema.index({ semester: 1, uploadDate: -1 });

// Create model
module.exports = mongoose.model('File', FileSchema);
