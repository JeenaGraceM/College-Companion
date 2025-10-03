const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multer = require('multer');
const Announcement = require('../../models/announcements/announcements');
const createStorage = require('../../config/gridFsStorage'); // must exist

// Multer + GridFS
const upload = multer({ storage: createStorage('announcements') });

let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('announcements');
});

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('posted_by', 'fullName email role')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post announcement (with optional file)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, content, posted_by, posted_by_role } = req.body;

    const newAnnouncement = new Announcement({
      title,
      content,
      posted_by,
      posted_by_role,
      fileUrl: req.file ? `/api/announcements/files/${req.file.filename}` : null
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve files from GridFS
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file found' });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

module.exports = router;
