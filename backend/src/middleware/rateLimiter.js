// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * Create a rate limiter.
 * @param {Object} options - Options to override defaults.
 *   defaults: 100 requests per 15 minutes, standard headers.
 */
export const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  };
  return rateLimit({ ...defaults, ...options });
};
