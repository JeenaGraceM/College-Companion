const express = require('express');
const router = express.Router();
const LostFound = require('../../models/confessions&polls/LostFound');

// POST a new Lost or Found item
router.post('/', async (req, res) => {
  try {
    const newItem = new LostFound(req.body);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

// GET all Lost & Found items (most recent first)
router.get('/', async (req, res) => {
  try {
    const items = await LostFound.find().sort({ date: -1 });
    res.status(200).send(items);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch items.' });
  }
});

module.exports = router;
