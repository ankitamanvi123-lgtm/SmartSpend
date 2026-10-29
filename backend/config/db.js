const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Trying to connect to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.log("MongoDB connection failed!");
    console.log(error.message);
  }
};

module.exports = connectDB;