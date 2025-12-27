import express from "express";
import multer from "multer";
import Achievement from "../models/Achievement.js";

const router = express.Router();

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= ROUTES =================

// 📄 Get achievements
router.get("/", async (req, res) => {
  try {
    const list = await Achievement.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add achievement
router.post("/", async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏ Edit achievement
router.put("/:id", async (req, res) => {
  try {
    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📎 Upload certificate
router.post("/upload/:id", upload.single("file"), async (req, res) => {
  try {
    const filePath = `/uploads/${req.file.filename}`;

    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      { certificateUrl: filePath },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑 Delete achievement
router.delete("/:id", async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
