/**
 * Module Model
 * 
 * Represents a single lesson/module within a course.
 * Each module contains a video (stored on Cloudinary), and can have
 * an associated quiz and user comments.
 * 
 * Relationships:
 *   - courseId → Parent Course this module belongs to
 *   - quiz → Optional Quiz generated for this module (one per module per user)
 *   - comments[] → User-posted comments/discussions on this module
 */

import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"              // Parent course reference
    },
    video:{
        type: String,
        required: true             // Cloudinary video URL (uploaded via CloudinaryStorage)
    },
    title:{
        type: String,
        required: true
    },
    quiz:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"                // AI-generated quiz for this module (optional)
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"         // User discussion comments
        }
    ],
}, { timestamps: true })

// creating and exporting the Modules model
export const Modules = mongoose.model("Modules", moduleSchema);
