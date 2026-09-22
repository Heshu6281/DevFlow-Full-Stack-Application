const express = require("express");

const {
  getUserSettings,
  updateUserSettings,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", authMiddleware, getUserSettings);

router.put("/:userId", authMiddleware, updateUserSettings);

module.exports = router;