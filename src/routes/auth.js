import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/userschema.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create a new user
    const user = new UserModel({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords (assuming password is not hashed)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 3000000 }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error); // Log error details
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/users",authMiddleware,  async (req, res) => {
  try {
    const users = await UserModel.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    // Optionally, store invalidated tokens in a database or blacklist
    res.clearCookie("token"); // If using HTTP-only cookies
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out" });
  }
});

export default router;
