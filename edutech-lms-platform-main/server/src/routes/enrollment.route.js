import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { freeEnroll } from '../controllers/course.controller.js';

const enrollmentRoute = express.Router();

enrollmentRoute.post('/free-enroll', protectRoute, freeEnroll);

export default enrollmentRoute;
