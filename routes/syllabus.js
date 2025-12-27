import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = express.Router();

console.log("✅ syllabus routes loaded");

// ===============================
// MULTER (MEMORY STORAGE)
// ===============================
const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// SAFE GRIDFS BUCKET
// ===============================
const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads", // change to "fs" ONLY if your DB uses fs.files
  });
};

// --------------------
// UPLOAD PDF
// --------------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------
// LIST PDFs
// --------------------
router.get("/list", async (req, res) => {
  try {
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();

    res.json({ success: true, files });
  } catch (err) {
    console.error("LIST ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------
// VIEW PDF
// --------------------
router.get("/pdf/:id", (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("VIEW ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------
// DELETE PDF (POST – GUARANTEED WORKING ✅)
// --------------------
router.post("/delete/:id", async (req, res) => {
  console.log("🔥 POST DELETE HIT:", req.params.id);

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    await bucket.delete(fileId);

    console.log("✅ FILE DELETED FROM GRIDFS");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ POST DELETE ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// --------------------
// DELETE PDF (DELETE – OPTIONAL, may fail on Render)
// --------------------
router.delete("/delete/:id", async (req, res) => {
  console.log("⚠️ DELETE METHOD HIT (may fail on Render)");

  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    await bucket.delete(fileId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
