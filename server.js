import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ExcelJS from "exceljs";

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

// ================= CREATE APP =================
const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

// ================= ENV =================
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// ================= DB =================
mongoose
  .connect(MONGO_URI)
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
app.use("/syllabus", syllabusRoutes); // ✅ IMPORTANT

// ================= CLASS MANAGEMENT =================

// ➕ Create Class
app.post("/class", async (req, res) => {
  try {
    const cls = await ClassModel.create({ name: req.body.name });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get All Classes
app.get("/class", async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ _id: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get Single Class
app.get("/class/:id", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧩 Update Columns
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

// ➕ Add Student
app.post("/student", async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get Students
app.get("/students/:classId", async (req, res) => {
  try {
    const students = await StudentModel.find({
      classId: req.params.classId,
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏ Edit Student
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

// 🗑 Delete Student
app.delete("/student/:id", async (req, res) => {
  try {
    await StudentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= EXPORT TO EXCEL =================
app.get("/class/:classId/export", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    const students = await StudentModel.find({
      classId: req.params.classId,
    });

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
    console.error("Excel Error:", err.message);
    res.status(500).json({ error: "Excel export failed" });
  }
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
