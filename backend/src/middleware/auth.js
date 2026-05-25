// src/middleware/auth.js
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { config } from "../config/index.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/Bearer\s*/, "");
  if (!token) return next(createError(401, "Not authorized, token missing"));

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return next(createError(401, "User not found"));
    next();
  } catch (err) {
    next(createError(401, "Token invalid or expired"));
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(createError(403, "Forbidden – insufficient role"));
  }
  next();
};
