const express = require('express');
const router = express.Router();
const Confession = require('../../models/confessions&polls/confessions');

// POST a new confession
router.post('/', async (req, res) => {
  try {
    console.log('Confession received:', req.body);
    
    if (!req.body.content) {
      return res.status(400).send({ message: 'Content is required' });
    }
    
    const newConfession = new Confession({ content: req.body.content });
    await newConfession.save();
    
    console.log('Confession saved:', newConfession);
    res.status(201).send(newConfession);
  } catch (error) {
    console.error('Confession POST error:', error);
    res.status(400).send({ message: error.message });
  }
});

// GET latest 50 confessions
router.get('/', async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ date: -1 }).limit(50);
    res.status(200).send(confessions);
  } catch (error) {
    console.error('Confessions GET error:', error);
    res.status(500).send({ message: 'Failed to fetch confessions.' });
  }
});

// GET test route
router.get('/test', (req, res) => {
  res.status(200).send({ message: 'Confessions route is working!' });
});

module.exports = router;