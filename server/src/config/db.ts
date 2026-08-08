import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "", {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    console.log(`[SYSTEM] MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error(`[SYSTEM FAULT] Runtime Database Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[SYSTEM] Database Connection Lost. Retrying...');
    });

  } catch (error: any) {
    console.error(`[SYSTEM FAULT] Initial MongoDB Connection Failed: ${error.message}`);
    // Only exit on initial failure in production
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

export default connectDB;
