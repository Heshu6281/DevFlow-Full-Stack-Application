const express = require("express");

const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getSkills);

router.post("/", authMiddleware, createSkill);

router.put("/:id", authMiddleware, updateSkill);

router.delete("/:id", authMiddleware, deleteSkill);

module.exports = router;