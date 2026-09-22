const db = require("../config/db");

const {
  createProjectSchema,
  updateProjectSchema,
} = require("../validators/projectValidator");

// CREATE PROJECT
const createProject = async (req, res, next) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;

    const {
      name,
      description = "",
      status,
      progress,
      technologies,
    } = value;

    const [result] = await db.query(
      `INSERT INTO projects
       (user_id, name, description, status, progress, technologies)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description,
        status,
        progress,
        JSON.stringify(technologies),
      ]
    );

    const [newProject] = await db.query(
      `SELECT *
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [result.insertId, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject[0],
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL PROJECTS
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [projects] = await db.query(
      `SELECT
         p.*,
         u.name AS user_name,
         u.email AS user_email
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.id DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// GET PROJECT BY ID
const getProjectById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [projects] = await db.query(
      `SELECT
         p.*,
         u.name AS user_name,
         u.email AS user_email
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: projects[0],
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROJECT
const updateProject = async (req, res, next) => {
  try {
    const { error, value } = updateProjectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    // Check that project belongs to logged-in user
    const [existingProject] = await db.query(
      `SELECT id
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const fields = [];
    const values = [];

    if (value.name !== undefined) {
      fields.push("name = ?");
      values.push(value.name);
    }

    if (value.description !== undefined) {
      fields.push("description = ?");
      values.push(value.description);
    }

    if (value.status !== undefined) {
      fields.push("status = ?");
      values.push(value.status);
    }

    if (value.progress !== undefined) {
      fields.push("progress = ?");
      values.push(value.progress);
    }

    if (value.technologies !== undefined) {
      fields.push("technologies = ?");
      values.push(JSON.stringify(value.technologies));
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    values.push(id, userId);

    await db.query(
      `UPDATE projects
       SET ${fields.join(", ")}
       WHERE id = ? AND user_id = ?`,
      values
    );

    const [updatedProject] = await db.query(
      `SELECT *
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject[0],
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PROJECT
const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [existingProject] = await db.query(
      `SELECT id
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await db.query(
      `DELETE FROM projects
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};