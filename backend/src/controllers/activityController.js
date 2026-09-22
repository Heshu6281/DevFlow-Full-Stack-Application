const db = require("../config/db");

const getTimeAgo = (dateValue) => {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks < 5) {
    return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
};

const getActivity = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get recent tasks belonging to the logged-in user
    const [tasks] = await db.query(
      `SELECT
         t.id,
         t.title,
         t.status,
         t.created_at,
         t.updated_at,
         p.name AS project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?
       ORDER BY t.updated_at DESC
       LIMIT 20`,
      [userId]
    );

    // Get recent projects belonging to the logged-in user
    const [projects] = await db.query(
      `SELECT
         id,
         name,
         status,
         created_at,
         updated_at
       FROM projects
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 20`,
      [userId]
    );

    const taskActivities = tasks.map((task) => {
      let action = "Updated task";

      if (
        task.status === "Completed" ||
        task.status === "Done"
      ) {
        action = "Completed task";
      } else if (
        task.created_at &&
        task.updated_at &&
        new Date(task.created_at).getTime() ===
          new Date(task.updated_at).getTime()
      ) {
        action = "Created task";
      }

      return {
        id: `task-${task.id}`,
        type: "task",
        action,
        target: task.title,
        project: task.project_name,
        time: getTimeAgo(task.updated_at || task.created_at),
        timestamp: task.updated_at || task.created_at,
      };
    });

    const projectActivities = projects.map((project) => {
      let action = "Updated project";

      if (
        project.created_at &&
        project.updated_at &&
        new Date(project.created_at).getTime() ===
          new Date(project.updated_at).getTime()
      ) {
        action = "Created project";
      }

      return {
        id: `project-${project.id}`,
        type: "project",
        action,
        target: project.name,
        time: getTimeAgo(project.updated_at || project.created_at),
        timestamp: project.updated_at || project.created_at,
      };
    });

    const activities = [...taskActivities, ...projectActivities]
      .sort((a, b) => {
        const dateA = a.timestamp
          ? new Date(a.timestamp).getTime()
          : 0;

        const dateB = b.timestamp
          ? new Date(b.timestamp).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 20);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivity,
};