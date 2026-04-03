/**
 * GeneratedContent Model
 * 
 * Stores AI-generated text content (summaries and concept explanations)
 * created from uploaded PDF documents using Groq (Llama 3.3 70B).
 * Each record is tied to a specific document, difficulty level, and content type.
 * 
 * Types:
 *   - "summary" — Full document summary (3-5 paragraphs)
 *   - "explanation" — Focused explanation of a specific concept
 * 
 * Relationships:
 *   - userId → User who requested the content
 *   - documentId → Source PDF document
 */
import mongoose from "mongoose";

const generatedContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    type: {
      type: String,
      enum: ["summary", "explanation"],        // Type of generated content
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],  // Controls AI language complexity
      required: true,
    },
    content: {
      type: String,
      required: true,                          // The actual AI-generated text
    },
    concept: {
      type: String,
      default: "",                             // Only used when type is "explanation"
    },
  },
  { timestamps: true }
);

const GeneratedContent = mongoose.model("GeneratedContent", generatedContentSchema);
export default GeneratedContent;

