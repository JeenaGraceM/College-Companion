const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../../config/gridFsStorage'); // GridFS storage
const upload = multer({ storage });
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const PastPapers = require('../../models/notes&past_papers/past_papers'); // metadata schema

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('past_papers'); // bucket name
});

// ---------------------------
// GET all past papers metadata
// ---------------------------
router.get('/', async (req, res) => {
  try {
    const papers = await PastPapers.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---------------------------
// GET past papers by filter (semester, programme, branch, year)
// ---------------------------
router.get('/filter', async (req, res) => {
  try {
    const { programme, semester, branch, year } = req.query;
    let filter = {};

    if (programme) filter.programme = programme;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;

    const papers = await PastPapers.find(filter).sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---------------------------
// POST: Upload a file AND save metadata
// ---------------------------
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { programme, course, branch, semester, year } = req.body;

    // Save metadata in PastPapers collection
    const newPaper = new PastPapers({
      programme: programme || 'N/A',
      course: course || 'N/A',
      branch: branch || 'N/A',
      semester,
      year,
      fileName: req.file.filename, // filename stored in GridFS
      uploadDate: new Date()
    });

    await newPaper.save();

    res.status(201).json({
      message: 'File uploaded and metadata saved successfully!',
      file: req.file,
      metadata: newPaper
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// ---------------------------
// DELETE a past paper by ID (metadata)
// ---------------------------
router.delete('/:id', async (req, res) => {
  try {
    const paper = await PastPapers.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }

    // Remove file from GridFS
    gfs.remove({ filename: paper.fileName, root: 'past_papers' }, (err) => {
      if (err) console.error('GridFS remove error:', err);
    });

    await PastPapers.findByIdAndDelete(req.params.id);

    res.json({ message: 'Past paper deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
