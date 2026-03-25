import express from "express";

const router = express.Router();

// GET all enrollments
router.get("/", (req, res) => {
  res.json({ message: "Get all enrollments" });
});

// POST enroll user
router.post("/", (req, res) => {
  res.json({ message: "User enrolled successfully" });
});

export default router;