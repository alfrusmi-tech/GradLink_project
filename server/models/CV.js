
import mongoose from "mongoose";

const cvSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    // Sensitive extracted CV content.
    // Excluded from ordinary queries by default.
    rawText: {
      type: String,
      default: "",
      select: false,
    },

    extractedSkills: [
      { type: String },
    ],

    extractedEducation: [
      { type: String },
    ],

    extractedExperience: [
      { type: String },
    ],

    extractedCertifications: [
      { type: String },
    ],

    // Most recent CV-to-job analysis.
    lastMatch: {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      matchPercentage: Number,
      matchedSkills: [String],
      missingSkills: [String],
      suggestions: [String],
      analyzedAt: Date,
    },

    // Preserve CV versions used in applications.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

cvSchema.index({
  user: 1,
  isActive: 1,
  createdAt: -1,
});

const CV = mongoose.model("CV", cvSchema);

export default CV;

