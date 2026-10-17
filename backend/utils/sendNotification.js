// ============================================================
// utils/sendNotification.js - Notification Dispatch Helper
// ============================================================
// Creates and persists notification records for user alerts.
// ============================================================

const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification to a specific user
 * @param {Object} options
 * @param {string} options.userId - Recipient user ID (ObjectId or string)
 * @param {string} [options.type='system'] - 'leave' | 'attendance' | 'announcement' | 'training' | 'system'
 * @param {string} options.title - Notification headline
 * @param {string} options.message - Detailed notification message
 * @param {string} [options.link=''] - Optional in-app redirect URL
 * @returns {Promise<Object>} Created notification document
 */
const sendNotification = async ({ userId, type = 'system', title, message, link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link
    });
    return notification;
  } catch (error) {
    console.error(`Error dispatching notification to user ${userId}:`, error.message);
    // Return null rather than crashing the calling transaction
    return null;
  }
};

module.exports = sendNotification;
