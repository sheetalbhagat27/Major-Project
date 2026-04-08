// ============================================
// Database Configuration
// Handles MongoDB connection using Mongoose
// ============================================

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection string from environment variables.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
