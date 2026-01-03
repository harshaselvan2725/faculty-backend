import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import Achievement from "../models/Achievement.js";

const router = express.Router();

// ===============================
// MULTER (MEMORY STORAGE – SAME AS SYLLABUS)
// ===============================
const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// GRIDFS BUCKET
// ===============================
const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
};

// ===============================
// GET ACHIEVEMENTS
// ===============================
router.get("/", async (req, res) => {
  const list = await Achievement.find().sort({ createdAt: -1 });
  res.json(list);
});

// ===============================
// ADD ACHIEVEMENT + CERTIFICATE (GRIDFS)
// ===============================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file ? "YES" : "NO");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Certificate required",
      });
    }

    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      const achievement = await Achievement.create({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });

      res.json({ success: true, achievement });
    });
  } catch (err) {
    console.error("❌ ACHIEVEMENT UPLOAD ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// DELETE ACHIEVEMENT + FILE
// ===============================
router.delete("/:id", async (req, res) => {
  const ach = await Achievement.findById(req.params.id);
  if (!ach) return res.json({ success: true });

  const bucket = getBucket();
  await bucket.delete(ach.fileId);
  await Achievement.findByIdAndDelete(req.params.id);

  res.json({ success: true });
});

export default router;
