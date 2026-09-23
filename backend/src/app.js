const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityRoutes = require("./routes/activityRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");
const notificationRoutes = require("./routes/notificationRoutes");
const skillRoutes = require("./routes/skillRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// ==================================================
// AUTH
// ==================================================
app.use("/api/auth", authRoutes);

app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);
app.use("/api/activity", authMiddleware, activityRoutes);
app.use("/api/settings", authMiddleware, settingsRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/profile/skills", authMiddleware, skillRoutes);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT 1 AS connected"
    );

    res.status(200).json({
      success: true,
      message: "DevFlow API is running",
      database:
        result[0].connected === 1
          ? "connected"
          : "not connected",
    });
  } catch (error) {
    console.error(
      "Database connection error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "API is running but database connection failed",
    });
  }
});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use(errorHandler);

// ==================================================
// SERVER
// ==================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DevFlow API running on port ${PORT}`);
});