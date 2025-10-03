const mongoose = require('mongoose');

// Define schema
const PastPaperSchema = new mongoose.Schema({
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
  year: {
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

// Optional: add index for faster queries
PastPaperSchema.index({ semester: 1, year: -1, uploadDate: -1 });

// Create model
module.exports = mongoose.model('PastPaper', PastPaperSchema);

