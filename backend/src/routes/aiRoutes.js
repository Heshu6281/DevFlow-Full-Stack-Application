const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";

// ==================================================
// WAIT HELPER
// ==================================================

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ==================================================
// GET DEVFLOW CONTEXT
// ==================================================

const getDevFlowContext = async (userId) => {
  const [projects] = await db.query(
    `SELECT
       id,
       name,
       description,
       status,
       progress
     FROM projects
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
    [userId]
  );

  const [tasks] = await db.query(
    `SELECT
       t.id,
       t.title,
       t.status,
       t.priority,
       t.progress,
       t.due_date,
       p.name AS project_name
     FROM tasks t
     INNER JOIN projects p ON t.project_id = p.id
     WHERE p.user_id = ?
     ORDER BY t.updated_at DESC
     LIMIT 50`,
    [userId]
  );

  return {
    projects,
    tasks,
  };
};

// ==================================================
// GEMINI REQUEST WITH RETRY
// ==================================================

const generateGeminiResponse = async (message, context) => {
  const maxAttempts = 3;

  const prompt = `
You are DevFlow AI, a helpful AI assistant for developers.

Your job is to help the user with:
- Projects
- Tasks
- Productivity
- Programming
- Debugging
- Software development

Here is the user's current DevFlow data:

PROJECTS:
${JSON.stringify(context.projects, null, 2)}

TASKS:
${JSON.stringify(context.tasks, null, 2)}

IMPORTANT:
- Use the DevFlow data when the user asks about their projects, tasks, progress, or productivity.
- Do not invent projects, tasks, progress values, or other personal DevFlow data.
- If the requested information is not available in the provided data, clearly say that it is not available.
- For general programming questions, answer normally.
- Keep answers clear, practical, and concise.

USER MESSAGE:
${message}
`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            "You are DevFlow AI. Give accurate, practical and concise answers. " +
            "Respect the user's actual DevFlow data provided in the prompt.",
          thinkingConfig: {
            thinkingLevel: "low",
          },
        },
      });

      return response.text;
    } catch (error) {
      const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

      const isRetryable =
        status === 429 ||
        status === 408 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      console.error(
        `Gemini attempt ${attempt}/${maxAttempts} failed:`,
        error.message
      );

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt - 1);

      console.log(
        `Retrying Gemini request in ${delay}ms...`
      );

      await wait(delay);
    }
  }
};

// ==================================================
// GEMINI AI CHAT
// ==================================================

router.post(
  "/chat",
  authMiddleware,
  async (req, res) => {
    try {
      const { message } = req.body;

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const userId = req.user.userId;

      const context = await getDevFlowContext(userId);

      const aiMessage = await generateGeminiResponse(
        message.trim(),
        context
      );

      return res.status(200).json({
        success: true,
        data: {
          message: aiMessage,
        },
      });
    } catch (error) {
      console.error(
        "Gemini API error:",
        error.message
      );

      const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

      if (status === 503) {
        return res.status(503).json({
          success: false,
          message:
            "Gemini AI is temporarily busy. Please try again in a few seconds.",
        });
      }

      if (status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "Gemini AI request limit was reached. Please try again shortly.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to get a response from DevFlow AI.",
      });
    }
  }
);
// ==================================================
// AI TASK GENERATION
// ==================================================

router.post(
  "/generate-tasks",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectDescription } = req.body;

      if (
        !projectDescription ||
        typeof projectDescription !== "string" ||
        !projectDescription.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Project description is required",
        });
      }

      const prompt = `
You are DevFlow AI, a software development planning assistant.

Generate a practical list of development tasks for the following project:

PROJECT DESCRIPTION:
${projectDescription.trim()}

Return ONLY valid JSON in this exact structure:

{
  "tasks": [
    {
      "title": "Task title",
      "description": "Short task description",
      "priority": "High",
      "status": "To Do"
    }
  ]
}

Rules:
- Generate 5 to 10 useful development tasks.
- Tasks should be specific and actionable.
- Use only these priority values: High, Medium, Low.
- Use only this status: To Do.
- Do not include markdown.
- Do not include explanations outside the JSON.
`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            "You generate structured software development tasks. " +
            "Always return valid JSON matching the requested schema.",
          thinkingConfig: {
            thinkingLevel: "low",
          },
        },
      });

      let aiText = response.text?.trim() || "";

      // Remove markdown code fences if Gemini adds them.
      aiText = aiText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(aiText);
      } catch (parseError) {
        console.error(
          "AI task JSON parsing error:",
          parseError.message
        );

        return res.status(500).json({
          success: false,
          message: "AI returned an invalid task format.",
        });
      }

      if (
        !parsed ||
        !Array.isArray(parsed.tasks)
      ) {
        return res.status(500).json({
          success: false,
          message: "AI returned an invalid task structure.",
        });
      }

      return res.status(200).json({
        success: true,
        data: parsed,
      });
    } catch (error) {
      console.error(
        "AI task generation error:",
        error.message
      );

      const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

      if (status === 503) {
        return res.status(503).json({
          success: false,
          message:
            "Gemini AI is temporarily busy. Please try again in a few seconds.",
        });
      }

      if (status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "Gemini AI request limit was reached. Please try again shortly.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to generate development tasks.",
      });
    }
  }
);
// SAVE AI-GENERATED PROJECT + SELECTED TASKS
router.post("/save-project", authMiddleware, async (req, res) => {
  let connection;

  try {
    const { project, tasks } = req.body;

    // Validate project
    if (
      !project ||
      typeof project !== "object" ||
      !project.name ||
      typeof project.name !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid project details are required",
      });
    }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: "Tasks must be an array",
      });
    }

    const name = project.name.trim();
    const description =
      typeof project.description === "string"
        ? project.description.trim()
        : "";

    const status = project.status || "To Do";
    const progress =
      Number.isInteger(project.progress) &&
      project.progress >= 0 &&
      project.progress <= 100
        ? project.progress
        : 0;

    const technologies = Array.isArray(project.technologies)
      ? project.technologies
      : [];

    if (name.length < 2 || name.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Project name must be between 2 and 150 characters",
      });
    }

    if (
      !["To Do", "In Progress", "Completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status",
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Project description cannot exceed 1000 characters",
      });
    }

    // Validate selected tasks
    for (const task of tasks) {
      if (
        !task ||
        typeof task.title !== "string" ||
        task.title.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Each task must have a valid title",
        });
      }

      if (
        task.priority &&
        !["High", "Medium", "Low"].includes(task.priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority",
        });
      }

      if (
        task.status &&
        !["To Do", "In Progress", "Completed", "Blocked"].includes(
          task.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }
    }

    const userId = req.user.userId;

    // Get a dedicated MySQL connection
    connection = await db.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Create project
    const [projectResult] = await connection.query(
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

    const projectId = projectResult.insertId;

    // 2. Create selected tasks
    const savedTasks = [];

    for (const task of tasks) {
      const title = task.title.trim();

      const taskDescription =
        typeof task.description === "string"
          ? task.description.trim()
          : "";

      const priority = task.priority || "Medium";
      const taskStatus = task.status || "To Do";

      const taskProgress =
        taskStatus === "Completed" ? 100 : 0;

      const [taskResult] = await connection.query(
        `INSERT INTO tasks
         (project_id, title, description, priority, status, progress)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          title,
          taskDescription,
          priority,
          taskStatus,
          taskProgress,
        ]
      );

      savedTasks.push({
        id: taskResult.insertId,
        project_id: projectId,
        title,
        description: taskDescription,
        priority,
        status: taskStatus,
        progress: taskProgress,
      });
    }

    // Everything succeeded
    await connection.commit();

    // Get the saved project
    const [savedProject] = await connection.query(
      `SELECT *
       FROM projects
       WHERE id = ? AND user_id = ?`,
      [projectId, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Project and selected tasks saved successfully",
      data: {
        project: savedProject[0],
        tasks: savedTasks,
      },
    });
  } catch (error) {
    // Undo everything if any operation failed
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Transaction rollback error:",
          rollbackError.message
        );
      }
    }

    console.error(
      "Save AI project error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save project and tasks",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
module.exports = router;