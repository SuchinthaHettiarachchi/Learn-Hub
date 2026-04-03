import mongoose from "mongoose";

import { ENV } from "../config/env.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

export const askChat = async (req, res) => {
  try {
    const { message, courseId } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "message cannot be empty",
      });
    }

    if (!ENV.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "Chatbot is not configured. GROQ_API_KEY is missing on the server.",
      });
    }

    let courseContext = "";
    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid courseId",
        });
      }

      // Only allow chatting on courses the logged-in user has access to.
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You have not enrolled in this course",
        });
      }

      const course = await Course.findById(courseId).populate("modules");
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const modules = Array.isArray(course.modules) ? course.modules : [];
      const moduleLines = modules.slice(0, 10).map((m, i) => {
        const title = m?.title || "Untitled module";
        return `${i + 1}. ${title}`;
      });

      courseContext = [
        `Course title: ${course.title || "N/A"}`,
        `Course description: ${course.description || "N/A"}`,
        `Modules (first ${Math.min(modules.length, 10)}):`,
        moduleLines.join("\n"),
      ].join("\n");
    }

    const prompt = [
      "You are Learn Hub, a course-focused tutor assistant for an LMS.",
      "Answer the user using only the provided course context when available.",
      "If the user asks something unrelated to the course, gently redirect them back to what they can learn from this course and ask what module/topic they are working on.",
      "",
      courseContext
        ? `Course context:\n${courseContext}`
        : "Course context is not provided. Ask the user to open a course page (or tell you the course name) so you can answer course-related questions.",
      "",
      `User question:\n${trimmedMessage}`,
      "",
      "Response format:",
      "- Give a concise direct answer.",
      "- Provide 3 to 6 bullet points with steps or explanations.",
      "- End with 1 short question that helps you tailor the next answer (e.g., which module/topic).",
    ].join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate a reply from the chatbot.",
      });
    }

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("askChat error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while generating chatbot response.",
    });
  }
};

