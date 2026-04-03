/**
 * AI Content Generation Routes (Groq / Llama 3.3 70B)
 * 
 * Manages PDF document uploads and AI-powered content generation.
 * 
 * ⚠️  WARNING: None of these routes have authentication middleware.
 *     Any user (even unauthenticated) can access these endpoints.
 *     Consider adding protectRoute middleware for production use.
 * 
 * Document Management:
 *   POST   /api/content/upload              — Upload PDF (10MB max), extract text
 *   GET    /api/content/documents           — List all documents
 *   GET    /api/content/documents/:id       — Get single document with text
 *   DELETE /api/content/documents/:id       — Delete document + related AI content
 * 
 * AI Generation:
 *   POST   /api/content/flashcards          — Generate 8 flashcards from document
 *   POST   /api/content/summary             — Generate 3-5 paragraph summary
 *   POST   /api/content/explain             — Explain a specific concept
 *   GET    /api/content/history/:documentId — Get generation history for document
 */
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  generateFlashcards,
  generateSummary,
  explainConcept,
  getContentHistory,
} from "../controllers/contentController.js";

const router = express.Router();

// ── Local disk storage setup ────────────────────────────────────────────────
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists (prevents ENOENT errors on fresh clones)
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // server/uploads/
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

// ── Document Management Routes ──────────────────────────────────────────────
router.post("/upload", upload.single("pdf"), uploadDocument);      // POST   /api/content/upload
router.get("/documents", getDocuments);                            // GET    /api/content/documents
router.get("/documents/:id", getDocumentById);                     // GET    /api/content/documents/:id
router.delete("/documents/:id", deleteDocument);                   // DELETE /api/content/documents/:id

// ── AI Generation Routes ────────────────────────────────────────────────────
router.post("/flashcards", generateFlashcards);                    // POST   /api/content/flashcards
router.post("/summary", generateSummary);                          // POST   /api/content/summary
router.post("/explain", explainConcept);                           // POST   /api/content/explain
router.get("/history/:documentId", getContentHistory);             // GET    /api/content/history/:documentId

// ── Multer error handler ────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Only PDF files are allowed.") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
