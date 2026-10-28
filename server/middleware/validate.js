import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = {};

  for (const error of result.array({ onlyFirstError: true })) {
    if (error.path && !errors[error.path]) {
      errors[error.path] = error.msg;
    }
  }

  return res.status(400).json({
    message: Object.values(errors)[0] || "Validation failed",
    errors,
  });
};