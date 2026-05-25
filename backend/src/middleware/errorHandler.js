// src/middleware/errorHandler.js
import createError from "http-errors";

export const notFound = (req, res, next) => {
  next(createError(404, `🔎 ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };
  res.status(status).json(response);
};
