const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flaming-cliffs';
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('💡 To use MongoDB, please:');
    console.log('1. Install MongoDB locally: brew install mongodb-community');
    console.log('2. Start MongoDB: brew services start mongodb-community');
    console.log('3. Or use MongoDB Atlas cloud service');
    console.log('4. Update MONGODB_URI in .env file');
    throw error;
  }
};

module.exports = connectDB;
