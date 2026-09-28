import express from "express";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

const fields = ["title", "description", "responsibilities", "requiredSkills", "preferredSkills", "experienceLevel", "experienceYears", "location", "jobType", "salaryMin", "salaryMax", "education", "status", "deadline"];
const pick = (body) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validSalary = (body) => body.salaryMin == null || body.salaryMax == null || Number(body.salaryMin) <= Number(body.salaryMax);

router.get("/recruiter/mine", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    res.json(await Job.find({ recruiter: req.user._id }).populate("company", "name logo location").sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/recruiter/mine/:id", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Job not found" });
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id }).populate("company", "name logo location");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await Job.find({ status: "open" }).populate("company", "name logo location").sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Job not found" });
    const job = await Job.findOne({ _id: req.params.id, status: "open" }).populate("company", "name logo description website location");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) { next(error); }
});

router.post("/", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) return res.status(400).json({ message: "Create your company profile first" });
    if (!validSalary(req.body)) return res.status(400).json({ message: "Maximum salary must be greater than minimum salary" });
    const job = await Job.create({ ...pick(req.body), company: company._id, recruiter: req.user._id });
    res.status(201).json({ job });
  } catch (error) { next(error); }
});

router.put("/:id", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Job not found" });
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    Object.assign(job, pick(req.body));
    if (!validSalary(job)) return res.status(400).json({ message: "Maximum salary must be greater than minimum salary" });
    await job.save();
    await job.populate("company", "name logo location");
    res.json({ job });
  } catch (error) { next(error); }
});

router.delete("/:id", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Job not found" });
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    if (await Application.exists({ job: job._id })) return res.status(409).json({ message: "This job has applications. Close it instead of deleting it." });
    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) { next(error); }
});

export default router;

