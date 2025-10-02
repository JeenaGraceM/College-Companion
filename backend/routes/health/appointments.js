// routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../../models/health/appointments');

const authMiddleware = require('../../middleware/authMiddleware');

// Protect all routes below
router.use(authMiddleware);
/*

// 📌 Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor_id', 'name specialization')
      .populate('student_id', 'fullName rollNumber');
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
*/

// 📌 Get appointments for a specific student
router.get('/users/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ student_id: req.params.id })
      .populate('doctor_id', 'name specialization')
      .populate('student_id', 'fullName rollNumber');

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found for this student' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 📌 Get appointments for a specific doctor
router.get('/doctor/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor_id: req.params.id })
      .populate('doctor_id', 'name specialization')
      .populate('student_id', 'fullName rollNumber');

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found for this doctor' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 📌 Create a new appointment
router.post('/', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// 📌 Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;