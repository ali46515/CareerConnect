// src/routes/admin.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorizeRoles("admin"));

// Dashboard stats (users, jobs, applications)
router.get("/stats", async (req, res, next) => {
  try {
    const [userCount, jobCount] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
    ]);
    const applicationCount = await (await import("../models/Application.js")).default.countDocuments();
    res.json({ userCount, jobCount, applicationCount });
  } catch (err) {
    next(err);
  }
});

// Manage users – list, update role, ban (soft delete)
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ["seeker", "recruiter", "admin"];
    if (!allowed.includes(role)) return next(new Error("Invalid role"));
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    // Soft delete – keep data but mark disabled
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );
    res.json({ message: "User disabled", user });
  } catch (err) {
    next(err);
  }
});

// Manage jobs – list, deactivate, delete
router.get("/jobs", async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("company", "name");
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.put("/jobs/:id/deactivate", async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.delete("/jobs/:id", async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    next(err);
  }
});

// View all notifications (admin can audit)
router.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

export default router;
