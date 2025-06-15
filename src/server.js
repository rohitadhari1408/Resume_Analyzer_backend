import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; 
import authRoutes from "./routes/auth.js"; 
import userRoutes from './routes/user.js';
import ResumeRoutes from './routes/resume.js';
import AdminRoutes from './routes/admin.js'

const app = express();
app.use(cors());
const PORT = process.env.PORT ||5001;

// Middleware
app.use(express.json());
app.use(cors());

connectDB(); // ✅ Ensure this is called


// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use auth routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes); 

app.use('/resume', ResumeRoutes); 
app.use('/admin', AdminRoutes); 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
