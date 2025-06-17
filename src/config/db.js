import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { configDotenv } from "dotenv";

configDotenv();

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {

    });
    console.log("✅ MongoDB Connected");

    // Create GridFSBucket globally
    global.gfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: "resumes",
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
