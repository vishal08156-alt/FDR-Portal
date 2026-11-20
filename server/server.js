
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import sequelize from "./config/database.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AICTE FDR Management API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
    database: "Connected",
    timestamp: new Date().toISOString(),
  });
});

// Connect database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("MySQL database connected successfully!");

    app.listen(PORT, () => {
      console.log(`FDR Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
