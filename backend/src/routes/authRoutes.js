const express = require("express");

const {
  register,
  login,
  logout,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.put("/change-password", authMiddleware, changePassword);

// Protected logout route
router.post("/logout", authMiddleware, logout);

module.exports = router;