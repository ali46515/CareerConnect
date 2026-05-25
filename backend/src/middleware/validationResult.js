// src/middleware/validationResult.js
import { validationResult } from "express-validator";
import createError from "http-errors";

/**
 * Middleware to return validation errors from express-validator chains.
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => `${e.param}: ${e.msg}`).join(", ");
    return next(createError(400, msg));
  }
  next();
};
