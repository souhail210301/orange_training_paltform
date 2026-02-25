const mongoose = require('mongoose');
// dotenv is loaded in server.js before this module is required
const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected !`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;