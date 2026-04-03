/**
 * Enrollment Model
 * 
 * Tracks user-to-course enrollment relationships.
 * Created when a user either:
 *   1. Completes a Stripe payment (checkout-success)
 *   2. Enrolls in a free course (free-enroll)
 * 
 * NOTE: This duplicates data with User.purchasedCourse[] — both are updated
 *       on enrollment. This model is the source of truth for enrollment checks.
 */

import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"                // The enrolled student
    },
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"              // The course they enrolled in
    },
    stripeSessionId:{
        type: String,
        required: false            // Only present for paid enrollments; null for free courses
    }
}, { timestamps: true })

// Creating and exporting the enrollment model
export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
