const express = require('express');
const router = express.Router();
const Leave = require('../../models/health/doctorLeave'); 

// Get all leaves
router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find().populate('doctorId', 'name specialization');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new leave
router.post('/', async (req, res) => {
  try {
    const newLeave = new Leave(req.body);   
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a leave
router.delete('/:id', async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
