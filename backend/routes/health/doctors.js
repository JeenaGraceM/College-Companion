const express = require('express');
const router = express.Router();
const Doctor = require('../../models/users');

router.get('/', async (req, res) => {
    try{
        const doctors = await Doctor.find({ role: 'doctor'}, 'fullName email specialization department'); // fetch all doctors
        res.json(doctors);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}); 

router.get('/:doctorId', async (req, res) => {
  const doctorId = req.params.doctorId;   
  try {
    const doctor = await Doctor.findById(
      doctorId,
      'fullName email specialization department'  // Select only necessary fields
    );
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;