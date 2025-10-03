const express = require('express');
const router = express.Router();
const Announcement = require('../../models/announcements/announcements');
const User = require('../../models/users'); 

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('posted_by', 'fullName email role branch');

    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get announcements by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const announcements = await Announcement.find({ posted_by: req.params.id })
      .populate('posted_by', 'fullName email role branch');

    if (!announcements.length) {
      return res.json([]); // return empty array if none found
    }

    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new announcement
router.post('/', async (req, res) => {
  try {
    const { title, content, posted_by, posted_by_role } = req.body;

    // validate user exists
    const user = await User.findById(posted_by);
    if (!user) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      posted_by,
      posted_by_role,
      createdAt: new Date()
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// Delete an announcement by ID
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
