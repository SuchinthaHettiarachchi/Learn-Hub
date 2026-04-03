/**
 * General File Upload Middleware (Multer)
 * 
 * Uses in-memory storage (files stored as Buffer in req.file.buffer).
 * The buffer is then base64-encoded and uploaded to Cloudinary by controllers.
 * 
 * Used for:
 *   - Profile photo uploads (user routes)
 *   - Course thumbnail and PDF uploads (course routes)
 * 
 * NOTE: No file size limit or file type filter is applied here.
 *       Consider adding limits for production use.
 */

import multer from "multer";


const storage = multer.memoryStorage();

export const upload = multer({
    storage
})

