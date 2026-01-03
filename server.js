import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import fs from "fs";

// ================= ROUTES =================
import todoRoutes from "./routes/todo.js";
import authRoutes from "./routes/auth.js";
import leaveRoutes from "./routes/leave.js";
import achievementRoutes from "./routes/achievements.js";
import syllabusRoutes from "./routes/syllabus.js";

// ================= MODELS =================
import ClassModel from "./models/Class.js";
import StudentModel from "./models/Student.js";

dotenv.config();

const app = express();

// ================= ENSURE UPLOADS =================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Faculty Backend Running 🚀" });
});

// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/leave", leaveRoutes);
app.use("/achievements", achievementRoutes);
app.use("/syllabus", syllabusRoutes);

// ================= STATIC =================
app.use("/uploads", express.static("uploads"));

// ================= CLASS =================
app.post("/class", async (req, res) => {
  try {
    const cls = await ClassModel.create({ name: req.body.name });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/class", async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ _id: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/class/:id", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/class/:id/columns", async (req, res) => {
  try {
    const cls = await ClassModel.findByIdAndUpdate(
      req.params.id,
      { columns: req.body.columns },
      { new: true }
    );
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STUDENTS =================
app.post("/student", async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message }); // ✅ FIXED
  }
});

app.get("/students/:classId", async (req, res) => {
  try {
    const students = await StudentModel.find({ classId: req.params.classId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/student/:id", async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndUpdate(
      req.params.id,
      { data: req.body.data },
      { new: true }
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/student/:id", async (req, res) => {
  try {
    await StudentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= EXPORT =================
app.get("/class/:classId/export", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    const students = await StudentModel.find({ classId: req.params.classId });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = cls.columns.map((c) => ({
      header: c.toUpperCase(),
      key: c,
      width: 20,
    }));

    students.forEach((s) => sheet.addRow(s.data));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Excel export failed" });
  }
});

// ================= START =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
