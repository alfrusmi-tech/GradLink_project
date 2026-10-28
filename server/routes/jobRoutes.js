
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
  "title", "description","responsibilities","requiredSkills","preferredSkills","experienceLevel","experienceYears",
  "location","jobType","salaryMin","salaryMax","education","status","deadline",
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
// SEARCH / FILTER / SORT HELPERS
// ==========================================
 
// Escape user input before building a RegExp,
// so searches such as "c++" do not crash.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
const JOB_TYPES = [
  "full-time", "part-time", "contract", "internship", "remote",
];
 
const EXPERIENCE_LEVELS = [
  "entry", "junior", "mid", "senior", "lead",
];
 
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  salary_high: { salaryMax: -1, createdAt: -1 },
  title_az: { title: 1 },
};

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
// 3. PUBLIC - SEARCH, FILTER, SORT AND PAGINATE ACTIVE JOBS
// ==========================================
 
// Expired jobs are automatically excluded.
 
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 9, 1),
      100
    );
 
    const term = String(req.query.q || "").trim();
    const location = String(req.query.location || "").trim();
    const jobType = String(req.query.jobType || "");
    const experienceLevel = String(req.query.experienceLevel || "");
    const sortKey = String(req.query.sort || "newest");
    const minSalary = Number(req.query.minSalary);
 
    // activeJobFilter() already uses $or for the deadline,
    // so every condition is combined with $and.
    const conditions = [activeJobFilter()];
 
    if (term) {
      const regex = new RegExp(escapeRegex(term), "i");
 
      // Company name lives in another collection,
      // so look up matching company ids first.
      const companies = await Company.find({ name: regex }).select("_id");
 
      conditions.push({
        $or: [
          { title: regex },
          { location: regex },
          { requiredSkills: regex },
          { company: { $in: companies.map((c) => c._id) } },
        ],
      });
    }
 
    if (location) {
      conditions.push({
        location: new RegExp(escapeRegex(location), "i"),
      });
    }
 
    if (JOB_TYPES.includes(jobType)) {
      conditions.push({ jobType });
    }
 
    if (EXPERIENCE_LEVELS.includes(experienceLevel)) {
      conditions.push({ experienceLevel });
    }
 
    if (Number.isFinite(minSalary) && minSalary > 0) {
      conditions.push({ salaryMax: { $gte: minSalary } });
    }
 
    const filter = { $and: conditions };
    const sort = SORT_OPTIONS[sortKey] || SORT_OPTIONS.newest;
 
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("company", "name logo location")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter),
    ]);
 
    const totalPages = Math.max(Math.ceil(total / limit), 1);
 
    return res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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


