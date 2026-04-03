/**
 * Stripe Payment Configuration
 * 
 * Initializes the Stripe SDK with the secret key for server-side payment processing.
 * Used in payment.controller.js for creating checkout sessions and verifying payments.
 * Currency: INR (Indian Rupees) — configured in the checkout session creation.
 */

import { Stripe } from "stripe";
import { ENV } from './env.js'


export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY) ;

