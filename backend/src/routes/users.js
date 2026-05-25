// src/routes/users.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import User from "../models/User.js";
import multer from "multer";
import { uploadToCloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Multer config for profile image / resume uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get current user profile
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update profile (basic fields + optional image / resume)
router.put(
  "/me",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const updates = { ...req.body };

      // If files uploaded, push to Cloudinary
      if (req.files?.profileImage) {
        const result = await uploadToCloudinary(
          req.files.profileImage[0].path,
          "careerconnect/profileImages"
        );
        updates.profileImage = result.secure_url;
      }
      if (req.files?.resume) {
        const result = await uploadToCloudinary(
          req.files.resume[0].path,
          "careerconnect/resumes"
        );
        updates.resume = result.secure_url;
      }

      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// Admin: list all users (optional pagination)
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
