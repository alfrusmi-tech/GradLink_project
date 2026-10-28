import express from "express";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { companyCreateRules, companyUpdateRules } from "../validators/companyValidators.js";

const router = express.Router();

const fields = ["name", "description", "industry", "website", "location", "companySize", "foundedYear"];
const pick = (body) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

router.post("/", protect, authorize("recruiter"), companyCreateRules, validate, async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ message: "Company name is required" });
    if (await Company.exists({ owner: req.user._id })) return res.status(409).json({ message: "You already have a company profile" });
    const company = await Company.create({ ...pick(req.body), owner: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { company: company._id });
    res.status(201).json(company);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Company not found" });
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) { next(error); }
});

router.put("/:id", protect, authorize("recruiter"), companyUpdateRules, validate, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Company not found" });
    const company = await Company.findOne({ _id: req.params.id, owner: req.user._id });
    if (!company) return res.status(404).json({ message: "Company not found or not yours" });
    Object.assign(company, pick(req.body));
    await company.save();
    res.json(company);
  } catch (error) { next(error); }
});

export default router;

