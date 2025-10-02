const express = require('express');
const router = express.Router();
const PastPaper = require('../../models/notes&past_papers/past_papers'); // your schema for past papers

// Get all past papers
router.get('/', async (req, res) => {
  try {
    const papers = await PastPaper.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get past papers by filters: programme, semester, branch, year, course
router.get('/filter', async (req, res) => {
  try {
    const { programme, semester, branch, year, course } = req.query;
    let filter = {};

    if (programme) filter.programme = programme;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    if (course) filter.course = course;

    const papers = await PastPaper.find(filter).sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create/upload a new past paper
router.post('/', async (req, res) => {
  try {
    const { programme, course, branch, semester, year, fileName } = req.body;

    const newPaper = new PastPaper({
      programme: programme || "N/A",
      course: course || "N/A",
      branch: branch || "N/A",
      semester,
      year,
      fileName,
      uploadDate: new Date()
    });

    await newPaper.save();
    res.status(201).json(newPaper);
  } catch (err) {
    console.error(err.message);
    res.status(400).send('Server Error');
  }
});

// Delete a past paper by ID
router.delete('/:id', async (req, res) => {
  try {
    await PastPaper.findByIdAndDelete(req.params.id);
    res.json({ message: 'Past paper deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;



