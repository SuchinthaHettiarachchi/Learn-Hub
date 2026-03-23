 import express from "express";
import { submitFeedback, getFeedbackSummary } from "../controllers/feedback.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // මෙතන නම protectRoute විදිහට හැදුවා

const router = express.Router();

// Feedback එකක් දාන්න නම් ලොග් වෙලා ඉන්න ඕනේ
router.post("/submit", protectRoute, submitFeedback); // මෙතනත් protectRoute කියලා හැදුවා

// ඕනෑම කෙනෙක්ට Summary එක බලන්න පුළුවන්
router.get("/summary", getFeedbackSummary);

export default router;