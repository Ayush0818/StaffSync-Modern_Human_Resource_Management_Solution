// ============================================================
// models/Notification.js - In-App Notification Model
// ============================================================
// Stores user-specific alerts, task updates, status changes,
// and reminders (e.g. leave approvals, announcements, attendance alerts).
// ============================================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient User account who receives this notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // Explicit single index for fast query retrieval
  },

  // Notification category to allow customized icons and filtering:
  // - leave: Requests, approvals, rejections
  // - attendance: Missing punch, late alerts, regularizations
  // - announcement: New company bulletins
  // - training: Course enrollments or session reminders
  // - system: Account, password, security, or general notices
  type: {
    type: String,
    enum: ['leave', 'attendance', 'announcement', 'training', 'system'],
    default: 'system'
  },

  // Short summary headline for push/bell notification popover
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },

  // Detailed notification message body
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },

  // Read receipt state (true once seen/clicked by user)
  isRead: {
    type: Boolean,
    default: false
  },

  // Internal application route or URL to navigate when clicked
  // (e.g., '/dashboard/leaves', '/dashboard/trainings/652f...')
  link: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Composite index to optimize querying unread notifications sorted by recency
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
