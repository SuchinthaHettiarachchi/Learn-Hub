import { Feedback } from "../models/feedback.model.js";

export const submitFeedback = async (req, res) => {
    try {
        const userId = req.user._id; 
        
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
        const feedbacks = await Feedback.find()
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });

        // Content clarity average (1-5)
        const totalClarity = feedbacks.reduce((acc, curr) => acc + (curr.contentClarity || 0), 0);
        const averageRating = feedbacks.length > 0 ? (totalClarity / feedbacks.length).toFixed(1) : 0;

        // Navigation ease average (1-10)
        const navFeedbacks = feedbacks.filter(f => f.navigationEase != null);
        const avgNavigationEase = navFeedbacks.length > 0
            ? (navFeedbacks.reduce((acc, curr) => acc + curr.navigationEase, 0) / navFeedbacks.length).toFixed(1)
            : 0;

        // Tech issue rate (%)
        const techIssueCount = feedbacks.filter(f => f.hasTechIssues === 'yes').length;
        const techIssueRate = feedbacks.length > 0
            ? ((techIssueCount / feedbacks.length) * 100).toFixed(1)
            : 0;

        // Top feature requests (unique, non-empty, max 10)
        const topFeatureRequests = [
            ...new Set(
                feedbacks
                    .map(f => f.featureRequest?.trim())
                    .filter(Boolean)
            )
        ].slice(0, 10);

        res.status(200).json({
            success: true,
            summary: {
                totalReviews: feedbacks.length,
                averageRating,
                avgNavigationEase,
                techIssueRate,
                techIssueCount,
                topFeatureRequests,
                feedbacks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
