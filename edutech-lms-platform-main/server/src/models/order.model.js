/**
 * Order Model
 * 
 * Records completed Stripe payment transactions.
 * Created/updated in checkout-success after payment verification.
 * Uses upsert with stripeSessionId to prevent duplicate order records.
 * 
 * Also used by:
 *   - Analytics aggregation (revenue calculations, enrollment counts)
 *   - Admin dashboard (daily/monthly revenue trends, top courses)
 */

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true             // The user who made the purchase
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"              // The purchased course
    },
    totalAmount: {
        type: Number,
        required: true             // Amount paid in INR (converted from Stripe's paisa)
    },
    stripeSessionId: {
        type: String,
        unique: true               // Ensures idempotent order creation on payment callback
    }
}, { timestamps: true })

// creating and exporting the Order model
export const Order = mongoose.model("Order", orderSchema);
