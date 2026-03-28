/**
 * Quiz Routes (AI-Powered via Google Gemini)
 * 
 * All routes require JWT authentication.
 * 
 *   GET  /api/quiz/checkQuiz/:id    — Check if user has a quiz for a module
 *   POST /api/quiz/generateQuiz     — Generate 10 MCQ questions using Gemini AI
 *   GET  /api/quiz/getQuiz/:id      — Get quiz with all populated questions
 */

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkQuiz, generateQuiz, getQuiz } from "../controllers/quiz.controller.js";


const quizRoute = express.Router()

quizRoute.get("/checkQuiz/:id", protectRoute, checkQuiz);
quizRoute.post("/generateQuiz", protectRoute, generateQuiz);
quizRoute.get('/getQuiz/:id', protectRoute, getQuiz);


export default quizRoute;

