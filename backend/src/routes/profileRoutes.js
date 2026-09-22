const express = require("express");

const {
  getProfile,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get profile of the currently authenticated user
router.get("/", authMiddleware, getProfile);

module.exports = router;