// ============================================================
// models/Attendance.js - Daily Attendance Model
// ============================================================
// Tracks daily attendance records, punch-in/out timestamps,
// total working hours, and presence statuses for employees.
// ============================================================

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Reference to the Employee whose attendance is being recorded
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },

  // Calendar date of the attendance record (typically normalized to midnight UTC/local)
  date: {
    type: Date,
    required: [true, 'Attendance date is required']
  },

  // Exact timestamp when the employee checked/clocked in
  checkIn: {
    type: Date
  },

  // Exact timestamp when the employee checked/clocked out
  checkOut: {
    type: Date
  },

  // Calculated duration of active work in hours (derived via pre-save hook)
  totalHours: {
    type: Number,
    default: 0,
    min: [0, 'Total hours cannot be negative']
  },

  // Attendance status classification:
  // - present: Completed standard workday
  // - absent: No check-in recorded without approved leave
  // - half-day: Worked less than minimum full-day threshold
  // - late: Clocked in past official shift start time
  // - on-leave: Excused absence with an approved leave request
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'late', 'on-leave'],
    default: 'absent'
  },

  // Optional contextual notes (e.g., 'Late due to transit delay', 'Early departure for doctor appointment')
  remarks: {
    type: String,
    default: '',
    trim: true
  },

  // User who marked or adjusted this attendance record
  // (Self-marked by employee, or overridden by manager/HR)
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// ============================================================
// COMPOUND UNIQUE INDEX: One record per employee per calendar date
// Prevents duplicate daily attendance entries for the same employee
// ============================================================
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// ============================================================
// PRE-SAVE HOOK: Automatic Working Hours Calculation
// Calculates totalHours from checkIn and checkOut timestamps
// whenever both values are present before persisting to DB.
// ============================================================
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn).getTime();
    const checkOutTime = new Date(this.checkOut).getTime();
    const diffMs = checkOutTime - checkInTime;

    if (diffMs > 0) {
      // Convert milliseconds to hours and round to 2 decimal places
      this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    } else {
      this.totalHours = 0;
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
