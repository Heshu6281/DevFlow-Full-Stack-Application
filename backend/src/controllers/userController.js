const db = require("../config/db");

const {
  createUserSchema,
  updateUserSchema,
} = require("../validators/userValidator");

// ==================================================
// CREATE USER
// ==================================================

const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      name,
      email,
      role = "Software Developer",
    } = value;

    // Check whether email already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users
       (name, email, role)
       VALUES (?, ?, ?)`,
      [name, email, role]
    );

    // Get newly created user
    const [newUser] = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser[0],
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// GET ALL USERS
// ==================================================

const getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// GET USER BY ID
// ==================================================

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// UPDATE USER
// ==================================================

const updateUser = async (req, res, next) => {
  try {
    const { error, value } =
      updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { id } = req.params;

    // Check user exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate email
    if (value.email) {
      const [emailUser] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [value.email, id]
      );

      if (emailUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }
    }

    // Build update fields
    const fields = [];
    const values = [];

    if (value.name !== undefined) {
      fields.push("name = ?");
      values.push(value.name);
    }

    if (value.email !== undefined) {
      fields.push("email = ?");
      values.push(value.email);
    }

    if (value.role !== undefined) {
      fields.push("role = ?");
      values.push(value.role);
    }

    // Safety check
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    values.push(id);

    await db.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    );

    // Get updated user
    const [updatedUser] = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// DELETE USER
// ==================================================

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check user exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};