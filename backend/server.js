import express from "express";
import dotenv  from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "TaskMate backend is running",
  });
});

app.get("/api/about", (req, res) => {
  res.status(200).json({
    about: {
      app: "TaskMate",
      version: "1.0.0",
      developer: "Godwin-Dev",
    },
  });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
  });
};

startServer();
