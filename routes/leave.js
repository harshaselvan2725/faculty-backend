import express from "express";
import Leave from "../models/Leave.js";

const router = express.Router();

// ==============================
// APPLY LEAVE
// POST /leave
// ==============================
router.post("/", async (req, res) => {
  try {
    const { userId, reason, fromDate, toDate } = req.body;

    if (!userId || !reason || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const leave = new Leave({
      userId,
      reason,
      fromDate,
      toDate,
    });

    await leave.save();

    res.json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (err) {
    console.error("Apply Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save leave",
    });
  }
});

// ==============================
// GET LEAVES BY USER
// GET /leave/:userId
// ==============================
router.get("/:userId", async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves,
    });
  } catch (err) {
    console.error("Fetch Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
    });
  }
});

// ==============================
// UPDATE LEAVE
// PUT /leave/:id
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;

    await Leave.findByIdAndUpdate(
      req.params.id,
      { reason, fromDate, toDate },
      { new: true }
    );

    res.json({
      success: true,
      message: "Leave updated successfully",
    });
  } catch (err) {
    console.error("Update Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update leave",
    });
  }
});

// ==============================
// DELETE LEAVE
// DELETE /leave/:id
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (err) {
    console.error("Delete Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete leave",
    });
  }
});

export default router;
