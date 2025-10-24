const express = require('express');
const router = express.Router();
const LostFound = require('../../models/confessions&polls/LostFound');

// POST a new Lost or Found item
router.post('/', async (req, res) => {
  try {
    console.log('Received LostFound data:', req.body);
    
    const { itemType, itemName, description, contactInfo, status, imageUrls } = req.body;
    
    // Validation
    if (!itemType || !itemName || !description || !contactInfo) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    const newItem = new LostFound({
      itemType,
      itemName, 
      description,
      contactInfo,
      status: status || 'Pending',
      imageUrls: imageUrls || []
    });
    
    await newItem.save();
    console.log('LostFound item saved:', newItem);
    res.status(201).send(newItem);
  } catch (error) {
    console.error('LostFound POST error:', error);
    res.status(400).send({ message: error.message });
  }
});

// GET all Lost & Found items (most recent first)
router.get('/', async (req, res) => {
  try {
    const items = await LostFound.find().sort({ createdAt: -1 });
    res.status(200).send(items);
  } catch (error) {
    console.error('LostFound GET error:', error);
    res.status(500).send({ message: 'Failed to fetch items.' });
  }
});

// GET test route
router.get('/test', (req, res) => {
  res.status(200).send({ message: 'LostFound route is working!' });
});

module.exports = router;