import express from "express";

import UserModel from "../models/userschema.js";
import authMiddleware from "../middleware/authmiddleware.js";
import ResumeModel from '../models/Resumeschema.js'

const router = express.Router();

router.get("/users", async (req, res) => {
    try {
      const users = await UserModel.find({ role: "user" }); // Fetch users with role "user"
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });

  router.delete("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await UserModel.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  
  router.get("/resume", async (req, res) => {
      try {
        const usersWithResumes = await UserModel.aggregate([
          {
            $lookup: {
              from: "resumes",
              localField: "_id",
              foreignField: "userId",
              as: "resumes"
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              resumes: {
                $map: {
                  input: "$resumes",
                  as: "resume",
                  in: {
                    _id: "$$resume._id",
                    filename: "$$resume.filename",
                    createdAt: "$$resume.createdAt",
                    analysis: "$$resume.analysis",
                    fileType: "$$resume.fileType",
                    fileData: "$$resume.fileData"  // Include buffer here
                  }
                }
              }
            }
          }
        ]);
    
        if (!usersWithResumes.length) {
          return res.status(404).json({ message: "No users or resumes found" });
        }
    
        res.status(200).json(usersWithResumes);
      } catch (error) {
        console.error("Error in /resume:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
      }
    });
    

  router.delete('/resume/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedResume = await ResumeModel.findByIdAndDelete(id);
  
      if (!deletedResume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
  
      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (err) {
      console.error('Error deleting resume:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });// File: routes/admin.js (or your routes file)

 
  router.get("/resumes", async (req, res) => {
    try {
      const usersWithResumes = await UserModel.aggregate([
        {
          $lookup: {
            from: "resumes", // name of the collection in MongoDB
            localField: "_id",
            foreignField: "userId",
            as: "resumes"
          }
        },
        {
          $unwind: "$resumes"
        },
        {
          $project: {
            userId: "$_id",
            userName: "$name",
            resumeId: "$resumes._id",
            filename: "$resumes.filename",
            createdAt: "$resumes.createdAt",
            analysis: "$resumes.analysis",
            fileType: "$resumes.fileType",
            fileData: "$resumes.fileData"
          }
        }
      ]);
  
      if (!usersWithResumes.length) {
        return res.status(404).json({ message: "No resumes found" });
      }
  
      res.status(200).json(usersWithResumes);
    } catch (error) {
      console.error("❌ Error fetching resumes:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  
 
  

 
export default router;