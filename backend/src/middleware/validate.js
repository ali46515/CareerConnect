// src/middleware/validate.js
import Joi from "joi";
import createError from "http-errors";

export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return next(createError(400, messages));
  }
  next();
};
