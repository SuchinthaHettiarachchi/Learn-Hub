/**
 * Payment Routes (Stripe Integration)
 * 
 * Handles Stripe checkout flow for course purchases.
 * 
 * Protected routes (requires JWT):
 *   POST /api/payment/checkout           — Create Stripe checkout session
 * 
 * Public routes (called by Stripe redirect):
 *   POST /api/payment/checkout-success   — Verify payment and create enrollment
 *   NOTE: This route has no auth middleware. It relies on Stripe session
 *         metadata for userId/courseId. Consider adding verification.
 */

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkoutSuccess, createCheckOutSession } from "../controllers/payment.controller.js";


const paymentRoute = express.Router();

paymentRoute.post('/checkout', protectRoute, createCheckOutSession);
paymentRoute.post('/checkout-success', checkoutSuccess);


export default paymentRoute;

