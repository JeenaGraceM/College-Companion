const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config(); // Load .env first

const app = express();

app.use(cors());
app.use(express.json());

// Debug logs to confirm env vars
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Connect to MongoDB
connectDB();

// Login Signup routes
app.use('/api/auth', require('./routes/authRoutes')); 

// Medical routes
app.use('/api/appointments', require('./routes/health/appointments'));
app.use('/api/leaves', require('./routes/health/doctorLeave'));
app.use('/api/doctors', require('./routes/health/doctors'));
app.use('/api/users', require('./routes/users'));
//app.use('/api/medicalstaff', require('./routes/health/medicalStaff'));

// Root route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));