const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Load environment variables from .env file in parent directory

const app = express();
const port = process.env.PORT || 5000; // Use port 5000 or environment variable

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse incoming JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import forum routes
const forumRoutes = require('./routes/forum');

// Basic test endpoint
app.get('/', (req, res) => {
  res.send('Devi server is running!');
});

// Use forum routes for /api/forum path
app.use('/api/forum', forumRoutes);

// TODO: Implement Forum routes (create, read, update, delete posts and comments)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 