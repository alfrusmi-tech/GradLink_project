import express from "express";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs/promises";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import CV from "../models/CV.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("jobseeker"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.body.jobId)) return res.status(400).json({ message: "Valid jobId is required" });
    const job = await Job.findById(req.body.jobId);
    if (!job || job.status !== "open" || (job.deadline && job.deadline < new Date())) return res.status(400).json({ message: "This job is not accepting applications" });
    const cv = await CV.findOne({ user: req.user._id, isActive: true });
    if (!cv) return res.status(400).json({ message: "Upload your CV before applying" });
    if (await Application.exists({ job: job._id, applicant: req.user._id })) return res.status(409).json({ message: "You have already applied for this job" });
    const application = await Application.create({
      job: job._id, applicant: req.user._id, cv: cv._id,
      coverLetter: String(req.body.coverLetter || "").trim().slice(0, 2000),
      matchScoreAtApply: cv.lastMatch?.job?.toString() === job.id ? cv.lastMatch.matchPercentage || 0 : 0,
      statusHistory: [{ status: "pending" }],
    });
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });
    await Notification.create({ user: job.recruiter, type: "application_submitted", message: `New application for ${job.title}`, relatedJob: job._id, relatedApplication: application._id });
    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already applied for this job" });
    next(error);
  }
});

router.get("/me", protect, authorize("jobseeker"), async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id }).populate({ path: "job", populate: { path: "company", select: "name logo" } }).sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) { next(error); }
});

router.get("/job/:jobId", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) return res.status(404).json({ message: "Job not found" });
    const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    const applications = await Application.find({ job: job._id }).populate("applicant", "name email phone location skills education experience").populate("cv", "fileName extractedSkills").sort({ createdAt: -1 });
    res.json({ job, applications });
  } catch (error) { next(error); }
});

router.put("/:id/status", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Application not found" });
    if (!["pending", "shortlisted", "accepted", "rejected"].includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    const application = await Application.findById(req.params.id).populate("job");
    if (!application || application.job?.recruiter?.toString() !== req.user.id) return res.status(404).json({ message: "Application not found or not yours" });
    application.status = req.body.status;
    application.statusHistory.push({ status: req.body.status });
    await application.save();
    await Notification.create({ user: application.applicant, type: req.body.status === "accepted" ? "application_accepted" : req.body.status === "rejected" ? "application_rejected" : "application_reviewed", message: `Your application for ${application.job.title} is now ${req.body.status}`, relatedJob: application.job._id, relatedApplication: application._id });
    await application.populate("applicant", "name email phone location skills education experience");
    await application.populate("cv", "fileName extractedSkills");
    res.json({ message: "Application status updated", application });
  } catch (error) { next(error); }
});

router.get("/:id/cv", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Application not found" });
    const application = await Application.findById(req.params.id).populate("job").populate("cv");
    if (!application || application.job?.recruiter?.toString() !== req.user.id || !application.cv) return res.status(404).json({ message: "CV not found" });
    const filePath = path.resolve("uploads", path.basename(application.cv.fileUrl));
    await fs.access(filePath);
    res.download(filePath, application.cv.fileName);
  } catch (error) {
    if (error.code === "ENOENT") return res.status(404).json({ message: "CV file is unavailable" });
    next(error);
  }
});

export default router;

