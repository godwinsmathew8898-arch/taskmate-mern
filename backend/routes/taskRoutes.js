import express from "express";

import {
  createTask,
  getTasks,
} from "../controllers/taskController.js";

const router = express.Router();

// POST /api/tasks
router.post("/", createTask);

// GET /api/tasks
router.get("/", getTasks);

// Get one task
router.get("/:id", getTaskById);

export default router;