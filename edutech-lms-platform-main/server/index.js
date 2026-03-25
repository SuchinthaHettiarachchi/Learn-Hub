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


// setting up the server and using middleware
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps)
        if (!origin) return callback(null, true);
        // In development allow any localhost port; in production use CLIENT_URL exactly
        if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (origin === ENV.CLIENT_URL) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
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
