const db = require("../config/db");

const getTimeAgo = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "Recently";

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} ${
      diffMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ${
      diffHours === 1 ? "hour" : "hours"
    } ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} ${
      diffDays === 1 ? "day" : "days"
    } ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks < 5) {
    return `${diffWeeks} ${
      diffWeeks === 1 ? "week" : "weeks"
    } ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  return `${diffMonths} ${
    diffMonths === 1 ? "month" : "months"
  } ago`;
};

/*
 * GET /api/notifications
 * Get notifications for the logged-in user
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get notification settings
    const [settingsRows] = await db.query(
      `SELECT
         notification_reminders,
         notification_updates,
         notification_report,
         notification_mentions
       FROM user_settings
       WHERE user_id = ?`,
      [userId]
    );

    const settings = settingsRows[0] || {
      notification_reminders: true,
      notification_updates: true,
      notification_report: false,
      notification_mentions: true,
    };

    // Get notifications already marked as read
    const [readRows] = await db.query(
      `SELECT notification_id
       FROM notification_reads
       WHERE user_id = ?`,
      [userId]
    );

    const readNotificationIds = new Set(
      readRows.map((row) => row.notification_id)
    );

    const notifications = [];

    /*
     * Completed task notifications
     */
    if (settings.notification_updates) {
      const [completedTasks] = await db.query(
        `SELECT
           t.id,
           t.title,
           t.updated_at,
           p.name AS project_name
         FROM tasks t
         JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?
           AND t.status IN ('Completed', 'Done')
         ORDER BY t.updated_at DESC
         LIMIT 10`,
        [userId]
      );

      completedTasks.forEach((task) => {
        const notificationId = `completed-task-${task.id}`;

        notifications.push({
          id: notificationId,
          type: "success",
          title: "Task completed",
          message: `"${task.title}" was completed.`,
          project: task.project_name,
          time: getTimeAgo(task.updated_at),
          timestamp: task.updated_at,
          read: readNotificationIds.has(notificationId),
        });
      });
    }

    /*
     * Project update notifications
     */
    if (settings.notification_updates) {
      const [projects] = await db.query(
        `SELECT
           id,
           name,
           status,
           updated_at
         FROM projects
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 10`,
        [userId]
      );

      projects.forEach((project) => {
        const notificationId = `project-${project.id}`;

        notifications.push({
          id: notificationId,
          type: "info",
          title: "Project updated",
          message: `"${project.name}" was updated.`,
          project: project.name,
          time: getTimeAgo(project.updated_at),
          timestamp: project.updated_at,
          read: readNotificationIds.has(notificationId),
        });
      });
    }

    /*
     * In-progress task reminders
     */
    if (settings.notification_reminders) {
      const [inProgressTasks] = await db.query(
        `SELECT
           t.id,
           t.title,
           t.updated_at,
           p.name AS project_name
         FROM tasks t
         JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?
           AND t.status = 'In Progress'
         ORDER BY t.updated_at DESC
         LIMIT 10`,
        [userId]
      );

      inProgressTasks.forEach((task) => {
        const notificationId = `progress-task-${task.id}`;

        notifications.push({
          id: notificationId,
          type: "warning",
          title: "Task in progress",
          message: `"${task.title}" is still in progress.`,
          project: task.project_name,
          time: getTimeAgo(task.updated_at),
          timestamp: task.updated_at,
          read: readNotificationIds.has(notificationId),
        });
      });
    }

    // Sort newest notifications first
    notifications.sort((a, b) => {
      const dateA = a.timestamp
        ? new Date(a.timestamp).getTime()
        : 0;

      const dateB = b.timestamp
        ? new Date(b.timestamp).getTime()
        : 0;

      return dateB - dateA;
    });

    const finalNotifications = notifications.slice(0, 20);

    const unreadCount = finalNotifications.filter(
      (notification) => !notification.read
    ).length;

    return res.status(200).json({
      success: true,
      count: finalNotifications.length,
      unreadCount,
      data: finalNotifications,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PUT /api/notifications/:notificationId/read
 * Mark one notification as read
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
    }

    await db.query(
      `INSERT INTO notification_reads
        (user_id, notification_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
        read_at = CURRENT_TIMESTAMP`,
      [userId, notificationId]
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PUT /api/notifications/read-all
 * Mark all current notifications as read
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get notification settings
    const [settingsRows] = await db.query(
      `SELECT
         notification_updates,
         notification_reminders
       FROM user_settings
       WHERE user_id = ?`,
      [userId]
    );

    const settings = settingsRows[0] || {
      notification_updates: true,
      notification_reminders: true,
    };

    const notificationIds = [];

    /*
     * Completed tasks and projects
     */
    if (settings.notification_updates) {
      const [completedTasks] = await db.query(
        `SELECT t.id
         FROM tasks t
         JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?
           AND t.status IN ('Completed', 'Done')
         ORDER BY t.updated_at DESC
         LIMIT 10`,
        [userId]
      );

      completedTasks.forEach((task) => {
        notificationIds.push(`completed-task-${task.id}`);
      });

      const [projects] = await db.query(
        `SELECT id
         FROM projects
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 10`,
        [userId]
      );

      projects.forEach((project) => {
        notificationIds.push(`project-${project.id}`);
      });
    }

    /*
     * In-progress tasks
     */
    if (settings.notification_reminders) {
      const [inProgressTasks] = await db.query(
        `SELECT t.id
         FROM tasks t
         JOIN projects p
           ON t.project_id = p.id
         WHERE p.user_id = ?
           AND t.status = 'In Progress'
         ORDER BY t.updated_at DESC
         LIMIT 10`,
        [userId]
      );

      inProgressTasks.forEach((task) => {
        notificationIds.push(`progress-task-${task.id}`);
      });
    }

    /*
     * Store all notifications as read
     */
    if (notificationIds.length > 0) {
      const values = notificationIds.map((notificationId) => [
        userId,
        notificationId,
      ]);

      await db.query(
        `INSERT INTO notification_reads
          (user_id, notification_id)
         VALUES ?
         ON DUPLICATE KEY UPDATE
          read_at = CURRENT_TIMESTAMP`,
        [values]
      );
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};