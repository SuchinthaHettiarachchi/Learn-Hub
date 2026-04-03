/**
 * User Model
 * 
 * Represents a platform user (student or admin).
 * Authentication: email/password with bcrypt hashing.
 * Admin detection: compared against ENV.ADMIN email in auth middleware.
 * 
 * Relationships:
 *   - purchasedCourse[] → references Course documents the user has enrolled in
 * 
 * NOTE: The 'aadmin' field appears to be a typo. Controllers reference 'user.admin'
 *       which doesn't match this schema field. Consider renaming to 'admin'.
 */

import mongoose from "mongoose";

// creating a user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true               // Enforces one account per email
    },
    password: {
        type: String,
        required: true             // Stored as bcrypt hash (salt rounds: 10)
    },
    admin: {
        type: Boolean,
        default: false             // True for the admin user
    },
    isActive: {
        type: Boolean,
        default: true              // False = user is blocked from platform
    },
    purchasedCourse: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"          // Duplicates Enrollment collection — kept for quick lookups
        }
    ],
    profilePhoto: {
        type: String,
        default: "https://www.pngmart.com/files/23/Profile-PNG-Photo.png"  // Fallback avatar
    },

}, { timestamps: true })           // Adds createdAt and updatedAt fields automatically

// creating and exporting the user model
export const User = mongoose.model("User", userSchema);
