/**
 * Analytics Routes (Admin Dashboard)
 * 
 * All routes require JWT + admin authorization.
 * Powers the admin dashboard with business intelligence data.
 * 
 *   GET /api/analytic/getAnalytic    — Overall stats (users, courses, enrollments, revenue)
 *   GET /api/analytic/getDailyData   — Daily enrollment + revenue (requires startDate, endDate)
 *   GET /api/analytic/topCourses     — Top 10 courses by enrollment count
 *   GET /api/analytic/revenueTrend   — Monthly revenue for past N months
 *   GET /api/analytic/userGrowth     — Monthly new user registrations for past N months
 */

import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { getAnalyticsDataController, getDailyAnalyticsController, getTopCoursesController, getRevenueTrendController, getUserGrowthController } from '../controllers/analytic.controller.js'


const analyticRoute = express.Router();


analyticRoute.get('/getAnalytic', protectRoute, adminRoute, getAnalyticsDataController);
analyticRoute.get('/getDailyData', protectRoute, adminRoute, getDailyAnalyticsController);
analyticRoute.get('/topCourses', protectRoute, adminRoute, getTopCoursesController);
analyticRoute.get('/revenueTrend', protectRoute, adminRoute, getRevenueTrendController);
analyticRoute.get('/userGrowth', protectRoute, adminRoute, getUserGrowthController);


export default analyticRoute;

