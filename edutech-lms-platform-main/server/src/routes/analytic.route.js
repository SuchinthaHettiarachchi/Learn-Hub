

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

