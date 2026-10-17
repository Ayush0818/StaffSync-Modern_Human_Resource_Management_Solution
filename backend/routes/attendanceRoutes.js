// ============================================================
// routes/attendanceRoutes.js - Attendance Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
  markAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.post('/checkin', protect, authorize('employee'), checkIn);
router.put('/checkout', protect, authorize('employee'), checkOut);
router.get('/my', protect, authorize('employee'), getMyAttendance);
router.get('/summary', protect, authorize('hr', 'manager'), getAttendanceSummary);
router.get('/all', protect, authorize('hr', 'manager'), getAllAttendance);
router.get('/employee/:id', protect, authorize('hr', 'manager'), getEmployeeAttendance);
router.put('/mark', protect, authorize('hr'), markAttendance);

module.exports = router;
