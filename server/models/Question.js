const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: String, default: '' },
    userId: { type: String, default: '' },
    createdAt: { type: String, required: true }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    details: { type: String, default: '' },
    author: { type: String, default: '' },
    userId: { type: String, default: '' },
    replies: { type: [replySchema], default: [] },
    likes: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
  },
  { _id: false }
);

module.exports = mongoose.model('Question', questionSchema);
