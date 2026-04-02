/**
 * Environment Configuration
 * 
 * Loads environment variables from .env file and exports them
 * as a centralized ENV object used throughout the application.
 * All external service credentials and app settings are managed here.
 */

import { configDotenv } from "dotenv"

configDotenv({});

export const ENV = {
    // ── Core Application ────────────────────────────────────
    MONGO_URI: process.env.MONGO_URI,           // MongoDB connection string
    PORT: process.env.PORT,                     // Server port (default: check .env)
    JWT_SECRET: process.env.JWT_SECRET,         // Secret key for signing JWT tokens
    ADMIN: process.env.ADMIN,                   // Admin user's email address (used for role checking)

    // ── Client ──────────────────────────────────────────────
    CLIENT_URL: process.env.CLIENT_URL,         // Frontend URL (used for CORS and Stripe redirects)

    // ── Cloudinary (Image & Video CDN) ──────────────────────
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,

    // ── Stripe (Payment Processing) ─────────────────────────
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

    // ── Google Gemini AI (Quiz Generation & Smart Search) ───
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
}
