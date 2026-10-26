
import express from "express";
import mongoose from "mongoose";

import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// ALLOWED JOB FIELDS
// ==========================================

const fields = [
  "title",
  "description",
  "responsibilities",
  "requiredSkills",
  "preferredSkills",
  "experienceLevel",
  "experienceYears",
  "location",
  "jobType",
  "salaryMin",
  "salaryMax",
  "education",
  "status",
  "deadline",
];

const pick = (body) =>
  Object.fromEntries(
    fields
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]])
  );

// ==========================================
// SALARY VALIDATION
// ==========================================

const validSalary = (body) =>
  body.salaryMin == null ||
  body.salaryMax == null ||
  Number(body.salaryMin) <= Number(body.salaryMax);

// ==========================================
// ACTIVE JOB FILTER
// ==========================================

// Only show open jobs that:
// 1. Have no deadline, or
// 2. Have a deadline that has not passed.
//
// Jobs with null or missing deadlines
// remain available.

const activeJobFilter = () => ({
  status: "open",
  $or: [
    { deadline: null },
    { deadline: { $gte: new Date() } },
  ],
});

// ==========================================
// 1. RECRUITER - GET MY JOBS
// ==========================================

// Recruiters can see all their jobs,
// including expired and closed jobs.

router.get(
  "/recruiter/mine",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      const jobs = await Job.find({
        recruiter: req.user._id,
      })
        .populate(
          "company",
          "name logo location"
        )
        .sort({ createdAt: -1 });

      return res.json(jobs);
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 2. RECRUITER - GET ONE OF MY JOBS
// ==========================================

router.get(
  "/recruiter/mine/:id",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const job = await Job.findOne({
        _id: req.params.id,
        recruiter: req.user._id,
      }).populate(
        "company",
        "name logo location"
      );

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      return res.json(job);
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 3. PUBLIC - GET ACTIVE JOBS
// ==========================================

// Expired jobs are automatically excluded.

router.get("/", async (req, res, next) => {
  try {
    const jobs = await Job.find(
      activeJobFilter()
    )
      .populate(
        "company",
        "name logo location"
      )
      .sort({ createdAt: -1 });

    return res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. PUBLIC - GET SINGLE ACTIVE JOB
// ==========================================

// Expired or closed jobs cannot be viewed
// through the public job details endpoint.

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      ...activeJobFilter(),
    }).populate(
      "company",
      "name logo description website location"
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found or no longer available",
      });
    }

    return res.json(job);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. RECRUITER - CREATE JOB
// ==========================================

router.post(
  "/",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      const company = await Company.findOne({
        owner: req.user._id,
      });

      if (!company) {
        return res.status(400).json({
          message: "Create your company profile first",
        });
      }

      if (!validSalary(req.body)) {
        return res.status(400).json({
          message:
            "Maximum salary must be greater than minimum salary",
        });
      }

      // Prevent creating a job with an expired deadline.
      if (
        req.body.deadline &&
        new Date(req.body.deadline) < new Date()
      ) {
        return res.status(400).json({
          message: "Job deadline cannot be in the past",
        });
      }

      const job = await Job.create({
        ...pick(req.body),
        company: company._id,
        recruiter: req.user._id,
      });

      return res.status(201).json({ job });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 6. RECRUITER - UPDATE JOB
// ==========================================

router.put(
  "/:id",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const job = await Job.findOne({
        _id: req.params.id,
        recruiter: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found or not yours",
        });
      }

      const updates = pick(req.body);

      // Only validate the deadline when changed.
      if (
        updates.deadline &&
        new Date(updates.deadline) < new Date()
      ) {
        return res.status(400).json({
          message: "Job deadline cannot be in the past",
        });
      }

      Object.assign(job, updates);

      if (!validSalary(job)) {
        return res.status(400).json({
          message:
            "Maximum salary must be greater than minimum salary",
        });
      }

      await job.save();

      await job.populate(
        "company",
        "name logo location"
      );

      return res.json({ job });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 7. RECRUITER - DELETE JOB
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const job = await Job.findOne({
        _id: req.params.id,
        recruiter: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found or not yours",
        });
      }

      // Do not delete jobs that have applications.
      const hasApplications = await Application.exists({
        job: job._id,
      });

      if (hasApplications) {
        return res.status(409).json({
          message:
            "This job has applications. Close it instead of deleting it.",
        });
      }

      await job.deleteOne();

      return res.json({
        message: "Job deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;


