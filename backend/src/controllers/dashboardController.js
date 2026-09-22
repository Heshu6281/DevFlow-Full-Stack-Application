const db = require("../config/db");

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Total projects
    const [projectCount] = await db.query(
      `SELECT COUNT(*) AS totalProjects
       FROM projects
       WHERE user_id = ?`,
      [userId]
    );

    // Total tasks
    const [taskCount] = await db.query(
      `SELECT COUNT(*) AS totalTasks
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    // Task statistics by status
    const [taskStats] = await db.query(
      `SELECT 
         t.status,
         COUNT(*) AS count
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?
       GROUP BY t.status`,
      [userId]
    );

    // Average project progress
    const [progressResult] = await db.query(
      `SELECT COALESCE(AVG(progress), 0) AS averageProgress
       FROM projects
       WHERE user_id = ?`,
      [userId]
    );

    // Recent tasks
    const [recentTasks] = await db.query(
      `SELECT
         t.id,
         t.title,
         t.status,
         t.priority,
         t.progress,
         t.due_date,
         t.created_at,
         t.updated_at,
         p.id AS project_id,
         p.name AS project_name
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?
       ORDER BY t.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    // Weekly productivity
    // Productivity = average task progress for each day
    const [weeklyProductivity] = await db.query(
      `SELECT
         DAYOFWEEK(activity_date) AS day_number,
         DATE_FORMAT(activity_date, '%a') AS day,
         ROUND(AVG(progress), 0) AS productivity
       FROM (
         SELECT
           DATE(t.updated_at) AS activity_date,
           t.progress
         FROM tasks t
         INNER JOIN projects p ON t.project_id = p.id
         WHERE p.user_id = ?
           AND t.updated_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       ) AS daily_tasks
       GROUP BY activity_date, day_number
       ORDER BY activity_date ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projectCount[0].totalProjects,
        totalTasks: taskCount[0].totalTasks,

        averageProgress: Number(
          Number(progressResult[0].averageProgress).toFixed(2)
        ),

        taskStats,

        recentTasks,

        weeklyProductivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};