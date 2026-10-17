// ============================================================
// models/Announcement.js - HR Announcements Model
// ============================================================
// Handles company-wide or role-targeted broadcast announcements,
// bulletins, policy revisions, and urgent workplace notifications.
// ============================================================

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Headline or subject of the announcement
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },

  // Full body message/content of the announcement (supports rich text/markdown)
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true
  },

  // Priority and categorization:
  // - general: Routine company news and updates
  // - urgent: High-priority operational alerts or safety notices
  // - event: Townhalls, holiday celebrations, celebrations
  // - policy: Workplace guidelines, compliance updates, handbook revisions
  category: {
    type: String,
    enum: ['general', 'urgent', 'event', 'policy'],
    default: 'general'
  },

  // User account (typically HR or Admin) who authored and published the bulletin
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author user ID is required']
  },

  // Access control / target audience:
  // - all: Visible to all authenticated users
  // - employees: Visible only to staff with 'employee' role
  // - managers: Visible only to staff with 'manager' role
  targetAudience: {
    type: String,
    enum: ['all', 'employees', 'managers'],
    default: 'all'
  },

  // Pinned announcements remain featured at the top of feeds regardless of date
  isPinned: {
    type: Boolean,
    default: false
  },

  // Optional date after which the announcement can be automatically hidden/archived
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Index to quickly sort pinned posts and recent broadcasts by target audience
announcementSchema.index({ targetAudience: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
