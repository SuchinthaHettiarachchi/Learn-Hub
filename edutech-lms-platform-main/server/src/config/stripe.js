/**
 * Stripe Payment Configuration
 * 
 * Initializes the Stripe SDK with the secret key for server-side payment processing.
 * Used in payment.controller.js for creating checkout sessions and verifying payments.
 * Currency: INR (Indian Rupees) — configured in the checkout session creation.
 */

import { Stripe } from "stripe";
import { ENV } from "./env.js";

/** Null when STRIPE_SECRET_KEY is unset so the server can boot for local dev. */
export const stripe = ENV.STRIPE_SECRET_KEY
  ? new Stripe(ENV.STRIPE_SECRET_KEY)
  : null;

