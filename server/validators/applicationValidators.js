import { body } from "express-validator";

export const applyRules = [
  body("jobId").isMongoId().withMessage("Valid jobId is required"),

  body("coverLetter")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Cover letter must be text")
    .bail()
    .isLength({ max: 2000 })
    .withMessage("Cover letter cannot exceed 2000 characters"),
];