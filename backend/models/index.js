// ============================================================
// models/index.js - Unified Export for StaffSync Models
// ============================================================
// Allows importing models individually or through destructuring:
// const { User, Employee, Leave } = require('../models');
// ============================================================

const User = require('./User');
const Employee = require('./Employee');
const Manager = require('./Manager');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Announcement = require('./Announcement');
const Training = require('./Training');
const Notification = require('./Notification');

module.exports = {
  User,
  Employee,
  Manager,
  Attendance,
  Leave,
  Announcement,
  Training,
  Notification
};
