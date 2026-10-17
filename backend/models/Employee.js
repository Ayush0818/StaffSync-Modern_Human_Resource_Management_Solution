// ============================================================
// models/Employee.js - Employee Profile Model
// ============================================================
// Stores comprehensive profile and HR details for staff members
// with the 'employee' role. Linked to the User collection via userId.
// ============================================================

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Reference to the core User authentication record (1:1 relation)
  // Ensures every employee is associated with a single login account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true
  },

  // Unique organization-wide identifier (e.g., 'EMP-001', 'EMP-002')
  // Used in badges, payroll, and formal internal documentation
  employeeCode: {
    type: String,
    required: [true, 'Employee code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },

  // Personal legal name fields
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },

  // Organizational department allocation
  // Restricted to official business departments for standardized reporting
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Engineering',
      'HR',
      'Finance',
      'Marketing',
      'Operations',
      'Sales',
      'IT',
      'Management'
    ]
  },

  // Job title within the organization (e.g., 'Frontend Developer', 'HR Executive')
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },

  // Reference to the reporting manager's User account
  // Allows building hierarchy trees and routing approvals (e.g., leaves)
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Formal start date with the company (used for tenure & leave accrual calculations)
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },

  // Base compensation amount for payroll tracking
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },

  // Primary contact telephone number
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  // Structured residential address subdocument
  address: {
    street: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    pincode: { type: String, default: '', trim: true }
  },

  // Stored file path or URL for employee's profile avatar
  profilePhoto: {
    type: String,
    default: ''
  },

  // Structured tracking of annual leave balances per category
  // Defaults represent standard annual company allocations
  leaveBalance: {
    casual: {
      type: Number,
      default: 12,
      min: [0, 'Casual leave balance cannot be negative']
    },
    sick: {
      type: Number,
      default: 10,
      min: [0, 'Sick leave balance cannot be negative']
    },
    earned: {
      type: Number,
      default: 15,
      min: [0, 'Earned leave balance cannot be negative']
    },
    unpaid: {
      type: Number,
      default: 0,
      min: [0, 'Unpaid leave count cannot be negative']
    }
  },

  // Employment lifecycle status
  // - active: Current full-time employee with full system access
  // - inactive: On sabbatical or extended unpaid leave
  // - terminated: Employment ended; preserved for audit/history
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================
// VIRTUAL FIELD: fullName
// Dynamically combines firstName and lastName without duplicating
// data in the database. Accessible whenever documents are converted
// to JSON or plain objects.
// ============================================================
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

module.exports = mongoose.model('Employee', employeeSchema);
