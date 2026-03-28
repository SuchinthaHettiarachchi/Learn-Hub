/**
 * Comment Model
 * 
 * Represents a user-posted comment on a course module.
 * Comments support discussion and Q&A within individual video lessons.
 * Populated with user info (fullName, email) when retrieved.
 * 
 * Relationships:
 *   - userId → User who posted the comment
 *   - moduleId → Module the comment belongs to
 */

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"                // Comment author
    },
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modules"             // Module this comment is attached to
    },
    comment:{
        type: String,
        required: true             // Comment text content (cannot be empty)
    },
}, { timestamps: true })

// Creating and exporting the Comment Model
export const Comment = mongoose.model("Comment", commentSchema)
