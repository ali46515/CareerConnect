// src/routes/applications.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import { io } from "../server.js";

const router = express.Router();

// Apply to a job – seeker only
router.post(
  "/apply/:jobId",
  protect,
  authorizeRoles("seeker"),
  async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { coverLetter } = req.body;
      const job = await Job.findById(jobId);
      if (!job) return next(new Error("Job not found"));

      // Prevent duplicate applications
      const exists = await Application.findOne({ job: jobId, applicant: req.user.id });
      if (exists) return next(new Error("Already applied to this job"));

      const application = new Application({
        job: jobId,
        applicant: req.user.id,
        coverLetter,
      });
      await application.save();

      // Increment counter on job
      job.applicationsCount += 1;
      await job.save();

      // Create notification for recruiter
      const notif = new Notification({
        user: job.recruiter,
        type: "application",
        title: "New application",
        body: `${req.user.id} applied to ${job.title}`,
        link: `/recruiter/applications/${jobId}`,
      });
      await notif.save();
      // Real‑time push
      io.to(job.recruiter.toString()).emit("notification", notif);

      res.status(201).json({ message: "Application submitted", application });
    } catch (err) {
      next(err);
    }
  }
);

// Seeker – list own applications
router.get(
  "/my",
  protect,
  authorizeRoles("seeker"),
  async (req, res, next) => {
    try {
      const apps = await Application.find({ applicant: req.user.id })
        .populate("job", "title company")
        .sort({ createdAt: -1 });
      res.json(apps);
    } catch (err) {
      next(err);
    }
  }
);

// Recruiter – view applications for a specific job
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const job = await Job.findById(jobId);
      if (!job) return next(new Error("Job not found"));
      if (job.recruiter.toString() !== req.user.id)
        return next(new Error("Not authorized"));

      const apps = await Application.find({ job: jobId })
        .populate("applicant", "fullName email profileImage")
        .sort({ createdAt: -1 });
      res.json(apps);
    } catch (err) {
      next(err);
    }
  }
);

// Recruiter – update application status (shortlist, reject, interview, etc.)
router.put(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // should be one of enum values
      const application = await Application.findById(id).populate("job");
      if (!application) return next(new Error("Application not found"));
      if (application.job.recruiter.toString() !== req.user.id)
        return next(new Error("Not authorized"));

      application.status = status;
      await application.save();

      // Notify applicant
      const notif = new Notification({
        user: application.applicant,
        type: "application",
        title: "Application status update",
        body: `Your application for ${application.job.title} is now '${status}'.`,
        link: `/seeker/applications/${application._id}`,
      });
      await notif.save();
      io.to(application.applicant.toString()).emit("notification", notif);

      res.json({ message: "Status updated", application });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
