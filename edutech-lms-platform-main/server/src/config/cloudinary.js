/**
 * Cloudinary Configuration
 * 
 * Initializes the Cloudinary SDK for media asset management.
 * Used for:
 *   - Profile photo uploads (user.controller.js)
 *   - Course thumbnail & PDF uploads (course.controller.js)
 *   - Module video uploads via CloudinaryStorage (video.upload.js)
 */
import {v2 as cloudinary} from 'cloudinary';
import { ENV } from "./env.js";

cloudinary.config({
    cloud_name: ENV.CLOUD_NAME,
    api_key: ENV.CLOUD_API_KEY,
    api_secret: ENV.CLOUD_API_SECRET
});

export default cloudinary;

