// Client-side validation helpers.
// Each validate* function returns an object like { fieldName: "message" }.
// An empty object means the form is valid.
// The rules mirror the server rules in server/validators/.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// The server returns keys such as "requiredSkills[0]";
// show them under the parent field.
export const normalizeServerErrors = (errors) => {
  const result = {};

  Object.entries(errors || {}).forEach(([key, message]) => {
    const field = key.replace(/\[\d+\]$/, "");
    if (!result[field]) result[field] = message;
  });

  return result;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";

  if (!password) errors.password = "Password is required";

  return errors;
};

export const validateRegister = ({ name, email, password }) => {
  const errors = {};

  const cleanName = name.trim();
  if (!cleanName) errors.name = "Name is required";
  else if (cleanName.length < 2 || cleanName.length > 60) {
    errors.name = "Name must be between 2 and 60 characters";
  }

  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6 || password.length > 72) {
    errors.password = "Password must be between 6 and 72 characters";
  } else if (!/[A-Za-z]/.test(password)) {
    errors.password = "Password must contain at least one letter";
  } else if (!/\d/.test(password)) {
    errors.password = "Password must contain at least one number";
  }

  return errors;
};

export const validateJob = (form) => {
  const errors = {};

  const title = form.title.trim();
  if (!title) errors.title = "Job title is required";
  else if (title.length < 3 || title.length > 100) {
    errors.title = "Job title must be between 3 and 100 characters";
  }

  const description = form.description.trim();
  if (!description) errors.description = "Job description is required";
  else if (description.length < 20) {
    errors.description = "Description must be at least 20 characters";
  } else if (description.length > 5000) {
    errors.description = "Description must be 5000 characters or fewer";
  }

  const skills = splitList(form.requiredSkills);
  if (skills.length === 0) errors.requiredSkills = "Add at least one required skill";
  else if (skills.length > 30) errors.requiredSkills = "Add no more than 30 skills";
  else if (skills.some((skill) => skill.length > 50)) {
    errors.requiredSkills = "Each skill must be 50 characters or fewer";
  }

  const location = form.location.trim();
  if (!location) errors.location = "Location is required";
  else if (location.length > 100) errors.location = "Location must be 100 characters or fewer";

  const hasMin = form.salaryMin !== "";
  const hasMax = form.salaryMax !== "";

  if (hasMin && (Number.isNaN(Number(form.salaryMin)) || Number(form.salaryMin) < 0)) {
    errors.salaryMin = "Minimum salary must be a positive number";
  }
  if (hasMax && (Number.isNaN(Number(form.salaryMax)) || Number(form.salaryMax) < 0)) {
    errors.salaryMax = "Maximum salary must be a positive number";
  }
  if (
    hasMin &&
    hasMax &&
    !errors.salaryMin &&
    !errors.salaryMax &&
    Number(form.salaryMax) < Number(form.salaryMin)
  ) {
    errors.salaryMax = "Maximum salary must be greater than minimum salary";
  }

  return errors;
};