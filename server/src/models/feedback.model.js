import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    // ලොග් වෙලා ඉන්න කෙනාගේ ප්‍රධාන විස්තර (නම, ඊමේල් මේකෙන් ඉබේම එනවා)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // 1. User Identification (The "Who")
    studentId: { type: String, required: true },
    phone: { type: String },
    academicYear: { type: String },

    // 2. Contextual Details (The "Where")
    moduleCode: { type: String, required: true },
    instructorName: { type: String },
    platformSection: { type: String },

    // 3. Qualitative Feedback (The "What")
    contentClarity: { type: Number, required: true, min: 1, max: 5 },
    navigationEase: { type: Number, min: 1, max: 10 },
    featureRequest: { type: String },

    // 4. Technical Environment
    hasTechIssues: { type: String, enum: ['yes', 'no'], default: 'no' },
    techIssueDetails: { type: String },
    deviceUsed: { type: String },
    browser: { type: String }

}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);