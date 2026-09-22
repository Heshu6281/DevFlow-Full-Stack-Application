const { GoogleGenAI } = require("@google/genai");
const db = require("../config/db");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =========================
// AI TASK GENERATOR
// =========================
const generateTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { projectId, prompt } = req.body;

    if (!projectId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "projectId and prompt are required",
      });
    }

    const [projects] = await db.query(
      `SELECT id, name, description
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [projectId, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projects[0];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are an AI project management assistant.

Project Name:
${project.name}

Project Description:
${project.description || "No description provided"}

User Request:
${prompt}

Generate exactly 5 practical development tasks.

Each task must contain:
- title
- description
- priority
- status
- progress

Rules:
- priority must be exactly "High", "Medium", or "Low"
- status must be exactly "To Do"
- progress must be exactly 0
- Do not include project_id
- Do not include assigned_to

Return ONLY valid JSON:

{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "High",
      "status": "To Do",
      "progress": 0
    }
  ]
}
`,
    });

    const aiText = response.text;

    let parsedData;

    try {
      const cleanedText = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Gemini JSON parsing error:",
        parseError.message
      );

      console.error("Gemini response:", aiText);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid response",
      });
    }

    return res.status(200).json({
      success: true,
      message: "AI tasks generated successfully",
      data: {
        projectId: project.id,
        projectName: project.name,
        tasks: parsedData.tasks,
      },
    });
  } catch (error) {
    console.error(
      "Gemini task generation error:",
      error.message
    );

    next(error);
  }
};

// =========================
// CREATE AI GENERATED TASKS
// =========================
const createGeneratedTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      projectId,
      tasks,
      assigned_to = null,
    } = req.body;

    // Validate request
    if (
      !projectId ||
      !Array.isArray(tasks) ||
      tasks.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "projectId and a non-empty tasks array are required",
      });
    }

    // Check project ownership
    const [projects] = await db.query(
      `SELECT id, name
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [projectId, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check assigned user if provided
    if (assigned_to !== null) {
      const [users] = await db.query(
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

    const createdTasks = [];

    // Insert each generated task
    for (const task of tasks) {
      if (!task.title || !task.description) {
        continue;
      }

      const priority = ["High", "Medium", "Low"].includes(
        task.priority
      )
        ? task.priority
        : "Medium";

      const [result] = await db.query(
        `INSERT INTO tasks
         (
           project_id,
           assigned_to,
           title,
           description,
           priority,
           status,
           progress
         )
         VALUES (?, ?, ?, ?, ?, 'To Do', 0)`,
        [
          projectId,
          assigned_to,
          task.title,
          task.description,
          priority,
        ]
      );

      createdTasks.push({
        id: result.insertId,
        project_id: projectId,
        assigned_to,
        title: task.title,
        description: task.description,
        priority,
        status: "To Do",
        progress: 0,
      });
    }

    if (createdTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid tasks were provided",
      });
    }

    return res.status(201).json({
      success: true,
      message: "AI-generated tasks created successfully",
      count: createdTasks.length,
      data: createdTasks,
    });
  } catch (error) {
    console.error(
      "Creating AI-generated tasks error:",
      error.message
    );

    next(error);
  }
};

module.exports = {
  generateTasks,
  createGeneratedTasks,
};