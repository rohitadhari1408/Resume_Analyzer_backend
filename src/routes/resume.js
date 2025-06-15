import express from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ResumeModel from "../models/Resumeschema.js";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import extractTextFromResume from "../utils/extractTextFromResume.js"; // Import updated function

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const geminiModel = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

router.post("/upload/:userId", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    // ✅ Extract text from resume
    const extractedText = await extractTextFromResume(fileBuffer, fileType);
    if (!extractedText) {
      return res.status(400).json({ error: "Unsupported file format or extraction failed" });
    }

    // 🔹 Google Gemini Resume Analysis
    let geminiAnalysis = null;
    try {
      const geminiPrompt = `
        Analyze the following resume and return a JSON output **without explanations**.
        
        **Strictly return only valid JSON. Do not include any extra text.**
        
        **JSON Format:**
        {
          "grammar_score": Number,
          "keywords_matched": Number,
          "ats_score": Number,
          "spelling_mistakes": Number,
          "passive_voice_usage": Number,
          "readability_score": Number,
          "word_count": Number,
          "section_scores": {
            "experience": Number,
            "education": Number,
            "skills": Number
          },
          "improvement_suggestions": {
            "grammar": String,
            "keywords": String,
            "ATS": String,
            "spelling": String,
            "passive_voice": String,
            "readability": String,
            "sections": {
              "experience": String,
              "education": String,
              "skills": String
            }
          }
        }

        **Resume Content:**
        ${extractedText}
      `;

      const geminiResponse = await geminiModel.generateContent(geminiPrompt);

      if (!geminiResponse || !geminiResponse.response) {
        return res.status(500).json({ error: "No valid response from Gemini API" });
      }

      let geminiText = geminiResponse.response.text();
      if (!geminiText) {
        return res.status(500).json({ error: "Gemini API returned an empty response" });
      }

      // ✅ Remove unwanted formatting like ```json and ```
      geminiText = geminiText.replace(/```json|```/g, "").trim();

      // ✅ Extract valid JSON using regex
      const jsonStart = geminiText.indexOf("{");
      const jsonEnd = geminiText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        geminiText = geminiText.substring(jsonStart, jsonEnd + 1).trim();
      } else {
        return res.status(500).json({ error: "Invalid JSON format from Gemini API" });
      }
          
      // ✅ Parse JSON safely
      try {
        geminiAnalysis = JSON.parse(geminiText);
      
      } catch (error) {
        console.error("❌ JSON Parsing Error:", error);
        return res.status(500).json({ error: "Invalid JSON response from Gemini API" });
      }

      // ✅ Validate if Gemini Analysis contains required fields
      if (
        !geminiAnalysis ||
        typeof geminiAnalysis !== "object" ||
        !geminiAnalysis.ats_score ||
        !geminiAnalysis.grammar_score ||
        !geminiAnalysis.section_scores ||
        !geminiAnalysis.improvement_suggestions
      ) {
        throw new Error("Invalid Gemini Analysis Data");
      }
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      return res.status(500).json({ error: "Failed to analyze resume", details: error.message });
    }

    // ✅ Store Resume and Analysis in MongoDB
    const newResume = new ResumeModel({
      userId: new mongoose.Types.ObjectId(userId),
      filename: req.file.originalname,
      fileData: fileBuffer,
      fileType: fileType,
      extractedText: extractedText,
      analysis: geminiAnalysis, // Stores valid parsed JSON
    });

    await newResume.save();

    res.status(201).json({
      message: "Resume uploaded & analyzed!",
      resume: newResume,
      improvements: geminiAnalysis.improvement_suggestions,
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid resume format", details: error.message });
    }

    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

// ✅ Fetch Resume by User ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    const resumes = await ResumeModel.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 });

    res.status(200).json(resumes);
  } catch (error) {
    console.error("❌ Error fetching resume history:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
