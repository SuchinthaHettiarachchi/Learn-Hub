 import { Feedback } from "../models/feedback.model.js";

export const submitFeedback = async (req, res) => {
    try {
        const userId = req.user._id; 
        
        // Frontend එකෙන් එවන අලුත් දත්ත ඔක්කොම ගන්නවා
        const { 
            studentId, phone, academicYear, 
            moduleCode, instructorName, platformSection, 
            contentClarity, navigationEase, featureRequest,
            hasTechIssues, techIssueDetails, deviceUsed, browser 
        } = req.body;

        const feedback = new Feedback({
            user: userId,
            studentId, phone, academicYear,
            moduleCode, instructorName, platformSection,
            contentClarity, navigationEase, featureRequest,
            hasTechIssues, techIssueDetails, deviceUsed, browser
        });

        await feedback.save();
        res.status(201).json({ success: true, message: "Comprehensive feedback submitted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFeedbackSummary = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("user", "name email"); 
        
        const totalRating = feedbacks.reduce((acc, curr) => acc + (curr.contentClarity || 0), 0);
        const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            summary: {
                totalReviews: feedbacks.length,
                averageRating: averageRating,
                feedbacks: feedbacks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};