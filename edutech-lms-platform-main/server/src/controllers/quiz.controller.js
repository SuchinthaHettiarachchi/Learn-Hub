import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mongoose from "mongoose";
import { Quiz } from "../models/quiz.model.js";
import { Questions } from "../models/questions.model.js";
import { Modules } from "../models/modules.model.js";
import { ENV } from "../config/env.js";

const genAi = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

// We will initialize the Groq SDK dynamically per request inside generateCustomQuiz to ensure ENV is loaded



// CHECK IF QUIZ EXISTS FOR MODULE
export const checkQuiz = async (req, res) => {
    try {
        const moduleId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(moduleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID",
            });
        }

        const quiz = await Quiz.findOne({
            userId: req.user._id,
            moduleId,
        });

        return res.status(200).json({
            success: true,
            hasQuiz: !!quiz,
            quiz: quiz || null,
        });

    } catch (error) {
        console.log("from check quiz", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




// GENERATE QUIZ USING AI
export const generateQuiz = async (req, res) => {
    try {
        const { moduleId, content } = req.body;

        if (!moduleId || !content) {
            return res.status(400).json({
                success: false,
                message: "Module ID and content are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(moduleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID",
            });
        }

        const existingQuiz = await Quiz.findOne({
            userId: req.user._id,
            moduleId,
        });

        if (existingQuiz && existingQuiz.questions.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Quiz already generated for this module",
            });
        }

        const newQuiz = await Quiz.create({
            userId: req.user._id,
            moduleId,
        });

        const prompt = `Generate exactly 10 technical multiple-choice questions for: ${content}

            Rules:
            - Each question must have exactly 4 options
            - One correct option
            - Include explanation
            - Return ONLY valid JSON (no markdown, no text)

            Format:
            {
                "questions": [
                    {
                    "question": "string",
                    "options": ["string","string","string","string"],
                    "correctOption": "string",
                    "explanation": "string"
                    }
                ]
            }`;

        const result = await model.generateContent(prompt);
        const rawText = result.response.text();

        const cleanText = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanText);
        } catch (err) {
            await Quiz.findByIdAndDelete(newQuiz._id);
            return res.status(500).json({
                success: false,
                message: "Failed to parse quiz data",
            });
        }

        const generatedQuestions = parsed.questions;

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
            await Quiz.findByIdAndDelete(newQuiz._id);
            return res.status(500).json({
                success: false,
                message: "No questions generated",
            });
        }

        const createdQuestions = [];

        for (const q of generatedQuestions) {
            const doc = await Questions.create({
                quizId: newQuiz._id,
                content: q.question,
                options: q.options,
                correctOption: q.correctOption,
                explanation: q.explanation,
            });
            createdQuestions.push(doc._id);
        }

        await Quiz.findByIdAndUpdate(newQuiz._id, {
            $push: { questions: { $each: createdQuestions } },
        });

        await Modules.findByIdAndUpdate(moduleId, {
            quiz: newQuiz._id,
        });

        return res.status(201).json({
            success: true,
            message: "Quiz generated successfully",
            quizId: newQuiz._id,
        });

    } catch (error) {
        console.log("error from generateQuiz", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




// GET QUIZ WITH QUESTIONS
export const getQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID",
            });
        }

        const quiz = await Quiz.findOne({
            _id: quizId,
            userId: req.user._id,
        }).populate("questions");

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            success: true,
            quiz,
        });

    } catch (error) {
        console.log("getQuiz error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GENERATE CUSTOM QUIZ USING GROQ FROM PDFs
export const generateCustomQuiz = async (req, res) => {
    try {
        const { files, quizName, difficulty, questionCount } = req.body;
        const numQuestions = Math.min(10, Math.max(1, parseInt(questionCount) || 5));

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ success: false, message: "PDF files are required." });
        }
        if (!quizName) {
            return res.status(400).json({ success: false, message: "Quiz name is required." });
        }

        const validDifficulties = ["beginner", "intermediate", "advanced"];
        const diff = validDifficulties.includes(difficulty) ? difficulty : "intermediate";

        // Parse PDFs
        let extractedText = "";
        let pdfError = null;
        for (const fileBase64 of files) {
            try {
                const buffer = Buffer.from(fileBase64, "base64");
                const data = await pdfParse(buffer);
                extractedText += data.text + "\n";
            } catch (err) {
                console.log("Error parsing PDF block:", err);
                pdfError = err.message || JSON.stringify(err);
            }
        }

        if (!extractedText.trim()) {
            return res.status(400).json({ 
                 success: false, 
                 message: pdfError 
                    ? `PDF Parsing failed with error: ${pdfError}` 
                    : "The uploaded PDF appears to contain no readable text (it might be a scanned image or empty). Please upload a text-based PDF." 
            });
        }

        if (!ENV.GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: "GROQ_API_KEY is not configured on the server." });
        }
        
        const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

        // Prepare Prompt based on difficulty
        const hintsInstruction = diff === "beginner" ? '"hint": "A helpful clue",' : "";
        const conceptInstruction = '"concept": "Core concept being tested"';
        const userPrompt = `
Generate ${numQuestions} multiple-choice quiz questions based on the text provided below.
Difficulty: ${diff.toUpperCase()}. 
${diff === "advanced" ? "Push conceptual depth and critical thinking. No hints." : diff === "intermediate" ? "Require deeper understanding. No hints." : "Keep language simple and approachable. Include helpful hints."}

Text:
${extractedText.slice(0, 15000)} // Limiting to prevent token explosion if huge PDF

Return ONLY valid JSON, no markdown fences, no extra text:
{
  "topic": "A summarized 1-3 word topic representing the text",
  "questions": [
    {
      "question": "Question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctOption": "0", // Note: use string representation of the index like "0", "1", "2", "3" to match our existing questions model where correctOption is a string. Or you can output the exact string text of the correct option. Wait, looking at generateQuiz, it output 'string'. Let's enforce outputting the literal matching string or the index. We will output the EXACT correct option string here:
      "correctOptionText": "A) ...", 
      "explanation": "Why this answer is correct and others are not",
      ${hintsInstruction}
      ${conceptInstruction}
    }
  ]
}
        `;

        // Request Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: userPrompt }],
            model: "llama-3.1-8b-instant",  // Higher free-tier limits than 70b
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const rawText = chatCompletion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());

        if (!parsed.questions || parsed.questions.length === 0) {
            return res.status(500).json({ success: false, message: "AI failed to generate questions." });
        }

        // Save to DB
        const newQuiz = await Quiz.create({
            userId: req.user._id,
            title: quizName,
            topic: parsed.topic || "General",
            difficulty: diff,
        });

        const createdQuestions = [];
        for (const q of parsed.questions) {
            // Find correctIndex based on correctOptionText if available, otherwise assume 'correct' is an index
            let correctStr = q.correctOptionText || q.correctOption || q.options[q.correct || 0];
            
            // To be robust for frontend that expects correct as a number index:
            // But Questions schema expects correctOption as String. We'll store both.
            // Client expects 'correct' as number index in its 'confirmAnswer' logic.
            const correctIndex = q.options.findIndex(opt => opt === correctStr);
            const verifiedCorrectOption = correctIndex !== -1 ? correctIndex : (parseInt(q.correct) || 0);

            const doc = await Questions.create({
                quizId: newQuiz._id,
                content: q.question,
                options: q.options,
                // store the exact string
                correctOption: q.options[verifiedCorrectOption],
                explanation: q.explanation,
                hint: q.hint,
                concept: q.concept
            });
            createdQuestions.push(doc._id);
        }

        await Quiz.findByIdAndUpdate(newQuiz._id, {
            $push: { questions: { $each: createdQuestions } },
        });

        // The frontend expects the format specifically tailored to it:
        const quizObj = {
            id: newQuiz._id,
            topic: parsed.topic || "General",
            questions: parsed.questions.map((q, i) => {
                let verifiedCorrectOption = parseInt(q.correct);
                if (isNaN(verifiedCorrectOption)) {
                   verifiedCorrectOption = q.options.findIndex(opt => opt === (q.correctOptionText || q.correctOption));
                }
                if (verifiedCorrectOption === -1) verifiedCorrectOption = 0;

                return {
                    id: createdQuestions[i],
                    question: q.question,
                    options: q.options,
                    correct: verifiedCorrectOption,
                    explanation: q.explanation,
                    hint: q.hint,
                    concept: q.concept
                };
            })
        };

        return res.status(200).json(quizObj); // matching frontend's expected format

    } catch (error) {
        console.log("generateCustomQuiz error", error);

        // Surface specific Groq API errors clearly
        const groqErr = error?.error?.error || error?.error || {};
        if (groqErr.code === "rate_limit_exceeded") {
            return res.status(429).json({
                success: false,
                message: "Groq API rate limit reached. You've used up your free tier quota. Please wait a minute and try again, or upgrade your Groq plan at console.groq.com."
            });
        }
        if (error?.status === 401 || groqErr.code === "invalid_api_key") {
            return res.status(401).json({
                success: false,
                message: "Invalid Groq API key. Please check your GROQ_API_KEY in the server .env file."
            });
        }

        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// GET MY CUSTOM QUIZZES (quiz history)
export const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            title: { $exists: true, $ne: null }, // Only custom quizzes (not module quizzes)
        })
        .populate("questions")
        .sort({ createdAt: -1 });

        const formatted = quizzes.map(q => ({
            id: q._id,
            title: q.title,
            topic: q.topic || "General",
            difficulty: q.difficulty || "intermediate",
            questionCount: q.questions.length,
            score: q.score,
            totalQuestions: q.totalQuestions,
            isCompleted: q.isCompleted,
            createdAt: q.createdAt,
            questions: q.questions.map((question, i) => {
                const correctIndex = question.options.findIndex(
                    opt => opt === question.correctOption
                );
                return {
                    id: question._id,
                    question: question.content,
                    options: question.options,
                    correct: correctIndex !== -1 ? correctIndex : 0,
                    explanation: question.explanation,
                    hint: question.hint,
                    concept: question.concept,
                };
            }),
        }));

        return res.status(200).json({ success: true, quizzes: formatted });
    } catch (error) {
        console.log("getMyQuizzes error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE QUIZ RESULT (after finishing)
export const updateQuizResult = async (req, res) => {
    try {
        const { quizId, score, totalQuestions } = req.body;
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }

        const quiz = await Quiz.findOneAndUpdate(
            { _id: quizId, userId: req.user._id },
            { 
               score, 
               totalQuestions, 
               isCompleted: true 
            },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        return res.status(200).json({ success: true, quiz });
    } catch (error) {
        console.log("updateQuizResult error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
