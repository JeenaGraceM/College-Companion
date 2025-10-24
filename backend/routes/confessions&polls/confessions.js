const express = require('express');
const router = express.Router();
const Confession = require('../../models/confessions&polls/confessions');

// POST a new confession
router.post('/', async (req, res) => {
  try {
    console.log('Received confession POST request:', req.body);
    
    // Validate request body
    if (!req.body || !req.body.content) {
      return res.status(400).send({ 
        message: 'Confession content is required' 
      });
    }

    const content = req.body.content.trim();
    
    // Check if content is not empty after trimming
    if (content === '') {
      return res.status(400).send({ 
        message: 'Confession content cannot be empty' 
      });
    }

    // Check content length
    if (content.length > 1000) {
      return res.status(400).send({ 
        message: 'Confession content must be less than 1000 characters' 
      });
    }

    const newConfession = new Confession({ 
      content: content 
    });
    
    const savedConfession = await newConfession.save();
    console.log('Confession saved successfully:', savedConfession._id);
    
    res.status(201).send(savedConfession);
  } catch (error) {
    console.error('Error creating confession:', error);
    res.status(400).send({ 
      message: 'Failed to create confession',
      error: error.message 
    });
  }
});

// GET latest 50 confessions
router.get('/', async (req, res) => {
  try {
    const confessions = await Confession.find()
      .sort({ date: -1 })
      .limit(50);
    
    res.status(200).send(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    res.status(500).send({ 
      message: 'Failed to fetch confessions',
      error: error.message 
    });
  }
});

module.exports = router;