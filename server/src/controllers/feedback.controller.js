 import { Feedback } from "../models/feedback.model.js";

// 1. අලුත් Feedback එකක් Save කිරීම
export const submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id; // Auth middleware එකෙන් user ID එක එනවා

        const feedback = new Feedback({
            user: userId,
            rating,
            comment
        });

        await feedback.save();
        res.status(201).json({ success: true, message: "Feedback submitted successfully!", feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Feedback Summary එක ලබා ගැනීම (අර error එක ආවේ මේක නැති නිසා)
export const getFeedbackSummary = async (req, res) => {
    try {
        // ඔක්කොම feedbacks අරගෙන, ඒක දාපු user ගේ නමත් එක්කම ගන්නවා
        const feedbacks = await Feedback.find().populate("user", "name email"); 
        
        // සාමාන්‍ය අගය (Average Rating) එකතු කරලා හොයනවා
        const totalRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

        // සාරාංශය යවනවා
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