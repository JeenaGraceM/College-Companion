const express = require('express');
const router = express.Router();
const MedicalStaff = require('../../models/health/medicalStaff');

// Get all medical staff
router.get('/', async (req, res) => {
    try{
        const staff = await MedicalStaff.find();
        res.json(staff);
    }
    catch(err){
        res.status(500).json({error: err.message});
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