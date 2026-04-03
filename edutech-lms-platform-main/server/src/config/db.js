/**
 * Database Connection Module
 * 
 * Establishes a connection to MongoDB using Mongoose.
 * Called once at server startup (index.js) before the Express server begins listening.
 * Throws an error if the connection fails, which triggers process.exit(1) in index.js.
 */

import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log("Database connected successfully");

    } catch (error) {
        console.log("error from connectDB ", error.message);
        throw error; // Throw error instead of using res (which doesn't exist here)
    }
}

export default connectDB;

