// src/utils/asyncHandler.js
/**
 * Wrap async route handlers to forward errors to Express error middleware.
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
