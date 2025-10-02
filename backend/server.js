const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet()); // Adds security headers
app.use(express.json());
app.use(morgan('dev')); // Logs HTTP requests

// Debug logs for environment variables
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Define routes and middleware

// Medical routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/health/appointments'));
app.use('/api/leaves', require('./routes/health/doctorLeave'));
app.use('/api/doctors', require('./routes/health/doctors'));
app.use('/api/users', require('./routes/users'));
// app.use('/api/medicalstaff', require('./routes/health/medicalStaff'));

// Announcements route
app.use('/api/announcements', require('./routes/announcements/announcements'));

// Notes routes
app.use('/api/notes', require('./routes/notes')); // Make sure './routes/notes' exists

// Past Papers routes
app.use('/api/past_papers', require('./routes/past_papers')); // Make sure './routes/past_papers' exists

// Root route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
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
