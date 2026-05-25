// src/controllers/adminAnalytics.js
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

/**
 * Returns high‑level platform statistics.
 * Used by admin dashboard – no pagination needed.
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const [totalJobs, totalApplications, totalUsers] = await Promise.all([
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments(),
    ]);

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("job", "title")
      .populate("applicant", "fullName email");

    res.json({ totalJobs, totalApplications, totalUsers, recentJobs, recentApplications });
  } catch (err) {
    next(err);
  }
};
