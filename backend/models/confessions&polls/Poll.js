const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: [v => v.length >= 2, 'A poll must have at least two options.'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Poll', PollSchema);