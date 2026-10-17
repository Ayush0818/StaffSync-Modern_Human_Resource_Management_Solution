// ============================================================
// controllers/attendanceController.js - Attendance Controller
// ============================================================
// This controller manages employee daily attendance:
// 1. checkIn: Employee punches in for the day
// 2. checkOut: Employee punches out, calculating hours worked
// 3. getMyAttendance: Logged-in employee views their own attendance history
// 4. getEmployeeAttendance: HR/Manager views specific employee's attendance
// 5. getAllAttendance: HR/Manager views organization-wide attendance with filters
// 6. markAttendance: HR manually adds or edits attendance
// 7. getAttendanceSummary: Aggregated counts (present, absent, late, etc.)
// ============================================================

const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

/**
 * Helper function to get start and end of a given date (default: today)
 */
const getDateRange = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

/**
 * @desc    Employee clock-in for today
 * @route   POST /api/attendance/checkin
 * @access  Private (Employee)
 */
const checkIn = async (req, res, next) => {
  try {
    // 1. Find the employee profile for the logged-in user
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // 2. Check if already checked in today
    const { startOfDay, endOfDay } = getDateRange();
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today.'
      });
    }

    const now = new Date();

    // 3. Determine if employee is late (e.g. after 9:30 AM)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? 'late' : 'present';

    // 4. If record exists (e.g. created as absent), update it. Otherwise create new.
    if (attendance) {
      attendance.checkIn = now;
      attendance.status = status;
      attendance.markedBy = req.user._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employeeId: employee._id,
        date: startOfDay,
        checkIn: now,
        status,
        markedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee clock-out for today
 * @route   PUT /api/attendance/checkout
 * @access  Private (Employee)
 */
const checkOut = async (req, res, next) => {
  try {
    // 1. Find the employee profile
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // 2. Find today's attendance record
    const { startOfDay, endOfDay } = getDateRange();
    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today.'
      });
    }

    // 3. Set checkOut time
    attendance.checkOut = new Date();

    // 4. Calculate total hours worked
    const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.totalHours = hours;

    // If worked less than 4 hours, mark as half-day
    if (hours < 4 && attendance.status !== 'late') {
      attendance.status = 'half-day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours: ${hours} hrs`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance history for logged-in employee
 * @route   GET /api/attendance/my
 * @access  Private (Employee)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const { month, year } = req.query;
    const query = { employeeId: employee._id };

    // Filter by specific month and year if provided
    if (month && year) {
      const startOfMonth = new Date(year, parseInt(month) - 1, 1);
      const endOfMonth = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance for a specific employee
 * @route   GET /api/attendance/employee/:id
 * @access  Private (HR, Manager)
 */
const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if id is an Employee ID or User ID
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const { month, year } = req.query;
    const query = { employeeId: employee._id };

    if (month && year) {
      const startOfMonth = new Date(year, parseInt(month) - 1, 1);
      const endOfMonth = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        code: employee.employeeCode,
        department: employee.department
      },
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all attendance records with filters (date, department, status)
 * @route   GET /api/attendance/all
 * @access  Private (HR, Manager)
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status } = req.query;
    const query = {};

    // Filter by specific date
    if (date) {
      const { startOfDay, endOfDay } = getDateRange(date);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by status (present, absent, late, half-day, on-leave)
    if (status) {
      query.status = status;
    }

    // Filter by department
    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      const deptEmployeeIds = deptEmployees.map((emp) => emp._id);
      query.employeeId = { $in: deptEmployeeIds };
    }

    const records = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department designation')
      .populate('markedBy', 'name role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    HR manually mark or update attendance for an employee
 * @route   PUT /api/attendance/mark
 * @access  Private (HR)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId, date, and status'
      });
    }

    // Verify employee exists
    let employee = await Employee.findById(employeeId);
    if (!employee) {
      employee = await Employee.findOne({ userId: employeeId });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const { startOfDay, endOfDay } = getDateRange(date);

    // Look for existing record on that date
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      if (checkIn) attendance.checkIn = new Date(checkIn);
      if (checkOut) attendance.checkOut = new Date(checkOut);
      if (remarks !== undefined) attendance.remarks = remarks;
      attendance.markedBy = req.user._id;

      // Recalculate hours if checkIn and checkOut exist
      if (attendance.checkIn && attendance.checkOut) {
        const diffMs = new Date(attendance.checkOut).getTime() - new Date(attendance.checkIn).getTime();
        attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }

      await attendance.save();
    } else {
      // Create new attendance record
      let totalHours = 0;
      if (checkIn && checkOut) {
        const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }

      attendance = await Attendance.create({
        employeeId: employee._id,
        date: startOfDay,
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        totalHours,
        remarks: remarks || '',
        markedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance counts summary for a date or date range
 * @route   GET /api/attendance/summary
 * @access  Private (HR, Manager)
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { date, startDate, endDate, department } = req.query;
    const query = {};

    // Setup date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else {
      // Default to today
      const { startOfDay, endOfDay } = getDateRange(date);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Optional department filter
    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employeeId = { $in: deptEmployees.map((e) => e._id) };
    }

    // Count occurrences for each status
    const presentCount = await Attendance.countDocuments({ ...query, status: 'present' });
    const absentCount = await Attendance.countDocuments({ ...query, status: 'absent' });
    const lateCount = await Attendance.countDocuments({ ...query, status: 'late' });
    const halfDayCount = await Attendance.countDocuments({ ...query, status: 'half-day' });
    const onLeaveCount = await Attendance.countDocuments({ ...query, status: 'on-leave' });
    const totalRecords = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        halfDay: halfDayCount,
        onLeave: onLeaveCount,
        total: totalRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
  markAttendance,
  getAttendanceSummary
};
