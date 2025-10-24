const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ========== FIXED CORS MIDDLEWARE ==========
// Use the cors package properly
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://localhost:5501'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional manual CORS as backup
app.use((req, res, next) => {
  const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://localhost:5501'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Debug logs for environment variables
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// IMPORT MODELS BEFORE ROUTES
require('./models/users');
require('./models/announcements/announcements');

// GRIDFS SETUP - USING NATIVE MONGODB GRIDFSBUCKET
let gfs;

const conn = mongoose.connection;
conn.once('open', () => {
  console.log('✅ MongoDB connection open, initializing GridFS...');
  
  // Initialize GridFS using native MongoDB GridFSBucket
  gfs = {
    notes: new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'notes' }),
    past_papers: new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'past_papers' }),
    announcements: new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'announcements' })
  };
  
  console.log('✅ All GridFSBuckets initialized with native MongoDB');
  
  // Make gfs available to all routes
  app.set('gfs', gfs);
});

// Define routes and middleware

// Medical routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/health/appointments'));
app.use('/api/leaves', require('./routes/health/doctorLeave'));
app.use('/api/doctors', require('./routes/health/doctors'));
app.use('/api/users', require('./routes/users'));

// Announcements route
app.use('/api/announcements', require('./routes/announcements/announcements'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

// ========== ADD TEST ROUTE HERE ==========
app.get('/api/test-cors', (req, res) => {
  console.log('✅ Test CORS route hit from origin:', req.headers.origin);
  res.json({ 
    message: 'CORS is working!', 
    timestamp: new Date(),
    origin: req.headers.origin 
  });
});

// Notes routes
console.log('📁 Loading notes route...');
try {
  const notesRoute = require('./routes/notes_past_papers/notes');
  app.use('/api/notes', notesRoute);
  console.log('✅ Notes route mounted successfully');
} catch (error) {
  console.error('❌ Failed to load notes route:', error.message);
}

// Past Papers routes
console.log('📁 Loading past papers route...');
try {
  const pastPapersRoute = require('./routes/notes_past_papers/past_papers');
  app.use('/api/past_papers', pastPapersRoute);
  console.log('✅ Past papers route mounted successfully');
} catch (error) {
  console.error('❌ Failed to load past papers route:', error.message);
}

// Other routes
app.use('/api/lostfound', require('./routes/confessions&polls/lostFound'));
app.use('/api/confessions', require('./routes/confessions&polls/confessions'));
app.use('/api/poll', require('./routes/confessions&polls/polls'));

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));