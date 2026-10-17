// ============================================================
// controllers/leaveController.js - Leave Management Controller
// ============================================================
// This controller manages all employee leave / time-off workflows:
// 1. applyLeave: Employee applies for leave (validates balance, notifies manager)
// 2. getMyLeaves: Logged-in employee views their own leave requests
// 3. getAllLeaves: HR / Manager views all leaves with filters
// 4. getPendingLeaves: Managers view pending requests from their team (or HR views all)
// 5. approveLeave: Approves leave, deducts balance, and notifies employee
// 6. rejectLeave: Rejects leave with reviewer comments and notifies employee
// 7. cancelLeave: Employee cancels a leave request (restoring balance if approved)
// 8. getLeaveBalance: Returns the logged-in employee's current leave balances
// ============================================================

const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const sendNotification = require('../utils/sendNotification');

/**
 * @desc    Employee applies for a new leave request
 * @route   POST /api/leaves/apply
 * @access  Private (Employee)
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, totalDays } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leaveType, startDate, endDate, and reason'
      });
    }

    // 1. Find the logged-in employee's profile
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // 2. Calculate total days if not provided
    let calculatedDays = totalDays;
    if (!calculatedDays) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // 3. Check leave balance (for casual, sick, earned types)
    if (['casual', 'sick', 'earned'].includes(leaveType)) {
      const availableBalance = employee.leaveBalance[leaveType] || 0;
      if (availableBalance < calculatedDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Available: ${availableBalance} day(s), Requested: ${calculatedDays} day(s).`
        });
      }
    }

    // 4. Create the Leave document
    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: calculatedDays,
      reason,
      status: 'pending'
    });

    // 5. If employee has a manager, send notification to the manager
    if (employee.managerId) {
      await sendNotification({
        userId: employee.managerId,
        type: 'leave',
        title: 'New Leave Request Submitted',
        message: `${employee.firstName} ${employee.lastName} requested ${calculatedDays} day(s) of ${leaveType} leave.`,
        link: '/dashboard/leaves'
      });
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'firstName lastName employeeCode department designation profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave || leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave history for logged-in employee
 * @route   GET /api/leaves/my
 * @access  Private (Employee)
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const leaves = await Leave.find({ employeeId: employee._id })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave requests with filters (HR / Manager)
 * @route   GET /api/leaves
 * @access  Private (Manager, HR)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, department, leaveType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    // Filter by employee department
    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employeeId = { $in: deptEmployees.map((e) => e._id) };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department designation profilePhoto')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending leave requests (for managers: team only, for HR: all)
 * @route   GET /api/leaves/pending
 * @access  Private (Manager, HR)
 */
const getPendingLeaves = async (req, res, next) => {
  try {
    const query = { status: 'pending' };

    // If logged in as Manager, only show requests from their team
    if (req.user.role === 'manager') {
      const teamEmployees = await Employee.find({ managerId: req.user._id }).select('_id');
      query.employeeId = { $in: teamEmployees.map((e) => e._id) };
    }

    const pendingLeaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department designation profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingLeaves.length,
      data: pendingLeaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a leave request and deduct balance
 * @route   PUT /api/leaves/:id/approve
 * @access  Private (Manager, HR)
 */
const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leave = await Leave.findById(id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This leave request has already been approved'
      });
    }

    // 1. Deduct leave days from employee's balance if applicable
    const employee = await Employee.findById(leave.employeeId._id);
    if (employee && ['casual', 'sick', 'earned'].includes(leave.leaveType)) {
      const currentBalance = employee.leaveBalance[leave.leaveType] || 0;
      employee.leaveBalance[leave.leaveType] = Math.max(0, currentBalance - leave.totalDays);
      await employee.save();
    }

    // 2. Update leave status
    leave.status = 'approved';
    leave.reviewedBy = req.user._id;
    leave.reviewedOn = new Date();
    leave.comments = comments || 'Approved';
    await leave.save();

    // 3. Send notification to the employee
    if (employee && employee.userId) {
      await sendNotification({
        userId: employee.userId,
        type: 'leave',
        title: 'Leave Request Approved',
        message: `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) has been approved.`,
        link: '/dashboard/leaves'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a leave request
 * @route   PUT /api/leaves/:id/reject
 * @access  Private (Manager, HR)
 */
const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leave = await Leave.findById(id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // If previously approved, restore balance
    if (leave.status === 'approved') {
      const employee = await Employee.findById(leave.employeeId._id);
      if (employee && ['casual', 'sick', 'earned'].includes(leave.leaveType)) {
        employee.leaveBalance[leave.leaveType] =
          (employee.leaveBalance[leave.leaveType] || 0) + leave.totalDays;
        await employee.save();
      }
    }

    // Update leave status
    leave.status = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewedOn = new Date();
    leave.comments = comments || 'Request denied';
    await leave.save();

    // Send notification to employee
    if (leave.employeeId && leave.employeeId.userId) {
      await sendNotification({
        userId: leave.employeeId.userId,
        type: 'leave',
        title: 'Leave Request Rejected',
        message: `Your ${leave.leaveType} leave request was rejected. Reason: ${leave.comments}`,
        link: '/dashboard/leaves'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending or approved leave request
 * @route   DELETE /api/leaves/:id
 * @access  Private (Employee)
 */
const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the logged-in employee
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const leave = await Leave.findOne({ _id: id, employeeId: employee._id });
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or does not belong to you'
      });
    }

    if (['rejected', 'cancelled'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave that is already ${leave.status}`
      });
    }

    // If it was already approved, refund the deducted balance
    if (leave.status === 'approved' && ['casual', 'sick', 'earned'].includes(leave.leaveType)) {
      employee.leaveBalance[leave.leaveType] =
        (employee.leaveBalance[leave.leaveType] || 0) + leave.totalDays;
      await employee.save();
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current employee's leave balance
 * @route   GET /api/leaves/balance
 * @access  Private (Employee)
 */
const getLeaveBalance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee.leaveBalance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalance
};
