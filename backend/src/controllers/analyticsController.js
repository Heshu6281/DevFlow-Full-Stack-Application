const db = require("../config/db");

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Task status distribution
    const [taskStatusRows] = await db.query(
      `SELECT
         t.status,
         COUNT(*) AS count
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?
       GROUP BY t.status
       ORDER BY t.status`,
      [userId]
    );

    // Task priority distribution
    const [priorityRows] = await db.query(
      `SELECT
         t.priority,
         COUNT(*) AS count
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?
       GROUP BY t.priority
       ORDER BY
         CASE t.priority
           WHEN 'High' THEN 1
           WHEN 'Medium' THEN 2
           WHEN 'Low' THEN 3
           ELSE 4
         END`,
      [userId]
    );

    // Project status distribution
    const [projectStatusRows] = await db.query(
      `SELECT
         p.status,
         COUNT(*) AS count
       FROM projects p
       WHERE p.user_id = ?
       GROUP BY p.status
       ORDER BY p.status`,
      [userId]
    );

    // Individual project progress
    const [projectProgressRows] = await db.query(
      `SELECT
         p.id,
         p.name,
         p.progress,
         p.status
       FROM projects p
       WHERE p.user_id = ?
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    // Overall task statistics
    const [taskStatsRows] = await db.query(
      `SELECT
         COUNT(*) AS totalTasks,

         COALESCE(SUM(
           CASE
             WHEN t.status IN ('Completed', 'Done') THEN 1
             ELSE 0
           END
         ), 0) AS completedTasks,

         COALESCE(SUM(
           CASE
             WHEN t.status = 'In Progress' THEN 1
             ELSE 0
           END
         ), 0) AS inProgressTasks,

         COALESCE(SUM(
           CASE
             WHEN t.status = 'To Do' THEN 1
             ELSE 0
           END
         ), 0) AS todoTasks,

         COALESCE(AVG(t.progress), 0) AS averageProgress

       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    // Overall project statistics
    const [projectStatsRows] = await db.query(
      `SELECT
         COUNT(*) AS totalProjects,

         COALESCE(SUM(
           CASE
             WHEN p.status = 'Completed' THEN 1
             ELSE 0
           END
         ), 0) AS completedProjects,

         COALESCE(SUM(
           CASE
             WHEN p.status = 'In Progress' THEN 1
             ELSE 0
           END
         ), 0) AS inProgressProjects,

         COALESCE(SUM(
           CASE
             WHEN p.status = 'To Do' THEN 1
             ELSE 0
           END
         ), 0) AS todoProjects,

         COALESCE(AVG(p.progress), 0) AS averageProgress

       FROM projects p
       WHERE p.user_id = ?`,
      [userId]
    );

    // Monthly productivity for the current year
    const [monthlyRows] = await db.query(
      `SELECT
         MONTH(t.updated_at) AS month,
         COUNT(*) AS totalTasks,

         SUM(
           CASE
             WHEN t.status IN ('Completed', 'Done') THEN 1
             ELSE 0
           END
         ) AS completedTasks

       FROM tasks t
       JOIN projects p ON t.project_id = p.id

       WHERE p.user_id = ?
         AND YEAR(t.updated_at) = YEAR(CURDATE())

       GROUP BY MONTH(t.updated_at)
       ORDER BY MONTH(t.updated_at)`,
      [userId]
    );

    const taskStats = taskStatsRows[0] || {};
    const projectStats = projectStatsRows[0] || {};

    const totalTasks = Number(taskStats.totalTasks || 0);
    const completedTasks = Number(taskStats.completedTasks || 0);

    const completionRate =
      totalTasks > 0
        ? Number(((completedTasks / totalTasks) * 100).toFixed(1))
        : 0;

    const averageTaskProgress = Number(
      Number(taskStats.averageProgress || 0).toFixed(1)
    );

    const averageProjectProgress = Number(
      Number(projectStats.averageProgress || 0).toFixed(1)
    );

    const monthlyProductivity = monthlyRows.map((row) => {
      const total = Number(row.totalTasks || 0);
      const completed = Number(row.completedTasks || 0);

      return {
        month: Number(row.month),
        totalTasks: total,
        completedTasks: completed,
        completionRate:
          total > 0
            ? Number(((completed / total) * 100).toFixed(1))
            : 0,
      };
    });

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          totalTasks,
          completedTasks,
          inProgressTasks: Number(taskStats.inProgressTasks || 0),
          todoTasks: Number(taskStats.todoTasks || 0),

          totalProjects: Number(projectStats.totalProjects || 0),
          completedProjects: Number(projectStats.completedProjects || 0),
          inProgressProjects: Number(projectStats.inProgressProjects || 0),
          todoProjects: Number(projectStats.todoProjects || 0),

          completionRate,
          averageTaskProgress,
          averageProjectProgress,
        },

        taskStatus: taskStatusRows.map((row) => ({
          status: row.status,
          count: Number(row.count),
        })),

        priorityDistribution: priorityRows.map((row) => ({
          priority: row.priority,
          count: Number(row.count),
        })),

        projectStatus: projectStatusRows.map((row) => ({
          status: row.status,
          count: Number(row.count),
        })),

        projectProgress: projectProgressRows.map((row) => ({
          id: row.id,
          name: row.name,
          progress: Number(row.progress || 0),
          status: row.status,
        })),

        monthlyProductivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};