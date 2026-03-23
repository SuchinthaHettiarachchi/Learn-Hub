import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    // Feedback එක දෙන කෙනා (User)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    // තරු කීයක් දෙනවද කියලා (1 ඉඳන් 5 වෙනකන්)
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    // දාන comment එක
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true }); // save වෙන වෙලාව ඉබේම වැටෙන්න

export const Feedback = mongoose.model("Feedback", feedbackSchema);