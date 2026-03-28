/**
 * Document Model
 * 
 * Represents an uploaded PDF document used for AI content generation.
 * PDFs are stored locally on the server (server/uploads/) and text is
 * extracted using pdf-parse for use by Groq/Llama AI.
 * 
 * Lifecycle: processing → ready | failed
 *   - "processing": PDF uploaded, text extraction in progress
 *   - "ready": Text extracted successfully, AI features available
 *   - "failed": Text extraction failed
 * 
 * Relationships:
 *   - userId → User who uploaded the document
 *   - Referenced by Flashcard and GeneratedContent models
 */
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",                // Document owner
    },
    title: {
      type: String,
      required: true,
      trim: true,                 // User-provided document title
    },
    originalFileName: {
      type: String,
      required: true,             // Original filename as uploaded by the user
    },
    filePath: {
      type: String,
      required: true,             // Absolute path on server disk (server/uploads/)
    },
    extractedText: {
      type: String,
      default: "",                // Full text extracted from PDF via pdf-parse
    },
    pageCount: {
      type: Number,
      default: 0,                 // Number of pages in the PDF
    },
    fileSize: {
      type: Number,
      default: 0,                 // File size in bytes
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],   // Document processing lifecycle
      default: "processing",
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;

