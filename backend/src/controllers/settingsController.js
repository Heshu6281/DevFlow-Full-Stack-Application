const db = require("../config/db");

// ==================================================
// GET USER SETTINGS
// ==================================================

const getUserSettings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [settings] = await db.query(
      `SELECT
        notification_reminders,
        notification_updates,
        notification_report,
        notification_mentions
       FROM user_settings
       WHERE user_id = ?`,
      [userId]
    );

    // Create default settings if none exist
    if (settings.length === 0) {
      await db.query(
        `INSERT INTO user_settings
        (
          user_id,
          notification_reminders,
          notification_updates,
          notification_report,
          notification_mentions
        )
        VALUES (?, TRUE, TRUE, FALSE, TRUE)`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        data: {
          reminders: true,
          updates: true,
          report: false,
          mentions: true,
        },
      });
    }

    const row = settings[0];

    return res.status(200).json({
      success: true,
      data: {
        reminders: Boolean(row.notification_reminders),
        updates: Boolean(row.notification_updates),
        report: Boolean(row.notification_report),
        mentions: Boolean(row.notification_mentions),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// UPDATE USER SETTINGS
// ==================================================

const updateUserSettings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const {
      reminders,
      updates,
      report,
      mentions,
    } = req.body;

    await db.query(
      `INSERT INTO user_settings
      (
        user_id,
        notification_reminders,
        notification_updates,
        notification_report,
        notification_mentions
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        notification_reminders = VALUES(notification_reminders),
        notification_updates = VALUES(notification_updates),
        notification_report = VALUES(notification_report),
        notification_mentions = VALUES(notification_mentions)`,
      [
        userId,
        Boolean(reminders),
        Boolean(updates),
        Boolean(report),
        Boolean(mentions),
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: {
        reminders: Boolean(reminders),
        updates: Boolean(updates),
        report: Boolean(report),
        mentions: Boolean(mentions),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
};