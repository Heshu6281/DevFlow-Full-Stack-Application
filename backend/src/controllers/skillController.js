const db = require("../config/db");

// ============================
// GET USER SKILLS
// ============================
const getSkills = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [skills] = await db.query(
      `SELECT
         id,
         skill_name AS name,
         proficiency AS level,
         created_at,
         updated_at
       FROM user_skills
       WHERE user_id = ?
       ORDER BY proficiency DESC, skill_name ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// ADD SKILL
// ============================
const createSkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { name, level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required.",
      });
    }

    const skillName = name.trim();
    const proficiency = Number(level);

    if (
      !Number.isInteger(proficiency) ||
      proficiency < 0 ||
      proficiency > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill level must be between 0 and 100.",
      });
    }

    // Check duplicate skill
    const [existingSkill] = await db.query(
      `SELECT id
       FROM user_skills
       WHERE user_id = ?
         AND LOWER(skill_name) = LOWER(?)`,
      [userId, skillName]
    );

    if (existingSkill.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This skill already exists.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO user_skills
        (user_id, skill_name, proficiency)
       VALUES (?, ?, ?)`,
      [userId, skillName, proficiency]
    );

    const [skills] = await db.query(
      `SELECT
         id,
         skill_name AS name,
         proficiency AS level,
         created_at,
         updated_at
       FROM user_skills
       WHERE id = ?
         AND user_id = ?`,
      [result.insertId, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      data: skills[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// UPDATE SKILL
// ============================
const updateSkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required.",
      });
    }

    const skillName = name.trim();
    const proficiency = Number(level);

    if (
      !Number.isInteger(proficiency) ||
      proficiency < 0 ||
      proficiency > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill level must be between 0 and 100.",
      });
    }

    // Make sure skill belongs to logged-in user
    const [existingSkill] = await db.query(
      `SELECT id
       FROM user_skills
       WHERE id = ?
         AND user_id = ?`,
      [id, userId]
    );

    if (existingSkill.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    // Check duplicate name excluding current skill
    const [duplicateSkill] = await db.query(
      `SELECT id
       FROM user_skills
       WHERE user_id = ?
         AND LOWER(skill_name) = LOWER(?)
         AND id != ?`,
      [userId, skillName, id]
    );

    if (duplicateSkill.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another skill with this name already exists.",
      });
    }

    await db.query(
      `UPDATE user_skills
       SET skill_name = ?,
           proficiency = ?
       WHERE id = ?
         AND user_id = ?`,
      [skillName, proficiency, id, userId]
    );

    const [skills] = await db.query(
      `SELECT
         id,
         skill_name AS name,
         proficiency AS level,
         created_at,
         updated_at
       FROM user_skills
       WHERE id = ?
         AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
      data: skills[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// DELETE SKILL
// ============================
const deleteSkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM user_skills
       WHERE id = ?
         AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};