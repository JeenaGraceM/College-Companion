const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  appointment_date: { type: Date, required: true },
  slot: { type: String, required: true },
  notes: { type: String }
}, { collection: 'appointments'});

module.exports = mongoose.model('Appointment', appointmentSchema);
