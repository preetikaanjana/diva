const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    fromUserId: { type: String, required: true, index: true },
    toUserId: { type: String, required: true, index: true },
    status: { type: String, required: true },
    createdAt: { type: String, required: true },
    acceptedAt: { type: String, default: null },
    declinedAt: { type: String, default: null }
  },
  { _id: false }
);

friendRequestSchema.index({ fromUserId: 1, toUserId: 1 });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
