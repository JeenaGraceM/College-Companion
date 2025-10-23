const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Announcement = require('../../models/announcements/announcements');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize GridFS
let gfs, gridFSBucket;
const conn = mongoose.connection;
conn.once('open', () => {
  try {
    // Initialize GridFS stream
    const Grid = require('gridfs-stream');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('announcements');
    
    // Create GridFSBucket instance
    gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'announcements'
    });
    console.log('GridFS initialized for announcements');
  } catch (error) {
    console.error('Error initializing GridFS:', error);
  }
});

// Function to store file in GridFS
const storeFileInGridFS = async (file) => {
  return new Promise((resolve, reject) => {
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        contentType: file.mimetype,
        uploadDate: new Date()
      }
    });
    
    uploadStream.end(file.buffer);
    uploadStream.on('finish', () => {
      resolve(filename);
    });
    uploadStream.on('error', reject);
  });
};

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('posted_by', 'fullName email role')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: err.message });
  }
});

// Post announcement (with optional file)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('Request headers:', req.headers);

    // Check if body exists and has the required fields
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is undefined' });
    }

    const { title, content, posted_by, posted_by_role } = req.body;

    // Validate required fields
    if (!title || !content || !posted_by || !posted_by_role) {
      return res.status(400).json({ 
        error: 'All fields are required',
        received: {
          title: title || 'missing',
          content: content || 'missing', 
          posted_by: posted_by || 'missing',
          posted_by_role: posted_by_role || 'missing'
        }
      });
    }

    let fileUrl = null;
    
    // Handle file upload if present
    if (req.file) {
      try {
        console.log('Storing file in GridFS...');
        const filename = await storeFileInGridFS(req.file);
        fileUrl = `/api/announcements/files/${filename}`;
        console.log('File stored successfully:', filename);
      } catch (fileError) {
        console.error('Error storing file:', fileError);
        // Continue without file if upload fails
        console.log('File upload failed, continuing without file...');
      }
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      posted_by,
      posted_by_role,
      fileUrl: fileUrl
    });

    await newAnnouncement.save();
    console.log('Announcement saved successfully');
    
    res.status(201).json({
      message: 'Announcement posted successfully!',
      announcement: newAnnouncement
    });
  } catch (err) {
    console.error('Error posting announcement:', err);
    res.status(400).json({ error: err.message });
  }
});

// Serve files from GridFS
router.get('/files/:filename', async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ error: 'GridFS not initialized' });
    }

    const files = await gfs.files.find({ filename: req.params.filename }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No file found' });
    }
    
    const file = files[0];
    
    // Set appropriate headers for PDF
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    const readstream = gridFSBucket.openDownloadStreamByName(req.params.filename);
    readstream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ error: 'Error streaming file' });
    });
    readstream.pipe(res);
  } catch (err) {
    console.error('Error serving file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get engagement data
router.get('/engagement', async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    
    const announcementsByRole = await Announcement.aggregate([
      {
        $group: {
          _id: '$posted_by_role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAnnouncements,
      announcementsByRole,
      recentActivity: recentAnnouncements
    });
  } catch (err) {
    console.error('Error fetching engagement data:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;