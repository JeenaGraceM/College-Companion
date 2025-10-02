const express = require('express');
const router = express.Router();
const Notes = require('../../models/notes&past_papers/notes'); // your schema for notes

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Notes.find().sort({ uploadDate: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get notes by semester or programme
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

// Create/upload a new note
router.post('/', async (req, res) => {
  try {
    const { programme, course, branch, semester, year, fileName } = req.body;

    const newNote = new Notes({
      programme: programme || "N/A",
      course: course || "N/A",
      branch: branch || "N/A",
      semester,
      year,
      fileName,
      uploadDate: new Date()
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// Delete a note by ID
router.delete('/:id', async (req, res) => {
  try {
    await Notes.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
