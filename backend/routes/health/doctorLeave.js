const express = require('express');
const router = express.Router();
const Leave = require('../../models/health/doctorLeave'); 
const authMiddleware = require('../../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// =============================
// Get all leaves
// =============================
router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Get leaves for a specific doctor
// =============================
router.get('/doctor/:doctor_id', async (req, res) => {
  try {
    const doctorLeaves = await Leave.find({ doctor_id: req.params.doctor_id });
    res.json(doctorLeaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Add a new leave (single date only)
// =============================
router.post('/', async (req, res) => {
  try {
    const { doctor_id, leave_date, reason } = req.body;

    if (!doctor_id || !leave_date) {
      return res.status(400).json({ error: "doctor_id and leave_date are required" });
    }

    const newLeave = new Leave({ doctor_id, leave_date, reason });
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Delete a leave by ID
// =============================
router.delete('/:id', async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
