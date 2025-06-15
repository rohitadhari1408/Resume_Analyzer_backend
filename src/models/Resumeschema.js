import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileData: { type: Buffer, required: true }, // Store the actual file as a Buffer
  fileType: { type: String, required: true }, 
  analysis: {
    grammar_score: { type: Number, default: 0 },
    keywords_matched: { type: Number, default: 0 },
    ats_score: { type: Number, default: 0 },
    spelling_mistakes: { type: Number, default: 0 },
    passive_voice_usage: { type: Number, default: 0 },
    readability_score: { type: Number, default: 0 },
    word_count: { type: Number, default: 0 },
    section_scores: {
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ResumeModel = mongoose.model("Resume", ResumeSchema);
export default ResumeModel;
