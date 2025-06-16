import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from './src/routes/user.js';
import ResumeRoutes from './src/routes/resume.js';
import AdminRoutes from './src/routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5001;
// app.use(cors());

// ✅ Enable CORS for your frontend domain(s)
// app.use(cors({
//   origin: ['https://resume-analyzer-frontend-red.vercel.app/'], // 🔁 Replace with your frontend URL
//   credentials: true
// }));

const allowedOrigins = [
  "https://resume-analyzer-frontend-red.vercel.app", // ✅ Your deployed frontend
  "http://localhost:5173",
  "https://resume-analyzer-frontend-git-main-rohitadharis-projects.vercel.app/",
  "https://resume-analyzer-frontend-ckud5n10z-rohitadharis-projects.vercel.app/" // ✅ For local dev (optional)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/resume', ResumeRoutes);
app.use('/admin', AdminRoutes);

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
