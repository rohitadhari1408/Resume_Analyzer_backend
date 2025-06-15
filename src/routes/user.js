import express, { Router } from "express";

import UserModel from "../models/userschema.js";



const router = express.Router();

router.get("/details/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find user by ID in MongoDB
      const user = await UserModel.findById(id); // Excluding password for security
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
 
  
export default router;