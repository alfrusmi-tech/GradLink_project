import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import pdfParse from "pdf-parse";

import CV from "../models/CV.js";
import Job from "../models/Job.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { uploadCV } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Only authenticated job seekers can access CV routes.
router.use(protect, authorize("jobseeker"));

// ==========================================
// SKILL DEFINITIONS AND ALIASES
// ==========================================

// Each skill has a canonical name and recognized aliases.
// Add new skills here as your project grows.

const skillDefinitions = [
  {
    name: "JavaScript",
    aliases: ["JavaScript", "JS", "ECMAScript"],
  },
  {
    name: "TypeScript",
    aliases: ["TypeScript"],
  },
  {
    name: "React",
    aliases: ["React", "React.js", "ReactJS"],
  },
  {
    name: "Node.js",
    aliases: ["Node.js", "NodeJS"],
  },
  {
    name: "Express",
    aliases: ["Express.js", "ExpressJS", "Express"],
  },
  {
    name: "Python",
    aliases: ["Python"],
  },
  {
    name: "Java",
    aliases: ["Java"],
  },
  {
    name: "Spring Boot",
    aliases: ["Spring Boot", "SpringBoot"],
  },
  {
    name: "SQL",
    aliases: ["SQL"],
  },
  {
    name: "MongoDB",
    aliases: ["MongoDB", "Mongo DB"],
  },
  {
    name: "HTML",
    aliases: ["HTML", "HTML5"],
  },
  {
    name: "CSS",
    aliases: ["CSS", "CSS3"],
  },
  {
    name: "Docker",
    aliases: ["Docker"],
  },
  {
    name: "AWS",
    aliases: ["AWS", "Amazon Web Services"],
  },
];

// ==========================================
// SKILL MATCHING HELPERS
// ==========================================

// Escape characters that have special meaning
// in regular expressions.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalize names for exact comparison.
const normalizeSkill = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

// Find a skill definition using its name or alias.
const findSkillDefinition = (skill) => {
  const normalized = normalizeSkill(skill);

  return skillDefinitions.find((definition) =>
    definition.aliases.some(
      (alias) => normalizeSkill(alias) === normalized
    )
  );
};

// Return the canonical name of a known skill.
// Unknown skills retain their original name.
const canonicalSkill = (skill) => {
  const definition = findSkillDefinition(skill);

  return definition
    ? definition.name
    : String(skill || "").trim();
};

// Match a complete skill phrase instead of
// searching for a substring inside another word.
const containsSkillPhrase = (text, phrase) => {
  const escaped = escapeRegex(phrase.trim())
    .replace(/\s+/g, "\\s+");

  if (!escaped) return false;

  const regex = new RegExp(
    `(^|[^a-zA-Z0-9+#.])${escaped}(?=$|[^a-zA-Z0-9+#.])`,
    "i"
  );

  return regex.test(text);
};

// Check if CV text contains a skill or its aliases.
const hasSkill = (cvText, skill) => {
  const definition = findSkillDefinition(skill);

  const aliases = definition
    ? definition.aliases
    : [String(skill || "")];

  return aliases.some((alias) =>
    containsSkillPhrase(cvText, alias)
  );
};

// Extract known skills from CV text.
const extractKnownSkills = (cvText) =>
  skillDefinitions
    .filter((definition) =>
      definition.aliases.some((alias) =>
        containsSkillPhrase(cvText, alias)
      )
    )
    .map((definition) => definition.name);

// Remove duplicate skills, including aliases.
const uniqueSkills = (skills) => {
  const seen = new Set();

  return (Array.isArray(skills) ? skills : [])
    .map((skill) => String(skill || "").trim())
    .filter(Boolean)
    .filter((skill) => {
      const key = normalizeSkill(canonicalSkill(skill));

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
};

// ==========================================
// 1. GET MY ACTIVE CV
// ==========================================

router.get("/me", async (req, res, next) => {
  try {
      CV.findOne({
      user: req.user._id,
       isActive: true,
      })
      .select("-rawText")
      .sort({ createdAt: -1, _id: -1 });

    if (!cv) {
      return res.status(404).json({
        message: "You have not uploaded a CV yet",
      });
    }

    return res.json(cv);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. VIEW OR DOWNLOAD MY ACTIVE CV
// ==========================================

router.get("/me/file", async (req, res, next) => {
  try {
    const cv = await CV.findOne({
      user: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1, _id: -1 });

    if (!cv) {
      return res.status(404).json({
        message: "CV not found",
      });
    }

    const filePath = path.resolve(
      "uploads",
      path.basename(cv.fileUrl)
    );

    await fs.access(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.setHeader(
      "Content-Disposition",
      'inline; filename="cv.pdf"'
    );

    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        message: "CV file not found",
      });
    }

    next(error);
  }
});

// ==========================================
// 3. SECURE CV UPLOAD WITH VERSIONING
// ==========================================

router.post(
  "/upload",
  uploadCV.single("cv"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a PDF CV",
      });
    }

    let newCV = null;

    try {
      // STEP 1: Read uploaded file.
      const pdfBuffer = await fs.readFile(
        req.file.path
      );

      // STEP 2: Verify PDF signature.
      const signature = pdfBuffer
        .subarray(0, 5)
        .toString("ascii");

      if (signature !== "%PDF-") {
        const error = new Error(
          "Invalid PDF file content"
        );

        error.status = 400;
        throw error;
      }

      // STEP 3: Parse PDF content.
      let parsed;

      try {
        parsed = await pdfParse(pdfBuffer);
      } catch {
        const error = new Error(
          "PDF is corrupted or cannot be processed"
        );

        error.status = 400;
        throw error;
      }

      // STEP 4: Require extractable text.
      const rawText = parsed.text || "";

      if (!rawText.trim()) {
        const error = new Error(
          "PDF has no extractable text"
        );

        error.status = 400;
        throw error;
      }

      // STEP 5: Extract skills accurately.
      const extractedSkills =
        extractKnownSkills(rawText);

      // STEP 6: Create new CV version.
      // Keep older CVs and their files.
      newCV = await CV.create({
        user: req.user._id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        rawText,
        extractedSkills,
        extractedEducation: [],
        extractedExperience: [],
        extractedCertifications: [],
        isActive: false,
      });

      // STEP 7: Deactivate older CVs.
      await CV.updateMany(
        {
          user: req.user._id,
          _id: { $ne: newCV._id },
          isActive: true,
        },
        {
          $set: { isActive: false },
        }
      );

      // STEP 8: Activate the new CV.
      newCV.isActive = true;
      await newCV.save();

      const safeCV = newCV.toObject();
      delete safeCV.rawText;

      return res.status(201).json({
      message: "CV uploaded successfully",
         cv: safeCV,
      });
    } catch (error) {
      // Remove the newly uploaded file on failure.
      await fs.unlink(req.file.path).catch(() => {});

      // Remove incomplete CV records only.
      if (newCV) {
        await CV.deleteOne({
          _id: newCV._id,
          isActive: false,
        }).catch(() => {});
      }

      next(error);
    }
  }
);

// ==========================================
// 4. ANALYZE CV AGAINST A JOB
// ==========================================

router.post(
  "/analyze/:jobId",
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const [job, cv] = await Promise.all([
        Job.findOne({
          _id: req.params.jobId,
          status: "open",
          $or: [
            { deadline: null },
            { deadline: { $gte: new Date() } },
          ],
        }),

        CV.findOne({
          user: req.user._id,
          isActive: true,
        }).sort({ createdAt: -1, _id: -1 }),
      ]);

      if (!job) {
        return res.status(404).json({
          message: "Job not found or no longer available",
        });
      }

      if (!cv) {
        return res.status(400).json({
          message: "Upload your CV first",
        });
      }

      // STEP 1: Get unique required skills.
      const requiredSkills = uniqueSkills(
        job.requiredSkills || []
      );

      // STEP 2: Get the CV text.
      const cvText = cv.rawText || "";

      // STEP 3: Match skills using exact phrases
      // and recognized aliases.
      const matchedSkills = requiredSkills.filter(
        (skill) => hasSkill(cvText, skill)
      );

      // STEP 4: Identify missing skills.
      const missingSkills = requiredSkills.filter(
        (skill) => !hasSkill(cvText, skill)
      );

      // STEP 5: Calculate match percentage.
      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round(
              (matchedSkills.length /
                requiredSkills.length) *
                100
            )
          : 0;

      // STEP 6: Generate suggestions.
      const suggestions = missingSkills.map(
        (skill) =>
          `If you have experience with ${skill}, add it clearly to your CV.`
      );

      // STEP 7: Save analysis result.
      cv.lastMatch = {
        job: job._id,
        matchPercentage,
        matchedSkills,
        missingSkills,
        suggestions,
        analyzedAt: new Date(),
      };

      await cv.save();

      // STEP 8: Return results to frontend.
      return res.json({
        jobId: job._id,
        matchPercentage,
        matchedSkills,
        missingSkills,
        suggestions,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;




