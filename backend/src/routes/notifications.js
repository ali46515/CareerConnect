// src/routes/notifications.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get logged‑in user's notifications (latest first, paginated)
router.get("/", protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments({ user: req.user.id });
    res.json({ total, page: Number(page), limit: Number(limit), notifications });
  } catch (err) {
    next(err);
  }
});

// Mark a notification as read
router.patch("/:id/read", protect, async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json(notif);
  } catch (err) {
    next(err);
  }
});

export default router;
