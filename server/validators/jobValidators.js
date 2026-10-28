import { body } from "express-validator";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];
const LEVELS = ["entry", "junior", "mid", "senior", "lead"];
const STATUSES = ["open", "closed", "draft"];

// partial = true  -> update: எல்லா field உம் optional, ஆனால் அனுப்பினால் சரியாக இருக்க வேண்டும்
// partial = false -> create: தேவையான field கள் கட்டாயம்
const buildJobRules = (partial) => {
  const field = (name) => (partial ? body(name).optional() : body(name));

  return [
    field("title")
      .trim()
      .notEmpty()
      .withMessage("Job title is required")
      .bail()
      .isLength({ min: 3, max: 100 })
      .withMessage("Job title must be between 3 and 100 characters"),

    field("description")
      .trim()
      .notEmpty()
      .withMessage("Job description is required")
      .bail()
      .isLength({ min: 20, max: 5000 })
      .withMessage("Description must be between 20 and 5000 characters"),

    field("location")
      .trim()
      .notEmpty()
      .withMessage("Location is required")
      .bail()
      .isLength({ max: 100 })
      .withMessage("Location must be 100 characters or fewer"),

    field("requiredSkills")
      .isArray({ min: 1, max: 30 })
      .withMessage("Add between 1 and 30 required skills"),

    body("requiredSkills.*")
      .trim()
      .notEmpty()
      .withMessage("Skills cannot be empty")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Each skill must be 50 characters or fewer"),

    body("preferredSkills")
      .optional()
      .isArray({ max: 30 })
      .withMessage("Preferred skills must be a list of up to 30 items"),

    body("preferredSkills.*")
      .trim()
      .isLength({ max: 50 })
      .withMessage("Each skill must be 50 characters or fewer"),

    body("jobType").optional().isIn(JOB_TYPES).withMessage("Invalid job type"),

    body("experienceLevel")
      .optional()
      .isIn(LEVELS)
      .withMessage("Invalid experience level"),

    body("experienceYears")
      .optional({ values: "falsy" })
      .isInt({ min: 0, max: 50 })
      .withMessage("Experience years must be a whole number from 0 to 50"),

    body("salaryMin")
      .optional({ values: "falsy" })
      .isFloat({ min: 0 })
      .withMessage("Minimum salary must be a positive number"),

    body("salaryMax")
      .optional({ values: "falsy" })
      .isFloat({ min: 0 })
      .withMessage("Maximum salary must be a positive number")
      .bail()
      .custom((value, { req }) => {
        const min = req.body.salaryMin;
        const hasMin = min !== undefined && min !== null && min !== "";

        if (hasMin && Number(value) < Number(min)) {
          throw new Error("Maximum salary must be greater than minimum salary");
        }
        return true;
      }),

    body("deadline")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Enter a valid deadline date")
      .bail()
      .custom((value) => {
        // Update இல் deadline சோதனையை route தானே செய்கிறது
        if (!partial && new Date(value) < new Date()) {
          throw new Error("Job deadline cannot be in the past");
        }
        return true;
      }),

    body("status").optional().isIn(STATUSES).withMessage("Invalid job status"),
  ];
};

export const jobCreateRules = buildJobRules(false);
export const jobUpdateRules = buildJobRules(true);
