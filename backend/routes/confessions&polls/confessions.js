const express = require('express');
const router = express.Router();
const Confession = require('../../models/confessions&polls/confessions');

// POST a new confession
router.post('/', async (req, res) => {
  try {
    const newConfession = new Confession({ content: req.body.content });
    await newConfession.save();
    res.status(201).send(newConfession);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

// GET latest 50 confessions
router.get('/', async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ date: -1 }).limit(50);
    res.status(200).send(confessions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch confessions.' });
  }
});

module.exports = router;
