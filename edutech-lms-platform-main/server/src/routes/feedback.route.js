import express from "express";
import { submitFeedback, getFeedbackSummary } from "../controllers/feedback.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Submit feedback (must be logged in)
router.post("/submit", protectRoute, submitFeedback);

// Get feedback summary
router.get("/summary", getFeedbackSummary);

export default router;
