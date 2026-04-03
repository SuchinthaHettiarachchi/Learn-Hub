/**
 * Comment Routes
 * 
 * Manages user comments on course modules.
 * 
 * Protected routes (requires JWT):
 *   POST /api/comment/createComment/:id  — Add a comment to a module (id = moduleId)
 */

import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createComment } from '../controllers/comment.controller.js';


const commentRoute = express.Router();


commentRoute.post('/createComment/:id', protectRoute, createComment);


export default commentRoute;

