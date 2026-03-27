import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { freeEnroll } from "../controllers/course.controller.js";

const router = express.Router();

// GET all enrollments
router.get("/", (req, res) => {
  res.json({ message: "Get all enrollments" });
});

// POST enroll user
router.post("/", (req, res) => {
  res.json({ message: "User enrolled successfully" });
});

router.post("/free-enroll", protectRoute, freeEnroll);

export default router;