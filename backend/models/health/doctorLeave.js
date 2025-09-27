const mongoose = require('mongoose');

const doctorLeaveSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String }
}, {collection: 'doctorLeave'});

module.exports = mongoose.model('DoctorLeave', doctorLeaveSchema);
