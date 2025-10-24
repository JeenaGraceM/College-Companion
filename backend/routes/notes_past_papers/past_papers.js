const express = require('express');
const router = express.Router();
const multer = require('multer');
const createStorage = require('../../config/gridFsStorageFixed');
const PastPapers = require('../../models/notes_past_papers/past_papers');

// Use memory storage and handle GridFS manually
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const storageConfig = createStorage('past_papers');

// Helper function to get gfs
const getGfs = (req) => {
  const gfs = req.app.get('gfs');
  console.log('🔍 Available GridFS buckets:', gfs ? Object.keys(gfs) : 'No GridFS buckets found');
  return gfs ? gfs.past_papers : null;
};

// Debug route to check GridFS connection
router.get('/debug/gridfs', async (req, res) => {
  try {
    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ 
        success: false,
        message: 'GridFS bucket not initialized for past_papers' 
      });
    }

    // Try to list files to verify connection
    const files = [];
    const cursor = gfs.find({});
    
    for await (const doc of cursor) {
      files.push({
        filename: doc.filename,
        uploadDate: doc.uploadDate,
        length: doc.length
      });
    }

    res.json({
      success: true,
      message: 'GridFS bucket is working',
      bucket: 'past_papers',
      fileCount: files.length,
      files: files
    });

  } catch (err) {
    console.error('❌ GridFS debug error:', err);
    res.status(500).json({ 
      success: false,
      message: 'GridFS debug error: ' + err.message 
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  const gfs = getGfs(req);
  res.json({ 
    message: 'Past papers route is working!',
    gridfsAvailable: !!gfs,
    gridfsBucket: gfs ? 'past_papers' : 'Not available'
  });
});

// GET all past papers
router.get('/', async (req, res) => {
  try {
    const pastPapers = await PastPapers.find().sort({ uploadDate: -1 });
    console.log(`✅ Fetched ${pastPapers.length} past papers`);
    res.json(pastPapers);
  } catch (err) {
    console.error('❌ Error fetching past papers:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error: ' + err.message 
    });
  }
});

// POST: Upload a past paper WITH PROPER GRIDFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📨 Past paper upload request received:', req.body);
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

    // Validate required fields - year is required for past papers
    if (!programme || !course || !branch || !semester || !year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: programme, course, branch, semester, year'
      });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      console.error('❌ GridFS bucket not found for past_papers');
      return res.status(500).json({ 
        success: false,
        message: 'GridFS not initialized for past papers. Check server configuration.' 
      });
    }

    console.log('✅ GridFS bucket found, storing file...');

    // Store file in GridFS manually
    console.log('📁 Storing past paper in GridFS...');
    const filename = await storageConfig.storeFile(req.file, gfs);
    console.log('✅ File stored in GridFS:', filename);

    // Save metadata
    const newPastPaper = new PastPapers({
      programme: programme,
      course: course,
      branch: branch,
      semester: semester,
      year: year,
      fileName: filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      uploadDate: new Date()
    });

    await newPastPaper.save();
    console.log('✅ Past paper metadata saved to database:', newPastPaper._id);

    res.status(201).json({
      success: true,
      message: 'Past paper uploaded successfully to GridFS!',
      file: {
        filename: filename,
        originalname: req.file.originalname,
        size: req.file.size
      },
      metadata: newPastPaper
    });

  } catch (err) {
    console.error('❌ Past paper upload error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed: ' + err.message 
    });
  }
});

// ---------------------------
// GET: Download a past paper file - UPDATED FOR GRIDFSBUCKET
// ---------------------------
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('📥 Past paper download request for:', filename);
    
    // Find the file metadata
    const pastPaper = await PastPapers.findOne({ fileName: filename });
    if (!pastPaper) {
      console.log('❌ Past paper not found in database:', filename);
      return res.status(404).json({ message: 'Past paper not found in database' });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    // Set download headers
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${pastPaper.originalName}"`,
      'Cache-Control': 'no-cache',
      'Content-Length': pastPaper.fileSize
    });

    // Create download stream from GridFSBucket
    const downloadStream = gfs.openDownloadStreamByName(filename);
    
    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('end', () => {
      res.end();
      console.log('✅ Download completed:', filename);
    });

    downloadStream.on('error', (error) => {
      console.error('❌ Download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'File download failed: ' + error.message });
      }
    });

  } catch (err) {
    console.error('❌ Past paper download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error: ' + err.message });
    }
  }
});

// ---------------------------
// GET: View a past paper file - UPDATED FOR GRIDFSBUCKET
// ---------------------------
router.get('/view/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('👁️ Past paper view request for:', filename);
    
    // Find the file metadata
    const pastPaper = await PastPapers.findOne({ fileName: filename });
    if (!pastPaper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    // Set view headers for PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pastPaper.originalName}"`,
      'Cache-Control': 'no-cache',
      'Content-Length': pastPaper.fileSize
    });

    // Create view stream from GridFSBucket
    const downloadStream = gfs.openDownloadStreamByName(filename);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('❌ View stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'File view failed: ' + error.message });
      }
    });

  } catch (err) {
    console.error('❌ Past paper view error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error: ' + err.message });
    }
  }
});

// GET: Check if file exists
router.get('/check/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const pastPaper = await PastPapers.findOne({ fileName: filename });
    
    if (!pastPaper) {
      return res.status(404).json({ exists: false });
    }

    const gfs = getGfs(req);
    if (!gfs) {
      return res.status(500).json({ exists: false, error: 'GridFS not initialized' });
    }

    // Check if file exists in GridFS
    const files = await gfs.find({ filename }).toArray();
    const existsInGridFS = files.length > 0;

    res.json({
      exists: true,
      existsInGridFS: existsInGridFS,
      metadata: pastPaper
    });

  } catch (err) {
    console.error('❌ Check file error:', err);
    res.status(500).json({ exists: false, error: err.message });
  }
});

// FILTER ROUTE
router.get('/filter', async (req, res) => {
  try {
    const { programme, semester, branch, year, course } = req.query;
    let filter = {};

    if (programme) filter.programme = programme;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    if (course) filter.course = course;

    console.log('🔍 Filtering past papers with:', filter);
    const pastPapers = await PastPapers.find(filter).sort({ uploadDate: -1 });
    
    console.log(`✅ Found ${pastPapers.length} past papers matching filter`);
    res.json(pastPapers);
  } catch (err) {
    console.error('❌ Filter error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// DELETE a past paper
router.delete('/:id', async (req, res) => {
  try {
    const pastPaper = await PastPapers.findById(req.params.id);
    if (!pastPaper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }

    const gfs = getGfs(req);
    if (gfs) {
      // Delete from GridFS
      const files = await gfs.find({ filename: pastPaper.fileName }).toArray();
      if (files.length > 0) {
        await gfs.delete(files[0]._id);
        console.log('✅ Deleted from GridFS:', pastPaper.fileName);
      }
    }

    // Delete from database
    await PastPapers.findByIdAndDelete(req.params.id);
    
    console.log('✅ Past paper deleted successfully:', req.params.id);
    res.json({ 
      success: true,
      message: 'Past paper deleted successfully' 
    });

  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const gfs = getGfs(req);
  res.json({
    status: 'OK',
    gridfs: gfs ? 'Connected' : 'Not available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;