const mongoose = require('mongoose');

const ConfessionSchema = new mongoose.Schema({
  // The anonymous content of the confession
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Timestamp for when the confession was created
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Confession', ConfessionSchema);