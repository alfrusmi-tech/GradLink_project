
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

// ==========================================
// HELPER: CREATE HTTP ERROR
// ==========================================

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// ==========================================
// 1. SUBMIT APPLICATION WITH TRANSACTION
// ==========================================

router.post(
  "/",
  protect,
  authorize("jobseeker"),
  async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.body?.jobId)) {
      return res.status(400).json({
        message: "Valid jobId is required",
      });
    }

    const jobId = req.body.jobId;
    const applicantId = req.user._id;

    const coverLetter = String(
      req.body.coverLetter || ""
    )
      .trim()
      .slice(0, 2000);

    let session;

    try {
      session = await mongoose.startSession();

      let createdApplication;

      await session.withTransaction(async () => {
        // STEP 1: Validate the job.
        const job = await Job.findById(jobId)
          .session(session);

        if (
          !job ||
          job.status !== "open" ||
          (job.deadline &&
            new Date(job.deadline) < new Date())
        ) {
          throw httpError(
            400,
            "This job is not accepting applications"
          );
        }

        // STEP 2: Find the latest active CV.
        const cv = await CV.findOne({
          user: applicantId,
          isActive: true,
        })
          .sort({ createdAt: -1, _id: -1 })
          .session(session);

        if (!cv) {
          throw httpError(
            400,
            "Upload your CV before applying"
          );
        }

        // STEP 3: Check for duplicate applications.
        const existing = await Application.findOne({
          job: job._id,
          applicant: applicantId,
        }).session(session);

        if (existing) {
          throw httpError(
            409,
            "You have already applied for this job"
          );
        }

        // STEP 4: Create the application.
        // Preserve the CV version used at submission.
        const applications = await Application.create(
          [
            {
              job: job._id,
              applicant: applicantId,
              cv: cv._id,
              coverLetter,

              matchScoreAtApply:
                cv.lastMatch?.job?.toString() ===
                job._id.toString()
                  ? cv.lastMatch.matchPercentage || 0
                  : 0,

              status: "pending",

              statusHistory: [
                {
                  status: "pending",
                  changedAt: new Date(),
                },
              ],
            },
          ],
          { session }
        );

        const application = applications[0];

        // Store result for response after commit.
        createdApplication = application;

        // STEP 5: Increase applicant count.
        const updatedJob = await Job.findByIdAndUpdate(
          job._id,
          {
            $inc: { applicantsCount: 1 },
          },
          {
            session,
            new: true,
          }
        );

        if (!updatedJob) {
          throw httpError(
            500,
            "Unable to update applicant count"
          );
        }

        // STEP 6: Create recruiter notification.
        // This write is part of the transaction.
        await Notification.create(
          [
            {
              user: job.recruiter,
              type: "application_submitted",
              message: `New application for ${job.title}`,
              relatedJob: job._id,
              relatedApplication: application._id,
              isRead: false,
            },
          ],
          { session }
        );
      });

      // STEP 7: All transaction writes committed.
      return res.status(201).json({
        message: "Application submitted successfully",
        application: createdApplication,
      });
    } catch (error) {
      if (
        error.code === 11000 ||
        error.status === 409
      ) {
        return res.status(409).json({
          message: "You have already applied for this job",
        });
      }

      next(error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

// ==========================================
// 2. GET MY APPLICATIONS
// ==========================================

router.get(
  "/me",
  protect,
  authorize("jobseeker"),
  async (req, res, next) => {
    try {
      const applications = await Application.find({
        applicant: req.user._id,
      })
        .populate({
          path: "job",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .sort({ createdAt: -1 });

      return res.json({ applications });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 3. RECRUITER - VIEW JOB APPLICATIONS
// ==========================================

router.get(
  "/job/:jobId",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const job = await Job.findOne({
        _id: req.params.jobId,
        recruiter: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found or not yours",
        });
      }

      const applications = await Application.find({
        job: job._id,
      })
        .populate(
          "applicant",
          "name email phone location skills education experience"
        )
        .populate(
          "cv",
          "fileName extractedSkills"
        )
        .sort({ createdAt: -1 });

      return res.json({
        job,
        applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 4. RECRUITER - UPDATE APPLICATION STATUS
// ==========================================

router.put(
  "/:id/status",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      const allowedStatuses = [
        "pending",
        "shortlisted",
        "accepted",
        "rejected",
      ];

      if (!allowedStatuses.includes(req.body?.status)) {
        return res.status(400).json({
          message: "Invalid application status",
        });
      }

      const application = await Application.findById(
        req.params.id
      ).populate("job");

      if (
        !application ||
        !application.job ||
        application.job.recruiter?.toString() !==
          req.user._id.toString()
      ) {
        return res.status(404).json({
          message: "Application not found or not yours",
        });
      }

      // Avoid repeated status changes.
      if (application.status === req.body.status) {
        return res.json({
          message: "Application already has this status",
          application,
        });
      }

      // Update application status.
      application.status = req.body.status;

      application.statusHistory.push({
        status: req.body.status,
        changedAt: new Date(),
      });

      await application.save();

      // Notify the applicant.
      await Notification.create({
        user: application.applicant,

        type:
          req.body.status === "accepted"
            ? "application_accepted"
            : req.body.status === "rejected"
              ? "application_rejected"
              : "application_reviewed",

        message:
          `Your application for ${application.job.title} ` +
          `is now ${req.body.status}`,

        relatedJob: application.job._id,
        relatedApplication: application._id,
      });

      await application.populate(
        "applicant",
        "name email phone location skills education experience"
      );

      await application.populate(
        "cv",
        "fileName extractedSkills"
      );

      return res.json({
        message: "Application status updated",
        application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 5. RECRUITER - DOWNLOAD ORIGINAL CV
// ==========================================

router.get(
  "/:id/cv",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      const application = await Application.findById(
        req.params.id
      )
        .populate("job")
        .populate("cv");

      if (
        !application ||
        !application.job ||
        application.job.recruiter?.toString() !==
          req.user._id.toString() ||
        !application.cv
      ) {
        return res.status(404).json({
          message: "CV not found or access denied",
        });
      }

      // Use the original CV linked to this application.
      const filePath = path.resolve(
        "uploads",
        path.basename(application.cv.fileUrl)
      );

      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          message: "CV file is unavailable",
        });
      }

      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      return res.download(
        filePath,
        application.cv.fileName,
        (error) => {
          if (error && !res.headersSent) {
            next(error);
          }
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;




