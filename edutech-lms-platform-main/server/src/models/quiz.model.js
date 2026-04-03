import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
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
    },
    questions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Questions"
        }
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    pdfNames: [String],
    userAnswers: [
        {
            questionId: mongoose.Schema.Types.ObjectId,
            selected: Number,
            isCorrect: Boolean
        }
    ],
}, { timestamps: true })

// made the Quiz model and exported it
export const Quiz = mongoose.model("Quiz", quizSchema);
