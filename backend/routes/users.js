const express = require('express');
const router = express.Router();
const Appointment = require('../models/users'); 

// GET appointments for a specific student
router.get('/student/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ student_id: req.params.id })
      .populate('doctor_id', 'name specialization')
      .populate('student_id', 'fullName rollNumber');  // match your schema

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this student' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET appointments for a specific doctor
router.get('/doctor/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor_id: req.params.id })
      .populate('doctor_id', 'name specialization')
      .populate('student_id', 'fullName rollNumber');

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this doctor' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
