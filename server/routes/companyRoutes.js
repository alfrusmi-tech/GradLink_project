import express from "express";

const router = express.Router();

// Planned for next build stage:
// POST   /api/companies          - create company profile (recruiter)
// PUT    /api/companies/:id      - edit company profile (recruiter, owner only)
// GET    /api/companies/:id      - view company profile (public)
// GET    /api/companies          - list companies (admin)

export default router;
