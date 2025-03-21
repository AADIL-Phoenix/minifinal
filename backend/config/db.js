const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use local MongoDB connection since MongoDB Community Server is installed
    const conn = await mongoose.connect('mongodb://localhost:27017/bookclub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
