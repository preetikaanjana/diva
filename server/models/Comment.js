const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String, // Assuming author will be stored as a string (e.g., username) for now
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: Schema.Types.ObjectId, // Reference to the Post model
    ref: 'Post',
    required: true,
  },
  // We can add replies or likes to comments later
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 