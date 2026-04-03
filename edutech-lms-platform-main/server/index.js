/**
 * Server Entry Point
 * 
 * Initializes the Express 5 application with:
 *   1. Middleware: JSON parsing, cookie parser, URL encoding, CORS
 *   2. API routes: 9 route groups mounted under /api
 *   3. Database: MongoDB connection via Mongoose
 * 
 * Startup flow:
 *   connectDB() → app.listen() → Server running
 *   If DB connection fails → process.exit(1)
 * 
 * CORS: In development, allows any localhost origin.
 *        In production, only allows ENV.CLIENT_URL.
 */
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { ENV } from "./src/config/env.js";
import connectDB from "./src/config/db.js";

import userRoute from "./src/routes/user.route.js";
import courseRoute from "./src/routes/course.route.js";
import moduleRoute from "./src/routes/module.route.js";
import quizRoute from "./src/routes/quiz.route.js";
import commentRoute from "./src/routes/comment.route.js";
import paymentRoute from "./src/routes/payment.route.js";
import analyticRoute from "./src/routes/analytic.route.js";
import contentRoutes from "./src/routes/contentRoutes.js";
import enrollmentRoute from "./src/routes/enrollment.route.js";

// setting up the server and using middleware
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}));

// routing the api
app.use("/api", userRoute);
app.use("/api", courseRoute);
app.use("/api", moduleRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/comment", commentRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/analytic", analyticRoute);
app.use("/api/content", contentRoutes);
app.use("/api/enrollment", enrollmentRoute);

// connect db then starting server
connectDB()
    .then(() => {
        // starting server after db is connected 
        app.listen(ENV.PORT, () => {
            console.log(`Server running on port ${ENV.PORT}`);
        });
    })
    .catch(err => {
        console.error({ message: "Error connecting to the database", error: err });
        process.exit(1);
    });
