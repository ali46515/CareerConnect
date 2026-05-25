// src/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import createError from "http-errors";
import User from "../models/User.js";
import { config } from "../config/index.js";
import { validateBody } from "../middleware/validate.js";
import { sendEmail } from "../services/email.js";

const router = express.Router();

// Validation schemas (using Joi for brevity)
import Joi from "joi";
const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("seeker", "recruiter").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Helper to create JWT tokens
const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Register
router.post(
  "/register",
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { fullName, email, password, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return next(createError(409, "User already exists"));

      // create verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const user = new User({
        fullName,
        email,
        password,
        role,
        emailVerificationToken,
        isVerified: false,
      });
      await user.save();

      // Send verification email (simple link)
      const verificationUrl = `${config.clientUrl}/verify-email?token=${emailVerificationToken}`;
      await sendEmail({
        to: email,
        subject: "Verify your CareerConnect account",
        html: `<p>Hello ${fullName},</p><p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
      });

      res.status(201).json({ message: "Registration successful. Check your email to verify." });
    } catch (err) {
      next(err);
    }
  }
);

// Email verification endpoint
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return next(createError(400, "Invalid token"));
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) return next(createError(400, "Invalid or expired token"));
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
});

// Login
router.post(
  "/login",
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) return next(createError(401, "Invalid credentials"));
      const match = await user.comparePassword(password);
      if (!match) return next(createError(401, "Invalid credentials"));
      if (!user.isVerified) return next(createError(403, "Please verify your email first"));

      const { accessToken, refreshToken } = generateTokens(user);
      // httpOnly cookie for refresh token
      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({ accessToken });
    } catch (err) {
      next(err);
    }
  }
);

// Refresh token endpoint
router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(createError(401, "Refresh token missing"));
    const payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(payload.id);
    if (!user) return next(createError(401, "User not found"));
    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    res
      .cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken });
  } catch (err) {
    next(err);
  }
});

// Logout – clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

// ----------- Password Reset Flow -----------
// Request password reset – send email with token link
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return next(createError(404, "User not found"));

      const resetToken = crypto.randomBytes(32).toString("hex");
      // store hashed token & expiration on user document
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: email,
        subject: "CareerConnect – Password Reset",
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password. This link expires in 1 hour.</p>`,
      });

      res.json({ message: "Password reset email sent" });
    } catch (err) {
      next(err);
    }
  }
);

// Reset password – verify token & set new password
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      const hashed = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: Date.now() },
      });
      if (!user) return next(createError(400, "Invalid or expired reset token"));

      user.password = newPassword; // pre‑save hook will hash it
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
