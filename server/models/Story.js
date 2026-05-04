const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    image: { type: String, required: true },
    timestamp: { type: String, required: true },
    createdAt: { type: String, required: true }
  }
);

module.exports = mongoose.model('Story', storySchema);
