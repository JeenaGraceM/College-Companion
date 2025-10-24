const express = require('express');
const router = express.Router();
const multer = require('multer');
const createStorage = require('../../config/gridFsStorageFixed');
const Notes = require('../../models/notes_past_papers/notes');

// Use memory storage and handle GridFS manually
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const storageConfig = createStorage('notes');

// Helper function to get gfs
const getGfs = (req) => {
  return req.app.get('gfs').notes;
};

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Notes route is working!' });
});

// GET all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Notes.find().sort({ uploadDate: -1 });
    res.json(notes);
  } catch (err) {
    console.error('❌ Error fetching notes:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error: ' + err.message 
    });
  }
});

// POST: Upload a file WITH PROPER GRIDFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📨 Upload request received:', req.body);
    console.log('📁 File info:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file');

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { programme, course, branch, semester, year } = req.body;

    if (!programme || !course || !branch || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: programme, course, branch, semester'
      });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ 
        success: false,
        message: 'GridFS not initialized' 
      });
    }

    // Store file in GridFS manually
    console.log('📁 Storing file in GridFS...');
    const filename = await storageConfig.storeFile(req.file, gfs);

    // Save metadata
    const newNote = new Notes({
      programme: programme,
      course: course,
      branch: branch,
      semester: semester,
      year: year || null,
      fileName: filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      uploadDate: new Date()
    });

    await newNote.save();

    console.log('✅ Note saved to database with GridFS:', newNote);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully to GridFS!',
      file: {
        filename: filename,
        originalname: req.file.originalname,
        size: req.file.size
      },
      metadata: newNote
    });

  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error: ' + err.message 
    });
  }
});

// ---------------------------
// ---------------------------
// GET: Download a note file - UPDATED FOR GRIDFSBUCKET
// ---------------------------
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('📥 Download request for:', filename);
    
    // Find the file metadata
    const note = await Notes.findOne({ fileName: filename });
    if (!note) {
      return res.status(404).json({ message: 'File not found in database' });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    // Set download headers
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${note.originalName}"`);
    res.set('Cache-Control', 'no-cache');

    // Create download stream from GridFSBucket
    const downloadStream = gfs.openDownloadStreamByName(filename);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download stream error:', error);
      // Don't send response here as pipe might have already started
    });

  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// ---------------------------
// ---------------------------
// GET: View a note file - UPDATED FOR GRIDFSBUCKET
// ---------------------------
router.get('/view/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('👁️ View request for:', filename);
    
    // Find the file metadata
    const note = await Notes.findOne({ fileName: filename });
    if (!note) {
      return res.status(404).json({ message: 'File not found' });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    // Set view headers
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${note.originalName}"`);
    res.set('Cache-Control', 'no-cache');

    // Create view stream from GridFSBucket
    const downloadStream = gfs.openDownloadStreamByName(filename);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('View stream error:', error);
      // Don't send response here as pipe might have already started
    });

  } catch (err) {
    console.error('❌ View error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// FILTER ROUTE
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
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;