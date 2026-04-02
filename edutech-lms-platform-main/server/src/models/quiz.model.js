<<<<<<< HEAD
/**
 * Quiz Model
 * 
 * Represents a per-user, per-module quiz instance.
 * Quizzes are generated on-demand using Google Gemini AI
 * based on the module content. Each quiz contains 10 MCQ questions.
 * 
 * Relationships:
 *   - userId → User who generated/owns this quiz
 *   - moduleId → Module this quiz is based on
 *   - questions[] → Question documents containing the actual MCQs
 */

=======
>>>>>>> Chanuka
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
        ref: "User"                // Quiz owner (each user gets their own quiz per module)
    },
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modules"             // The module this quiz was generated from
=======
        ref: "User",
        required: true
    },
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modules",
        // moduleId is optional for custom generated quizzes
    },
    title: {
        type: String,
    },
    topic: {
        type: String,
    },
    difficulty: {
        type: String,
>>>>>>> Chanuka
    },
    questions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Questions"       // Array of 10 AI-generated MCQ questions
        }
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true })

// made the Quiz model and exported it
export const Quiz = mongoose.model("Quiz", quizSchema);
