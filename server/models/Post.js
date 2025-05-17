const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String, // Assuming author will be stored as a string (e.g., username) for now
    required: true,
  },
  tags: [
    { // Array of strings for tags
      type: String,
      trim: true,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // We will add comments and reactions as subdocuments or references later
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 