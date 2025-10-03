const mongoose = require('mongoose');

// Sub-schema for the options within the poll
const PollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
}, { _id: false }); // Prevents Mongoose from creating an extra ID for each option

const PollSchema = new mongoose.Schema({
  // The main question or topic of the poll
  question: {
    type: String,
    required: true,
    trim: true,
  },
  // An array of possible answers
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: [v => v.length >= 2, 'A poll must have at least two options.'],
  },
  // Timestamp for when the poll was created (used to find the "daily" poll)
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Poll', PollSchema);