import { body } from "express-validator";

const buildCompanyRules = (partial) => {
  const name = partial ? body("name").optional() : body("name");
  const currentYear = new Date().getFullYear();

  return [
    name
      .trim()
      .notEmpty()
      .withMessage("Company name is required")
      .bail()
      .isLength({ max: 100 })
      .withMessage("Company name must be 100 characters or fewer"),

    body("description")
      .optional({ values: "falsy" })
      .isLength({ max: 2000 })
      .withMessage("Description must be 2000 characters or fewer"),

    body("industry")
      .optional({ values: "falsy" })
      .isLength({ max: 100 })
      .withMessage("Industry must be 100 characters or fewer"),

    body("website")
      .optional({ values: "falsy" })
      .trim()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("Website must be a valid URL starting with http:// or https://"),

    body("location")
      .optional({ values: "falsy" })
      .isLength({ max: 100 })
      .withMessage("Location must be 100 characters or fewer"),

    body("companySize")
      .optional({ values: "falsy" })
      .isLength({ max: 50 })
      .withMessage("Company size must be 50 characters or fewer"),

    body("foundedYear")
      .optional({ values: "falsy" })
      .isInt({ min: 1800, max: currentYear })
      .withMessage(`Founded year must be between 1800 and ${currentYear}`),
  ];
};

export const companyCreateRules = buildCompanyRules(false);
export const companyUpdateRules = buildCompanyRules(true);
