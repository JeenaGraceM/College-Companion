const mongoose = require('mongoose');

const ConfessionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Confession content is required'],
    trim: true,
    maxlength: [4000, 'Confession cannot exceed 4000 characters']
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Confession', ConfessionSchema);