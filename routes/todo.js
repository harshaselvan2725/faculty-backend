import express from "express";
import Todo from "../models/Todo.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ADD TASK
router.post("/add", auth, async (req, res) => {
  const { task, priority } = req.body;

  try {
    const todo = await Todo.create({
      userId: req.user.id,
      task,
      priority,
    });

    res.json({ message: "Task Added", todo });
  } catch (err) {
    res.status(500).json({ error: "Error adding task" });
  }
});

// GET MY TASKS
router.get("/list", auth, async (req, res) => {
  try {
    const tasks = await Todo.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

// MARK AS DONE
router.put("/done/:id", auth, async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );

    res.json({ message: "Task Marked as Done", task: updated });
  } catch (err) {
    res.status(500).json({ error: "Error updating task" });
  }
});

// DELETE TASK
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Task Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting task" });
  }
});

export default router;
