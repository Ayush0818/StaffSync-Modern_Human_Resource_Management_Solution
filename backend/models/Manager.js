// ============================================================
// models/Manager.js - Manager Profile Model
// ============================================================
// Distinct profile model for organizational managers. Separate
// from standard employees to encapsulate manager-specific relationships
// like direct reports (teamMembers) and administrative attributes.
// ============================================================

const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  // Reference to the core User login account (1:1 relation)
  // Ensures manager authentication connects directly to this profile
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true
  },

  // Unique corporate managerial identification code (e.g., 'MGR-001')
  // Distinct prefix from standard employee codes (EMP-xxx)
  employeeCode: {
    type: String,
    required: [true, 'Manager employee code is required'],
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

  // Department managed or assigned to
  // Matches company department taxonomy for cross-filtering
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

  // Managerial designation / official title (e.g., 'Engineering Manager', 'HR Manager')
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    default: 'Manager',
    trim: true
  },

  // Primary business contact telephone number
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  // Date when the manager joined the organization
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },

  // Base compensation for payroll and HR management
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },

  // Stored file path or URL for manager profile avatar
  profilePhoto: {
    type: String,
    default: ''
  },

  // Direct reports: Array of references to Employee profile documents
  // Facilitates fast lookup of team rosters and approval hierarchies
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  ],

  // Administrative status of the manager account
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================
// VIRTUAL FIELD: fullName
// Combines firstName and lastName dynamically for API responses
// without storing redundant string fields in MongoDB.
// ============================================================
managerSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

module.exports = mongoose.model('Manager', managerSchema);
