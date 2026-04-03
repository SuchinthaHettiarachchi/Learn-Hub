/**
 * Course Model
 * 
 * Represents a course created by an admin user.
 * Supports both free (amount = 0) and paid courses via Stripe.
 * Courses can be hidden from public listing without deletion.
 * 
 * Relationships:
 *   - userId → User who created the course (admin)
 *   - modules[] → Modules (video lessons) belonging to this course
 * 
 * Media:
 *   - thumbnail → Cloudinary image URL
 *   - pdfFile → Cloudinary raw file URL (course material)
 */

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"                // The admin who created this course
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,              // Cloudinary URL for the course cover image
    },
    amount: {
        type: Number,
        default: 0                 // 0 = free course; > 0 = paid (in INR)
    },
    pdfFile: {
        type: String,              // Cloudinary URL for downloadable PDF material
    },
    modules: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Modules"         // Video lesson modules within this course
        }
    ],
    isHidden: {
        type: Boolean,
        default: false             // When true, course is hidden from user-facing listings
    },
}, { timestamps: true })

// creating and exporting the course model
export const Course = mongoose.model("Course", courseSchema);
