import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";

// ==============================
// IMPORT ROUTES
// ==============================
import todoRoutes from "./routes/todo.js";
import authRoutes from "./routes/auth.js";
import leaveRoutes from "./routes/leave.js"; // ✅ IMPORTANT

dotenv.config();

const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(cors());
app.use(express.json());

// ==============================
// ENV VARIABLES
// ==============================
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000;

// ❗ SAFETY CHECK
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

// ==============================
// MONGO CONNECTION
// ==============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

const conn = mongoose.connection;
let bucket;

conn.once("open", () => {
  console.log("GridFS Bucket Ready ✔");
  bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// ==============================
// MULTER MEMORY STORAGE
// ==============================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==============================
// TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Faculty Backend is running 🚀");
});

// ==============================
// REGISTER ROUTES
// ==============================
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/leave", leaveRoutes); // ✅ THIS FIXES DELETE / UPDATE

// ==============================
// SYLLABUS ROUTES
// ==============================
app.post("/syllabus/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/syllabus/list", async (req, res) => {
  const files = await conn.db
    .collection("uploads.files")
    .find()
    .sort({ uploadDate: -1 })
    .toArray();

  res.json({ success: true, files });
});

app.get("/syllabus/pdf/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await conn.db
      .collection("uploads.files")
      .findOne({ _id: fileId });

    if (!file) return res.status(404).send("File not found");

    res.set({
      "Content-Type": file.contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(400).send("Invalid file ID");
  }
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
