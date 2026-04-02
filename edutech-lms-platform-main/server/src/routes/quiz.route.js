import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkQuiz, generateQuiz, getQuiz, generateCustomQuiz, getMyQuizzes, updateQuizResult } from "../controllers/quiz.controller.js";


const quizRoute = express.Router()

quizRoute.get("/checkQuiz/:id", protectRoute, checkQuiz);
quizRoute.get("/myQuizzes", protectRoute, getMyQuizzes);
quizRoute.post("/updateResult", protectRoute, updateQuizResult);
quizRoute.post("/generateQuiz", protectRoute, generateQuiz);
quizRoute.get('/getQuiz/:id', protectRoute, getQuiz);
quizRoute.post("/generateCustom", protectRoute, generateCustomQuiz);

export default quizRoute;
