import mongoose from "mongoose";

const generatedContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    type: {
      type: String,
      enum: ["summary", "explanation"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    concept: {
      type: String,
      default: "", // used when type is "explanation"
    },
  },
  { timestamps: true }
);

const GeneratedContent = mongoose.model("GeneratedContent", generatedContentSchema);
export default GeneratedContent;
