import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const mongoURI = "mongodb+srv://SjtuPEgLLQ3lWo3f:rohit1408@resumeai.lwq8l.mongodb.net/ResumeAi?retryWrites=true&w=majority&appName=ResumeAi; // Update as needed";

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
