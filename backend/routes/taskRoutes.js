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

export default router;