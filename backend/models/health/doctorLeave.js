const mongoose = require("mongoose");

const doctorLeaveSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  leave_date: { type: Date, required: true },
  reason: { type: String }
});

module.exports = mongoose.model("DoctorLeave", doctorLeaveSchema);
