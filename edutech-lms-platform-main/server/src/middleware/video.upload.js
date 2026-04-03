/**
 * Video Upload Middleware (Multer + Cloudinary)
 * 
 * Uses CloudinaryStorage to upload video files directly to Cloudinary
 * (no local disk storage). Files are stored in the "courseModule" folder.
 * 
 * Used for: Module video uploads (module routes, admin only)
 * 
 * Supported formats: mp4, mov, avi
 * Max file size: 500 MB
 */

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";



// Configure Cloudinary as the storage destination for video files
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "courseModule",         // Cloudinary folder for all module videos
        resource_type: 'video',        // Tells Cloudinary to handle as video (not image)
        allowed_formats: ['mp4', 'mov', 'avi']
    }
});


export const videoUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 500    // 500 MB max file size
    }
});


