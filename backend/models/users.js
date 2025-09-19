const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, match: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/ },
  password: { type: String, required: true },
  role: { type: String, enum: [ 'student', 'rep', 'teacher', 'doctor' ], required: true },
  branch: { type: String,enum: [
          'cse', 'ece', 'me',
          'ce',  'ee',  'it',
          'ae',  'nb'
        ], required: true },
  rollNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }},
  {collection: 'users', timestamps: true });

module.exports = mongoose.model('User', userSchema );
