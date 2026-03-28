/**
 * Module Routes
 * 
 * Manages course modules (video lessons).
 * 
 * Admin routes (requires JWT + admin email):
 *   POST /api/createModule         — Upload video module to Cloudinary (multipart)
 * 
 * Protected routes (requires JWT):
 *   GET  /api/getModule/:id        — Get single module with populated comments
 *   GET  /api/comment/:id          — Get all comments for a module
 */

import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createModule, getComment, getSingleCourseModule } from "../controllers/module.controller.js";
import { videoUpload } from "../middleware/video.upload.js";

const moduleRoute = express.Router();


moduleRoute.post('/createModule', protectRoute, adminRoute, videoUpload.single('video'), createModule);
moduleRoute.get('/getModule/:id', protectRoute, getSingleCourseModule);
moduleRoute.get('/comment/:id', protectRoute, getComment);

export default moduleRoute;

