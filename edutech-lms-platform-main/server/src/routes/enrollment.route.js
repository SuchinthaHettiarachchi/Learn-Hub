
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { freeEnroll } from "../controllers/course.controller.js";

const router = express.Router();

// ── Stub routes (not yet implemented) ───────────────────────────────────
router.get("/", (req, res) => {
  res.json({ message: "Get all enrollments" });
});

router.post("/", (req, res) => {
  res.json({ message: "User enrolled successfully" });
});

// ── Implemented routes ──────────────────────────────────────────────────
router.post("/free-enroll", protectRoute, freeEnroll);

export default router;