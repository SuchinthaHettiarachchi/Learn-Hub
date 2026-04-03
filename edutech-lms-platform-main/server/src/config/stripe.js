import { Stripe } from "stripe";
import { ENV } from "./env.js";

/** Null when STRIPE_SECRET_KEY is unset so the server can boot for local dev. */
export const stripe = ENV.STRIPE_SECRET_KEY
  ? new Stripe(ENV.STRIPE_SECRET_KEY)
  : null;

