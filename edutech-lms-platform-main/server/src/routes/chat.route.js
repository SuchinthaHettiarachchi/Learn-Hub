import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { askChat } from "../controllers/chat.controller.js";

const chatRoute = express.Router();

// POST /api/chat/ask
chatRoute.post("/ask", protectRoute, askChat);

export default chatRoute;

