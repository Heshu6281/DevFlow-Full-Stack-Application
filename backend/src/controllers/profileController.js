const db = require("../config/db");

// ==================================================
// GET PROFILE
// ==================================================

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // --------------------------------------------------
    // Get user information
    // --------------------------------------------------

    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // --------------------------------------------------
    // Get project statistics
    // --------------------------------------------------

    const [projectStats] = await db.query(
      `SELECT
        COUNT(*) AS total_projects,
        COALESCE(
          SUM(
            CASE
              WHEN status != 'Completed' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS active_projects
       FROM projects
       WHERE user_id = ?`,
      [userId]
    );

    // --------------------------------------------------
    // Get task statistics
    // --------------------------------------------------

    const [taskStats] = await db.query(
      `SELECT
        COUNT(*) AS total_tasks,
        COALESCE(
          SUM(
            CASE
              WHEN t.status = 'Completed'
                   OR t.status = 'Done'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS completed_tasks,
        COALESCE(
          SUM(
            CASE
              WHEN t.status = 'In Progress'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS in_progress_tasks
       FROM tasks t
       INNER JOIN projects p
         ON t.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    const totalProjects = Number(
      projectStats[0].total_projects || 0
    );

    const activeProjects = Number(
      projectStats[0].active_projects || 0
    );

    const totalTasks = Number(
      taskStats[0].total_tasks || 0
    );

    const completedTasks = Number(
      taskStats[0].completed_tasks || 0
    );

    const inProgressTasks = Number(
      taskStats[0].in_progress_tasks || 0
    );

    // --------------------------------------------------
    // Calculate completion rate
    // --------------------------------------------------

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // --------------------------------------------------
    // Get activity dates
    //
    // Activity is based on task/project created_at
    // and updated_at values, matching the existing
    // Activity API.
    // --------------------------------------------------

    const [activityDates] = await db.query(
      `SELECT activity_date
       FROM (
         SELECT DATE(t.created_at) AS activity_date
         FROM tasks t
         INNER JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?

         UNION

         SELECT DATE(t.updated_at) AS activity_date
         FROM tasks t
         INNER JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?

         UNION

         SELECT DATE(p.created_at) AS activity_date
         FROM projects p
         WHERE p.user_id = ?

         UNION

         SELECT DATE(p.updated_at) AS activity_date
         FROM projects p
         WHERE p.user_id = ?
       ) AS activity_dates
       WHERE activity_date IS NOT NULL
       ORDER BY activity_date DESC`,
      [userId, userId, userId, userId]
    );

    // --------------------------------------------------
    // Calculate current activity streak
    // --------------------------------------------------

    const activityDateSet = new Set(
      activityDates.map((row) => {
        const date = row.activity_date;

        if (date instanceof Date) {
          return date.toISOString().slice(0, 10);
        }

        return String(date).slice(0, 10);
      })
    );

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");
      const day = String(
        date.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const today = new Date();

    let streak = 0;

    // A streak can continue from today or yesterday.
    const todayKey = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayKey = formatDate(yesterday);

    if (
      activityDateSet.has(todayKey) ||
      activityDateSet.has(yesterdayKey)
    ) {
      const streakDate = activityDateSet.has(todayKey)
        ? today
        : yesterday;

      while (
        activityDateSet.has(
          formatDate(streakDate)
        )
      ) {
        streak += 1;

        streakDate.setDate(
          streakDate.getDate() - 1
        );
      }
    }

    // --------------------------------------------------
    // Calculate productivity
    //
    // Productivity is based on completed tasks out
    // of total tasks, expressed as a percentage.
    // --------------------------------------------------

    const productivity = completionRate;

    // --------------------------------------------------
    // Get user skills
    // --------------------------------------------------

    const [skills] = await db.query(
      `SELECT
        id,
        skill_name,
        proficiency
       FROM user_skills
       WHERE user_id = ?
       ORDER BY id ASC`,
      [userId]
    );

    // --------------------------------------------------
    // Format response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "Software Developer",
          joinedDate: user.created_at,
        },

        stats: {
          activeProjects,
          completedTasks,
          inProgressTasks,
          totalTasks,
          totalProjects,
        },

        completionRate,

        productivity,

        streak,

        skills: skills.map((skill) => ({
          id: skill.id,
          name: skill.skill_name,
          level: Number(skill.proficiency),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  getProfile,
};