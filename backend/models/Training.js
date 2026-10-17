// ============================================================
// models/Training.js - Training Program Model
// ============================================================
// Represents professional development courses, workshops, and
// onboarding training sessions organized for employees.
// ============================================================

const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  // Course or workshop title
  title: {
    type: String,
    required: [true, 'Training title is required'],
    trim: true
  },

  // Detailed agenda, prerequisites, learning outcomes, or syllabus
  description: {
    type: String,
    required: [true, 'Training description is required'],
    trim: true
  },

  // Name or credentials of the instructor / conducting entity
  trainer: {
    type: String,
    required: [true, 'Trainer name is required'],
    trim: true
  },

  // Specific department targeted (optional; empty or null implies company-wide)
  department: {
    type: String,
    trim: true
  },

  // Scheduled commencement date and time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },

  // Scheduled completion date and time
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },

  // Delivery format:
  // - online: Virtual classroom / webinar
  // - offline: In-person classroom / training room
  // - hybrid: Mixed attendance mode
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },

  // Lifecycle status of the training program:
  // - upcoming: Scheduled but has not yet commenced
  // - ongoing: In active session
  // - completed: Concluded
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },

  // List of enrolled staff members referencing Employee profile documents
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  ],

  // User (HR/Manager) who initiated and registered the training program
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator user ID is required']
  },

  // Capacity threshold to prevent over-enrollment
  maxParticipants: {
    type: Number,
    default: 50,
    min: [1, 'Maximum participants must be at least 1']
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Index to query active and upcoming training schedules efficiently
trainingSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('Training', trainingSchema);
