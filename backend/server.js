import express from "express";

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
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
