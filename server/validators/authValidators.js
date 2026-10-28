import { body } from "express-validator";

const emailRule = () =>
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address")
    .bail()
    .toLowerCase();

export const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),

  emailRule(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6, max: 72 })
    .withMessage("Password must be between 6 and 72 characters")
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter")
    .bail()
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  body("role")
    .optional()
    .isIn(["jobseeker", "recruiter"])
    .withMessage("Role must be jobseeker or recruiter"),
];

export const loginRules = [
  emailRule(),
  body("password").notEmpty().withMessage("Password is required"),
];