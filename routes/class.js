import express from "express";
import Class from "../models/Class.js";
import Student from "../models/Student.js";

const router = express.Router();

/* 🔹 Create Class */
router.post("/class", async (req, res) => {
  const cls = await Class.create({
    name: req.body.name,
    columns: ["registerNo", "name", "phone"],
  });
  res.json(cls);
});

/* 🔹 Get All Classes */
router.get("/class", async (req, res) => {
  const classes = await Class.find();
  res.json(classes);
});

/* 🔹 Get Class By ID */
router.get("/class/:id", async (req, res) => {
  const cls = await Class.findById(req.params.id);
  res.json(cls);
});

/* 🔹 Update Columns */
router.put("/class/:id/columns", async (req, res) => {
  const cls = await Class.findByIdAndUpdate(
    req.params.id,
    { columns: req.body.columns },
    { new: true }
  );
  res.json(cls);
});

/* 🔹 Add Student */
router.post("/student", async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
});

/* 🔹 Get Students */
router.get("/students/:classId", async (req, res) => {
  const students = await Student.find({ classId: req.params.classId });
  res.json(students);
});

export default router;
