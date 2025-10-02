const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../../config/gridFsStorage'); // GridFS storage
const upload = multer({ storage });
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Notes = require('../../models/notes&past_papers/notes'); // metadata schema

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('notes'); // bucket name
});

// ---------------------------
// GET all notes metadata
// ---------------------------
router.get('/', async (req, res) => {
  try {
    const notes = await Notes.find().sort({ uploadDate: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---------------------------
// GET notes by filter (semester, programme, branch, year)
// ---------------------------
router.get('/filter', async (req, res) => {
  try {
    const { programme, semester, branch, year } = req.query;
    let filter = {};

    if (programme) filter.programme = programme;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;

    const notes = await Notes.find(filter).sort({ uploadDate: -1 });
    res.json(notes);
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

    // Save metadata in Notes collection
    const newNote = new Notes({
      programme: programme || 'N/A',
      course: course || 'N/A',
      branch: branch || 'N/A',
      semester,
      year,
      fileName: req.file.filename, // filename stored in GridFS
      uploadDate: new Date()
    });

    await newNote.save();

    res.status(201).json({
      message: 'File uploaded and metadata saved successfully!',
      file: req.file,
      metadata: newNote
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// ---------------------------
// DELETE a note by ID (metadata)
// ---------------------------
router.delete('/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Optionally: remove file from GridFS
    gfs.remove({ filename: note.fileName, root: 'notes' }, (err) => {
      if (err) console.error('GridFS remove error:', err);
    });

    await Notes.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
