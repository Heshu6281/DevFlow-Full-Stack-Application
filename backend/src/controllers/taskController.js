const pool = require("../config/db");

const {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} = require("../validators/taskValidator");

// =========================
// CREATE TASK
// =========================
const createTask = async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;

    const {
      project_id,
      assigned_to = null,
      title,
      description = "",
      priority = "Medium",
      status = "To Do",
      progress = 0,
      due_date = null,
    } = value;

    // Check that the project belongs to the logged-in user
    const [projects] = await pool.query(
      `SELECT id
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [project_id, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check assigned user exists
    if (assigned_to !== null && assigned_to !== undefined) {
      const [users] = await pool.query(
        `SELECT id
         FROM users
         WHERE id = ?`,
        [assigned_to]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO tasks
       (
         project_id,
         assigned_to,
         title,
         description,
         priority,
         status,
         progress,
         due_date
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        assigned_to || null,
        title,
        description,
        priority,
        status,
        progress,
        due_date || null,
      ]
    );

    const [tasks] = await pool.query(
      `SELECT
         t.*,
         p.name AS project_name,
         u.name AS assigned_user_name,
         u.email AS assigned_user_email
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND p.user_id = ?`,
      [result.insertId, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: tasks[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// GET ALL TASKS
// =========================
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      search,
      status,
      priority,
      project_id,
      assigned_to,
    } = req.query;

    let query = `
      SELECT
        t.*,
        p.name AS project_name,
        u.name AS assigned_user_name,
        u.email AS assigned_user_email
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE p.user_id = ?
    `;

    const values = [userId];

    // Search by title or description
    if (search) {
      query += `
        AND (
          t.title LIKE ?
          OR t.description LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      values.push(searchValue, searchValue);
    }

    // Filter by status
    if (status) {
      query += ` AND t.status = ?`;
      values.push(status);
    }

    // Filter by priority
    if (priority) {
      query += ` AND t.priority = ?`;
      values.push(priority);
    }

    // Filter by project
    if (project_id) {
      query += ` AND t.project_id = ?`;
      values.push(project_id);
    }

    // Filter by assigned user
    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      values.push(assigned_to);
    }

    query += ` ORDER BY t.created_at DESC`;

    const [tasks] = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// GET TASK BY ID
// =========================
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [tasks] = await pool.query(
      `SELECT
         t.*,
         p.name AS project_name,
         u.name AS assigned_user_name,
         u.email AS assigned_user_email
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: tasks[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// UPDATE TASK
// =========================
const updateTask = async (req, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    // Check task belongs to logged-in user's project
    const [existingTasks] = await pool.query(
      `SELECT
         t.id,
         t.project_id
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (existingTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // If project is being changed,
    // verify that the new project belongs to this user
    if (value.project_id !== undefined) {
      const [projects] = await pool.query(
        `SELECT id
         FROM projects
         WHERE id = ? AND user_id = ?`,
        [value.project_id, userId]
      );

      if (projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }
    }

    // If task is being assigned,
    // verify that assigned user exists
    if (
      value.assigned_to !== undefined &&
      value.assigned_to !== null
    ) {
      const [users] = await pool.query(
        `SELECT id
         FROM users
         WHERE id = ?`,
        [value.assigned_to]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      "project_id",
      "assigned_to",
      "title",
      "description",
      "priority",
      "status",
      "progress",
      "due_date",
    ];

    allowedFields.forEach((field) => {
      if (value[field] !== undefined) {
        // IMPORTANT:
        // Prefix every task column with t.
        // This prevents ambiguous column errors
        // when JOINing projects.
        fields.push(`t.${field} = ?`);

        if (
          (field === "due_date" || field === "assigned_to") &&
          (value[field] === "" || value[field] === null)
        ) {
          values.push(null);
        } else {
          values.push(value[field]);
        }
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    values.push(id, userId);

    await pool.query(
      `UPDATE tasks t
       JOIN projects p ON t.project_id = p.id
       SET ${fields.join(", ")}
       WHERE t.id = ? AND p.user_id = ?`,
      values
    );

    const [updatedTasks] = await pool.query(
      `SELECT
         t.*,
         p.name AS project_name,
         u.name AS assigned_user_name,
         u.email AS assigned_user_email
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTasks[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// DELETE TASK
// =========================
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check task belongs to logged-in user's project
    const [tasks] = await pool.query(
      `SELECT t.id
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await pool.query(
      `DELETE t
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// UPDATE TASK STATUS
// =========================
const updateTaskStatus = async (req, res, next) => {
  try {
    const { error, value } = updateTaskStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = value;

    // Check task belongs to logged-in user's project
    const [tasks] = await pool.query(
      `SELECT t.id
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only update the task status
    await pool.query(
      `UPDATE tasks t
       JOIN projects p ON t.project_id = p.id
       SET t.status = ?
       WHERE t.id = ? AND p.user_id = ?`,
      [status, id, userId]
    );

    const [updatedTasks] = await pool.query(
      `SELECT
         t.*,
         p.name AS project_name,
         u.name AS assigned_user_name,
         u.email AS assigned_user_email
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTasks[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// EXPORT CONTROLLERS
// =========================
module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};