import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = { user: req.user._id };
    if (req.query.unreadOnly === "true") filter.isRead = false;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);
    res.json({ notifications, unreadCount, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get("/unread-count", async (req, res, next) => {
  try { res.json({ unreadCount: await Notification.countDocuments({ user: req.user._id, isRead: false }) }); }
  catch (error) { next(error); }
});

router.put("/read-all", async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) { next(error); }
});

router.put("/:id/read", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Notification not found" });
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (error) { next(error); }
});

router.delete("/", async (req, res, next) => {
  try { await Notification.deleteMany({ user: req.user._id }); res.json({ message: "All notifications deleted" }); }
  catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Notification not found" });
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (error) { next(error); }
});

export default router;

