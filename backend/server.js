require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const authenticateUser = require('./middleware/authMiddleware');
const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api/protected', authenticateUser, protectedRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Default Route
app.get('/', (req, res) => {
    res.send('Healthcare IAM Backend is Running!!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
