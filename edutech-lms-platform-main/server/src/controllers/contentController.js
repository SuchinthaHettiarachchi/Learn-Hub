import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import Document from "../models/document.model.js";
import Flashcard from "../models/flashcard.model.js";
import GeneratedContent from "../models/generatedContent.model.js";

// ── Gemini setup ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Difficulty prompt modifiers ─────────────────────────────────────────────
const difficultyInstructions = {
  beginner:
    "Use very simple language. Avoid jargon. Explain as if to a complete beginner with no prior knowledge. Use short sentences and everyday analogies.",
  intermediate:
    "Use clear language with some technical terms (briefly explained). Assume basic familiarity with the subject.",
  advanced:
    "Use precise technical language. Assume expert-level knowledge. Be concise and include nuanced details.",
};

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded." });
  }
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Document title is required." });
  }

  try {
    const doc = new Document({
      userId: req.user?._id || req.body.userId || null,
      title: title.trim(),
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: "processing",
    });
    await doc.save();

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(fileBuffer);
      doc.extractedText = pdfData.text;
      doc.pageCount = pdfData.numpages;
      doc.status = "ready";
      await doc.save();
    } catch (parseErr) {
      doc.status = "failed";
      await doc.save();
      console.error("PDF parse error:", parseErr);
    }

    return res.status(201).json({
      message: "Document uploaded successfully.",
      document: {
        _id: doc._id,
        title: doc.title,
        originalFileName: doc.originalFileName,
        pageCount: doc.pageCount,
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Failed to upload document." });
  }
};

export const getDocuments = async (req, res) => {
  const userId = req.user?._id || req.query.userId;
  try {
    const query = userId ? { userId } : {};
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .select("-extractedText");
    return res.status(200).json({ documents });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch documents." });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    return res.status(200).json({ document: doc });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch document." });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }
    await Flashcard.deleteMany({ documentId: req.params.id });
    await GeneratedContent.deleteMany({ documentId: req.params.id });
    return res.status(200).json({ message: "Document deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete document." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// AI CONTENT GENERATION
// ══════════════════════════════════════════════════════════════════════════════

export const generateFlashcards = async (req, res) => {
  const { documentId, difficulty, userId } = req.body;

  const errors = {};
  if (!documentId) errors.documentId = "documentId is required.";
  if (!["beginner", "intermediate", "advanced"].includes(difficulty))
    errors.difficulty = "Difficulty must be beginner, intermediate, or advanced.";
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.status !== "ready" || !doc.extractedText) {
      return res.status(400).json({ message: "Document text not ready. Please wait." });
    }

    const textSnippet = doc.extractedText.slice(0, 4000);

    const prompt = `You are an expert educator. Based on the following document text, generate exactly 8 flashcards.

Difficulty level: ${difficulty}
${difficultyInstructions[difficulty]}

Each flashcard must have:
- "front": a question or term (keep it concise)
- "back": the answer or definition

Respond ONLY with a valid JSON array. No markdown, no extra text.

Format:
[
  { "front": "...", "back": "..." }
]

Document text:
"""
${textSnippet}
"""`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json|```/g, "").trim();
    const cards = JSON.parse(rawText);

    const flashcard = new Flashcard({
      userId: userId || req.user?._id || null,
      documentId,
      difficulty,
      cards,
      topic: doc.title,
    });
    await flashcard.save();

    return res.status(201).json({
      message: "Flashcards generated successfully.",
      flashcardId: flashcard._id,
      cards,
      difficulty,
      topic: doc.title,
    });
  } catch (err) {
    console.error("Flashcard generation error:", err);
    return res.status(500).json({ message: "Failed to generate flashcards." });
  }
};

export const generateSummary = async (req, res) => {
  const { documentId, difficulty, userId } = req.body;

  const errors = {};
  if (!documentId) errors.documentId = "documentId is required.";
  if (!["beginner", "intermediate", "advanced"].includes(difficulty))
    errors.difficulty = "Difficulty must be beginner, intermediate, or advanced.";
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.status !== "ready" || !doc.extractedText) {
      return res.status(400).json({ message: "Document text not ready." });
    }

    const textSnippet = doc.extractedText.slice(0, 5000);

    const prompt = `You are an expert educator. Summarize the following document.

Difficulty level: ${difficulty}
${difficultyInstructions[difficulty]}

Write a clear, well-structured summary in 3-5 paragraphs. Use plain text only — no markdown, no bullet points.

Document text:
"""
${textSnippet}
"""`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const savedContent = new GeneratedContent({
      userId: userId || req.user?._id || null,
      documentId,
      type: "summary",
      difficulty,
      content,
    });
    await savedContent.save();

    return res.status(201).json({
      message: "Summary generated successfully.",
      contentId: savedContent._id,
      content,
      difficulty,
      topic: doc.title,
    });
  } catch (err) {
    console.error("Summary generation error:", err);
    return res.status(500).json({ message: "Failed to generate summary." });
  }
};

export const explainConcept = async (req, res) => {
  const { documentId, concept, difficulty, userId } = req.body;

  const errors = {};
  if (!documentId) errors.documentId = "documentId is required.";
  if (!concept || concept.trim() === "") errors.concept = "Concept is required.";
  if (!["beginner", "intermediate", "advanced"].includes(difficulty))
    errors.difficulty = "Difficulty must be beginner, intermediate, or advanced.";
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.status !== "ready" || !doc.extractedText) {
      return res.status(400).json({ message: "Document text not ready." });
    }

    const textSnippet = doc.extractedText.slice(0, 4000);

    const prompt = `You are an expert educator. Based on the document provided, explain the concept: "${concept.trim()}".

Difficulty level: ${difficulty}
${difficultyInstructions[difficulty]}

Provide a thorough explanation in 2-4 paragraphs. Reference the document where relevant. Use plain text only.

Document text:
"""
${textSnippet}
"""`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const savedContent = new GeneratedContent({
      userId: userId || req.user?._id || null,
      documentId,
      type: "explanation",
      difficulty,
      content,
      concept: concept.trim(),
    });
    await savedContent.save();

    return res.status(201).json({
      message: "Explanation generated successfully.",
      contentId: savedContent._id,
      content,
      concept: concept.trim(),
      difficulty,
    });
  } catch (err) {
    console.error("Explanation error:", err);
    return res.status(500).json({ message: "Failed to generate explanation." });
  }
};

export const getContentHistory = async (req, res) => {
  const { documentId } = req.params;
  try {
    const [flashcards, generatedContent] = await Promise.all([
      Flashcard.find({ documentId }).sort({ createdAt: -1 }).select("-cards"),
      GeneratedContent.find({ documentId }).sort({ createdAt: -1 }).select("-content"),
    ]);
    return res.status(200).json({ flashcards, generatedContent });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch content history." });
  }
};