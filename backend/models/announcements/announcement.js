const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  postedBy: {
    type: String, 
    required: true
  },
  class: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'announcements',
  strict: true 
});

module.exports = mongoose.model('Announcement', announcementSchema);
