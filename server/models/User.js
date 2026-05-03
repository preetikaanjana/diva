const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    bio: { type: String, default: '' },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    profileImage: { type: String, default: null },
    isPrivate: { type: Boolean, default: false },
    savedBlogIds: { type: [String], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
  }
);

userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
