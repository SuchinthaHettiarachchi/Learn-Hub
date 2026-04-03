import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // User Identification
    studentId: { type: String, required: true },
    phone: { type: String },
    academicYear: { type: String },

    // Contextual Details
    moduleCode: { type: String, required: true },
    instructorName: { type: String },
    platformSection: { type: String },

    // Qualitative Feedback
    contentClarity: { type: Number, required: true, min: 1, max: 5 },
    navigationEase: { type: Number, min: 1, max: 10 },
    featureRequest: { type: String },

    // Technical Environment
    hasTechIssues: { type: String, enum: ['yes', 'no'], default: 'no' },
    techIssueDetails: { type: String },
    deviceUsed: { type: String },
    browser: { type: String }

}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
