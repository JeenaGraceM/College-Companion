const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  type: { type: String, required: true },  
  value: { type: String, required: true }
}, { _id: false });

const medicalStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: [contactSchema], required: true }
}, {collection:'medicalStaff'});

module.exports = mongoose.model('MedicalStaff', medicalStaffSchema);
