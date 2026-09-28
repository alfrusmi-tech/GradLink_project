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
router.use(protect, authorize("jobseeker"));

const knownSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Python", "Java", "Spring Boot", "SQL", "MongoDB", "HTML", "CSS", "Docker", "AWS"];

router.get("/me", async (req, res, next) => {
  try {
    const cv = await CV.findOne({ user: req.user._id, isActive: true });
    if (!cv) return res.status(404).json({ message: "You have not uploaded a CV yet" });
    res.json(cv);
  } catch (error) { next(error); }
});

router.post("/upload", uploadCV.single("cv"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Please select a PDF CV" });
  try {
    const parsed = await pdfParse(await fs.readFile(req.file.path));
    const rawText = parsed.text || "";
    const extractedSkills = knownSkills.filter((skill) => rawText.toLowerCase().includes(skill.toLowerCase()));
    let cv = await CV.findOne({ user: req.user._id });
    const oldFileUrl = cv?.fileUrl;
    const data = {
      fileName: req.file.originalname, fileUrl: `/uploads/${req.file.filename}`, rawText,
      extractedSkills, extractedEducation: [], extractedExperience: [], extractedCertifications: [],
      lastMatch: undefined, isActive: true,
    };
    if (cv) { Object.assign(cv, data); await cv.save(); }
    else cv = await CV.create({ user: req.user._id, ...data });
    if (oldFileUrl) await fs.unlink(path.resolve("uploads", path.basename(oldFileUrl))).catch(() => {});
    res.json({ message: "CV uploaded successfully", cv });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
});

router.post("/analyze/:jobId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) return res.status(404).json({ message: "Job not found" });
    const [job, cv] = await Promise.all([
      Job.findOne({ _id: req.params.jobId, status: "open" }),
      CV.findOne({ user: req.user._id, isActive: true }),
    ]);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!cv) return res.status(400).json({ message: "Upload your CV first" });
    const requiredSkills = job.requiredSkills || [];
    const matchedSkills = requiredSkills.filter((skill) => cv.rawText.toLowerCase().includes(skill.toLowerCase()));
    const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
    const matchPercentage = requiredSkills.length ? Math.round(matchedSkills.length / requiredSkills.length * 100) : 0;
    const suggestions = missingSkills.map((skill) => `If you have experience with ${skill}, add it clearly to your CV.`);
    cv.lastMatch = { job: job._id, matchPercentage, matchedSkills, missingSkills, suggestions, analyzedAt: new Date() };
    await cv.save();
    res.json({ jobId: job._id, matchPercentage, matchedSkills, missingSkills, suggestions });
  } catch (error) { next(error); }
});

export default router;
