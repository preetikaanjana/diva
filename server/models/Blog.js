const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    author: { type: String, default: '' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: null },
    isDraft: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    likedUserIds: { type: [String], default: [] }
  },
  { _id: false }
);

module.exports = mongoose.model('Blog', blogSchema);
