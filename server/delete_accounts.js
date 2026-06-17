const { connectDb } = require('./db');
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Blog = require('./models/Blog');
const Story = require('./models/Story');
const Question = require('./models/Question');
const FriendRequest = require('./models/FriendRequest');

const targetEmails = [
  'preetikaanjana@gmail.com',
  'anjanapreetika@gmail.com',
  'preetika.23bce10789@vitbhopal.ac.in'
].map(email => email.trim().toLowerCase());

async function run() {
  await connectDb();

  for (const email of targetEmails) {
    console.log(`\nProcessing deletion for: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`No user found with email ${email}`);
      continue;
    }

    const userId = user.id;
    console.log(`Found user ${user.username} (ID: ${userId})`);

    // Cascade delete user data
    const blogRes = await Blog.deleteMany({ userId });
    console.log(`Deleted ${blogRes.deletedCount} blogs`);

    const storyRes = await Story.deleteMany({ userId });
    console.log(`Deleted ${storyRes.deletedCount} stories`);

    const questionRes = await Question.deleteMany({ userId });
    console.log(`Deleted ${questionRes.deletedCount} questions`);

    const replyRes = await Question.updateMany(
      {},
      { $pull: { replies: { userId } } }
    );
    console.log(`Removed replies from other questions:`, replyRes.modifiedCount);

    const reqRes = await FriendRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    });
    console.log(`Deleted ${reqRes.deletedCount} friend requests`);

    const userRes = await User.deleteOne({ id: userId });
    console.log(`Deleted User document:`, userRes.deletedCount);
  }

  await mongoose.disconnect();
  console.log('\nAll operations completed.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
