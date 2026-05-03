const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !String(uri).trim()) {
    console.error(
      'Missing MONGODB_URI. Add to server/.env, e.g.\n' +
        'MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/diva?retryWrites=true&w=majority'
    );
    process.exit(1);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

module.exports = { connectDb };
