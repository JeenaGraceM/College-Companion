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

const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/dummy',require('./routes/dummyRoutes_testing'));

// Define routes and middleware
app.use('/api/appointments', require('./routes/health/appointments'));
app.use('/api/leaves', require('./routes/health/doctorLeave'));
app.use('/api/medicalstaff', require('./routes/health/medicalStaff'));
app.use('/api/users', require('./routes/users'));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
