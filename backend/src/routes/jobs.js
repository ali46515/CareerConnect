// src/routes/jobs.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { io } from "../server.js";

const router = express.Router();

// Create a new job – recruiter only
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  async (req, res, next) => {
    try {
      const { companyId, ...jobData } = req.body;
      const company = await Company.findById(companyId);
      if (!company) return next(new Error("Company not found"));
      const job = new Job({
        ...jobData,
        company: company._id,
        recruiter: req.user.id,
      });
      await job.save();
      // Notify recruiters followers (real‑time example)
      io.emit("newJob", { jobId: job._id, title: job.title });
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  }
);

// Get list of jobs – public, with filters & pagination
router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      title,
      location,
      remote,
      minSalary,
      maxSalary,
      jobType,
      experienceLevel,
      tags,
    } = req.query;

    const filter = { isActive: true };
    if (title) filter.title = new RegExp(title, "i");
    if (location) filter.location = new RegExp(location, "i");
    if (remote !== undefined) filter.remote = remote === "true";
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (minSalary) filter.salaryMin = { $gte: Number(minSalary) };
    if (maxSalary) filter.salaryMax = { $lte: Number(maxSalary) };
    if (tags) filter.tags = { $in: tags.split(",") };

    const jobs = await Job.find(filter)
      .populate("company", "name logo")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), jobs });
  } catch (err) {
    next(err);
  }
});

// Get single job detail (public)
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", "name logo description");
    if (!job) return next(new Error("Job not found"));
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// Update a job – recruiter who created it
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res, next) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return next(new Error("Job not found"));
      if (job.recruiter.toString() !== req.user.id)
        return next(new Error("Not authorized to edit this job"));
      Object.assign(job, req.body);
      await job.save();
      res.json(job);
    } catch (err) {
      next(err);
    }
  }
);

// Delete a job – recruiter or admin
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter", "admin"),
  async (req, res, next) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return next(new Error("Job not found"));
      // recruiter can delete only his own job unless admin
      if (
        req.user.role === "recruiter" &&
        job.recruiter.toString() !== req.user.id
      )
        return next(new Error("Not authorized to delete this job"));
      await job.remove();
      res.json({ message: "Job removed" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
