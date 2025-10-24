const express = require('express');
const router = express.Router();
const Poll = require('../../models/confessions&polls/Poll');

// GET the most recent poll
router.get('/daily', async (req, res) => {
  try {
    const poll = await Poll.findOne().sort({ date: -1 });
    if (!poll) return res.status(404).send({ message: 'No poll available.' });
    res.status(200).send(poll);
  } catch (error) {
    console.error('Polls GET error:', error);
    res.status(500).send({ message: 'Failed to fetch poll.' });
  }
});

// POST a vote to a poll
router.post('/vote/:pollId', async (req, res) => {
  const { pollId } = req.params;
  const { optionIndex } = req.body;

  if (optionIndex === undefined || typeof optionIndex !== 'number') {
    return res.status(400).send({ message: 'Invalid option index.' });
  }

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).send({ message: 'Poll not found.' });
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).send({ message: 'Invalid option selected.' });
    }

    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.status(200).send(poll);
  } catch (error) {
    console.error('Vote POST error:', error);
    res.status(500).send({ message: 'Failed to record vote.' });
  }
});

// POST create a new poll
router.post('/', async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).send({ message: 'Question and at least 2 options are required' });
    }

    const newPoll = new Poll({
      question,
      options: options.map(opt => ({ text: opt.text, votes: 0 }))
    });

    await newPoll.save();
    res.status(201).send(newPoll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(400).send({ message: error.message });
  }
});

// GET test route
router.get('/test', (req, res) => {
  res.status(200).send({ message: 'Polls route is working!' });
});

module.exports = router;