const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  posted_by_role: {
    type: String,
    enum: ["student", "rep", "teacher", "professor", "doctor"],
    required: true
  },
  fileUrl: {
    type: String, // stores GridFS file link
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AnnouncementSchema.index({ posted_by: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema, 'announcements');
