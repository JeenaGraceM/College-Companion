const express = require('express');
const router = express.Router();
const MedicalStaff = require('../../models/health/medicalStaff');


router.get('/', async (req, res) => {
  try {
    const doctors = await MedicalStaff.find(); // fetch all doctors
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found' });
    }
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single medical staff (doctor) by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await MedicalStaff.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create a new medical staff
router.post('/', async (req, res) => {
    try{
        const newStaff = new MedicalStaff(req.body);
        await newStaff.save();
        res.status(201).json(newStaff);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
});

// Delete a medical staff
router.delete('/:id', async (req, res) => {
    try{
        await MedicalStaff.findByIdAndDelete(req.params.id);
        res.json({message: 'Medical staff deleted'});
    }   
    catch(err){
        res.status(500).json({error: err.message});
    }   
});

module.exports = router;