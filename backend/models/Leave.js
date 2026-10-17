// ============================================================
// models/Leave.js - Leave Request Model
// ============================================================
// Manages the workflow for employee time-off requests, including
// leave type categorization, date ranges, multi-state approval
// lifecycle, and managerial review notes.
// ============================================================

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  // Reference to the employee submitting the leave request
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },

  // Leave category used to debit the corresponding balance pool:
  // - casual: Short-term personal commitments
  // - sick: Medical recovery or doctor visits
  // - earned: Accrued annual paid vacation
  // - unpaid: Leave without pay beyond balance limits
  // - maternity: Parental/maternity statutory leave
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: ['casual', 'sick', 'earned', 'unpaid', 'maternity']
  },

  // First day of requested time off
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },

  // Last day of requested time off (inclusive)
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },

  // Count of working days requested (supports fractional days, e.g., 0.5 for half-day)
  totalDays: {
    type: Number,
    required: [true, 'Total days count is required'],
    min: [0.5, 'Minimum leave duration is 0.5 days']
  },

  // Employee-provided explanation for why the leave is requested
  reason: {
    type: String,
    required: [true, 'Leave reason is required'],
    trim: true
  },

  // Approval state machine:
  // - pending: Awaiting manager/HR action
  // - approved: Authorized; balance debited from employee profile
  // - rejected: Denied by manager or HR
  // - cancelled: Withdrawn by employee prior to start date
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // Timestamp when the application was originally filed
  appliedOn: {
    type: Date,
    default: Date.now
  },

  // Reference to the User (Manager or HR) who reviewed this application
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamp when approval or rejection decision was made
  reviewedOn: {
    type: Date
  },

  // Feedback, stipulations, or rejection justification provided by the reviewer
  comments: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Index to quickly fetch leave history for a specific employee
leaveSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
