const mongoose = require('mongoose');

// Define schema - same as notes but with year as required for past papers
const PastPaperSchema = new mongoose.Schema({
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
    required: true, // Year is required for past papers
    trim: true
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
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for faster search
PastPaperSchema.index({ semester: 1, uploadDate: -1 });
PastPaperSchema.index({ programme: 1, branch: 1 });
PastPaperSchema.index({ year: 1 }); // Index for year since it's important for past papers

// Create model
module.exports = mongoose.model('PastPaper', PastPaperSchema);