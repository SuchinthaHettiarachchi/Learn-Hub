

import cloudinary from "../config/cloudinary.js";
import { ENV } from "../config/env.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from "mongoose";

import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";



const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });




// controller for creating a new course
export const createCourse = async (req, res) => {
    try {
        const { title, description, amount } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and description"
            });
        }

        const price = amount ? Number(amount) : 0;
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount",
            });
        }

        const thumbnailFile = req.files?.thumbnail?.[0];
        const pdfFile = req.files?.pdfFile?.[0];

        let thumbnailUrl = null;
        let pdfUrl = null;

        // Upload thumbnail if provided
        if (thumbnailFile) {
            try {
                const thumbnailBase64 = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
                const thumbnailUploadRes = await cloudinary.uploader.upload(thumbnailBase64, {
                    folder: "lms/thumbnails"
                });

                if (!thumbnailUploadRes?.secure_url) {
                    return res.status(500).json({
                        success: false,
                        message: "Thumbnail upload failed",
                    });
                }
                thumbnailUrl = thumbnailUploadRes.secure_url;
            } catch (uploadError) {
                console.log("Thumbnail upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Thumbnail upload failed: " + uploadError.message,
                });
            }
        }

        // Upload PDF if provided
        if (pdfFile) {
            // Validate that the file is actually a PDF
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json({
                    success: false,
                    message: "Only PDF files are allowed for course material",
                });
            }
            try {
                const pdfBase64 = `data:${pdfFile.mimetype};base64,${pdfFile.buffer.toString("base64")}`;
                const pdfUploadRes = await cloudinary.uploader.upload(pdfBase64, {
                    folder: "lms/pdfs",
                    resource_type: "raw",
                    format: "pdf"
                });

                if (pdfUploadRes?.secure_url) {
                    pdfUrl = pdfUploadRes.secure_url;
                }
            } catch (uploadError) {
                console.log("PDF upload error:", uploadError);
                // Don't fail if PDF upload fails, just skip it
            }
        }

        const newCourse = await Course.create({
            userId: req.user._id,
            title,
            description,
            thumbnail: thumbnailUrl,
            pdfFile: pdfUrl,
            amount: price
        });

        return res.status(201).json({
            success: true,
            message: "Course Created Successfully",
            newCourse
        });

    } catch (error) {
        // logging the error for debugging
        console.log("error in creating course: ", error);
        res.status(500).json({
            success: false,
            message: "failed to create the course: " + (error.message || "Unknown error")
        });
    }
}





// controller for getting the data of the all matching course 
// GET ALL COURSES FOR ADMIN (includes hidden courses)
export const getAllCourses = async (req, res) => {
    try {
        // Admin gets ALL courses including hidden ones
        const courses = await Course.find().lean();
        return res.status(200).json({
            success: true,
            courses,
            count: courses.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch courses"
        });
    }
};

// GET COURSES FOR USERS (filters hidden courses)
export const getCourse = async (req, res) => {
    try {
        const { search } = req.query;

        // If no search → return all courses that are not hidden
        if (!search || search.trim() === "") {
            const courses = await Course.find({ isHidden: false }).lean();
            return res.status(200).json({
                success: true,
                courses,
                count: courses.length,
            });
        }

        const prompt = `You are an intelligent assistant for a learning management platform. Return ONLY ONE keyword from:
            - Artificial intelligence
            - MERN Stack
            - DevOps
            - Mobile Development

        User query: ${search}`;

        let aiText = "";
        try {
            const result = await model.generateContent(prompt);
            aiText =
                result?.response?.candidates?.[0]?.content?.parts?.[0]?.text
                    ?.trim()
                    .replace(/[`"\n]/g, "") || "";
        } catch (aiError) {
            console.log("AI failed, falling back to user search");
        }

        const searchTerm = aiText || search;

        // Escape regex
        const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const courses = await Course.find({
            isHidden: false,
            $or: [
                { title: { $regex: safeSearch, $options: "i" } },
                { description: { $regex: safeSearch, $options: "i" } },
            ],
        }).lean();

        return res.status(200).json({
            success: true,
            courses,
            count: courses.length,
            searchTerm,
        });

    } catch (error) {
        console.error("Get Course Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};





// controller for getting the data of one course 
export const getSingleCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(courseId).populate("userId", "name");
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "course not found"
            });
        }

        return res.status(200).json(course);

    } catch (error) {
        console.error("Get single course Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}





// controller for geting data of one purchased course 
// if user purchased 4 course - now user wanna study any one course - then this will provide that one course from the purchased course
export const getPurchasedCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        // Check if user purchased this course
        const enrollment = await Enrollment.findOne({
            userId,
            courseId,
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You have not purchased this course",
            });
        }

        const course = await Course.findById(courseId).populate("modules");
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        return res.status(200).json(course);

    } catch (error) {
        console.error("Get purchased course error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};






// controller for get all purchased course
export const getAllPurchasedCourse = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all enrollments of user
        const enrollments = await Enrollment.find({ userId })
            .populate({
                path: "courseId",
                select: "title thumbnail amount",
            });

        if (!enrollments.length) {
            return res.status(200).json({
                courses: [],
            });
        }
        // Extract only course data
        const courses = enrollments.map(e => e.courseId).filter(c => c !== null);
        return res.status(200).json({
            courses
        });

    } catch (error) {
        console.error("Get all purchased courses error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// controller for editing a course
export const editCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const { title, description, amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Verify ownership
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this course",
            });
        }

        // Update fields
        if (title) course.title = title;
        if (description) course.description = description;
        if (amount) {
            const price = Number(amount);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid amount",
                });
            }
            course.amount = price;
        }

        // Handle thumbnail if provided
        const thumbnailFile = req.files?.thumbnail?.[0];
        if (thumbnailFile) {
            try {
                const thumbnailBase64 = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
                const uploadRes = await cloudinary.uploader.upload(thumbnailBase64, {
                    folder: "lms/thumbnails"
                });

                if (uploadRes?.secure_url) {
                    course.thumbnail = uploadRes.secure_url;
                }
            } catch (uploadError) {
                console.log("Thumbnail upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Thumbnail upload failed: " + uploadError.message,
                });
            }
        }

        // Handle PDF if provided
        const pdfFile = req.files?.pdfFile?.[0];
        if (pdfFile) {
            // Validate that the file is actually a PDF
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json({
                    success: false,
                    message: "Only PDF files are allowed for course material",
                });
            }
            try {
                const pdfBase64 = `data:${pdfFile.mimetype};base64,${pdfFile.buffer.toString("base64")}`;
                const pdfUploadRes = await cloudinary.uploader.upload(pdfBase64, {
                    folder: "lms/pdfs",
                    resource_type: "raw",
                    format: "pdf"
                });

                if (pdfUploadRes?.secure_url) {
                    course.pdfFile = pdfUploadRes.secure_url;
                }
            } catch (uploadError) {
                console.log("PDF upload error:", uploadError);
                // Don't fail if PDF upload fails
            }
        }

        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course,
        });

    } catch (error) {
        console.log("Error in editing course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to edit course: " + (error.message || "Unknown error"),
        });
    }
};

// controller for hiding a course
export const hideCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Verify ownership
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to hide this course",
            });
        }

        course.isHidden = !course.isHidden;
        await course.save();

        return res.status(200).json({
            success: true,
            message: course.isHidden ? "Course hidden successfully" : "Course unhidden successfully",
            course,
        });

    } catch (error) {
        console.log("Error in hiding course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to hide/unhide course",
        });
    }
};

// controller for deleting a course
export const deleteCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Verify ownership
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this course",
            });
        }

        // Delete thumbnail from Cloudinary if it exists
        if (course.thumbnail) {
            try {
                const urlParts = course.thumbnail.split('/');
                const filename = urlParts[urlParts.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(`lms/${filename}`);
            } catch (cloudinaryError) {
                console.log("Failed to delete thumbnail from Cloudinary:", cloudinaryError);
            }
        }

        // Delete all enrollments for this course
        await Enrollment.deleteMany({ courseId });

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });

    } catch (error) {
        console.log("Error in deleting course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};

// controller for free enrollment (no payment required)
export const freeEnroll = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            userId,
            courseId,
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course",
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            userId,
            courseId,
        });

        // Add course to user's purchased courses
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { purchasedCourse: courseId } }
        );

        return res.status(201).json({
            success: true,
            message: "Successfully enrolled in the course",
            enrollment,
        });

    } catch (error) {
        console.error("Free enroll error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to enroll in course",
        });
    }
};


// controller for downloading course PDF via server proxy
export const downloadCoursePDF = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        // Check if user is enrolled or is admin
        const enrollment = await Enrollment.findOne({ userId, courseId });
        const user = await User.findById(userId);
        const isAdmin = user?.admin === true || user?.email === ENV.ADMIN;

        if (!enrollment && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to download the PDF",
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        if (!course.pdfFile) {
            return res.status(404).json({
                success: false,
                message: "No PDF available for this course",
            });
        }

        // Fetch the PDF from Cloudinary
        const pdfResponse = await fetch(course.pdfFile);
        if (!pdfResponse.ok) {
            return res.status(502).json({
                success: false,
                message: "Failed to fetch PDF from storage",
            });
        }

        // Set proper headers for PDF download
        const sanitizedTitle = course.title.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);

        // Get the body as array buffer and send
        const arrayBuffer = await pdfResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.send(buffer);

    } catch (error) {
        console.error("Download PDF error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to download PDF",
        });
    }
};
