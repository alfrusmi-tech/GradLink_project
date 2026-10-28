import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import CV from "../models/CV.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.use(protect, authorize("admin"));


router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Not found" });
  }
  next();
});

// ---------- helpers ----------
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPaging = (req) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (total, page, limit) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return {
    currentPage: page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};


const deleteJobsCascade = async (jobIds) => {
  if (!jobIds.length) return;
  await Application.deleteMany({ job: { $in: jobIds } });
  await Notification.deleteMany({ relatedJob: { $in: jobIds } });
  await Job.deleteMany({ _id: { $in: jobIds } });
};

// ---------- 1. STATISTICS ----------
router.get("/statistics", async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, jobSeekers, recruiters, admins,
      totalJobs, openJobs, draftJobs, closedJobs,
      totalApps, acceptedApps, totalCompanies,
      recentUsers, recentJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "admin" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "draft" }),
      Job.countDocuments({ status: "closed" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "accepted" }),
      Company.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Job.find().sort({ createdAt: -1 }).limit(5)
        .select("title status location company createdAt")
        .populate("company", "name"),
    ]);

    res.json({
      users: {
        total: totalUsers, active: activeUsers, disabled: totalUsers - activeUsers,
        jobSeekers, recruiters, admins,
      },
      jobs: { total: totalJobs, open: openJobs, draft: draftJobs, closed: closedJobs },
      applications: { total: totalApps, accepted: acceptedApps },
      companies: { total: totalCompanies },
      recentUsers,
      recentJobs,
    });
  } catch (err) { next(err); }
});

// ---------- 2. USERS ----------
router.get("/users", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaging(req);
    const { search = "", role = "", status = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (["jobseeker", "recruiter", "admin"].includes(role)) filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "disabled") filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter).populate("company", "name")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, pagination: buildPagination(total, page, limit) });
  } catch (err) { next(err); }
});

router.put("/users/:id/status", async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be true or false" });
    }
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ message: "You cannot disable your own account" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, { isActive }, { new: true }
    ).populate("company", "name");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${isActive ? "enabled" : "disabled"}`, user });
  } catch (err) { next(err); }
});

router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["jobseeker", "recruiter", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).populate("company", "name");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (err) { next(err); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ownJobs = await Job.find({ recruiter: user._id }).select("_id");
    await deleteJobsCascade(ownJobs.map((j) => j._id));
    await Company.deleteMany({ owner: user._id });

    
    await Application.deleteMany({ applicant: user._id });
    await Notification.deleteMany({ user: user._id });
    await CV.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
});

// ---------- 3. JOBS ----------
router.get("/jobs", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaging(req);
    const { search = "", status = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: rx }, { location: rx }];
    }
    if (["open", "closed", "draft"].includes(status)) filter.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("company", "name")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json({ jobs, pagination: buildPagination(total, page, limit) });
  } catch (err) { next(err); }
});

router.put("/jobs/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["open", "closed", "draft"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const job = await Job.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate("company", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: `Job marked as ${status}`, job });
  } catch (err) { next(err); }
});

router.delete("/jobs/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await deleteJobsCascade([job._id]);
    res.json({ message: "Job deleted" });
  } catch (err) { next(err); }
});

// ---------- 4. COMPANIES ----------
router.get("/companies", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaging(req);
    const { search = "" } = req.query;
    const filter = {};
    if (search.trim()) filter.name = new RegExp(escapeRegex(search.trim()), "i");

    const [companies, total] = await Promise.all([
      Company.find(filter).populate("owner", "name email")
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Company.countDocuments(filter),
    ]);

    
    const counts = await Job.aggregate([
      { $match: { company: { $in: companies.map((c) => c._id) } } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    companies.forEach((c) => { c.jobsCount = countMap.get(String(c._id)) || 0; });

    res.json({ companies, pagination: buildPagination(total, page, limit) });
  } catch (err) { next(err); }
});

router.delete("/companies/:id", async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const jobs = await Job.find({ company: company._id }).select("_id");
    await deleteJobsCascade(jobs.map((j) => j._id));
    await User.updateMany({ company: company._id }, { $unset: { company: "" } });
    await company.deleteOne();

    res.json({ message: "Company deleted" });
  } catch (err) { next(err); }
});

export default router;