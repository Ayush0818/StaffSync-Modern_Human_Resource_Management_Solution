// ============================================================
// controllers/managerController.js - Manager Controller
// ============================================================
// This controller handles all operations related to managers:
// 1. Viewing all managers (HR)
// 2. Viewing single manager profile
// 3. Updating manager details
// 4. Getting the logged-in manager's team members
// 5. Adding an employee to a manager's team
// 6. Removing an employee from a manager's team
// ============================================================

const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * @desc    Get all managers
 * @route   GET /api/managers
 * @access  Private (HR)
 */
const getAllManagers = async (req, res, next) => {
  try {
    // Find all manager profiles and populate the user details and team members
    const managers = await Manager.find()
      .populate('userId', 'name email role isActive')
      .populate('teamMembers', 'firstName lastName employeeCode department designation');

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single manager by ID
 * @route   GET /api/managers/:id
 * @access  Private (HR, Manager)
 */
const getManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by Manager profile ID first; if not found, try searching by userId
    let manager = await Manager.findById(id)
      .populate('userId', 'name email role isActive')
      .populate('teamMembers', 'firstName lastName employeeCode department designation phone');

    if (!manager) {
      manager = await Manager.findOne({ userId: id })
        .populate('userId', 'name email role isActive')
        .populate('teamMembers', 'firstName lastName employeeCode department designation phone');
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    res.status(200).json({
      success: true,
      data: manager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update manager details
 * @route   PUT /api/managers/:id
 * @access  Private (HR)
 */
const updateManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    let manager = await Manager.findById(id);
    if (!manager) {
      manager = await Manager.findOne({ userId: id });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    const updateData = { ...req.body };

    // Support 'name' field if provided
    if (updateData.name && (!updateData.firstName || !updateData.lastName)) {
      const parts = updateData.name.trim().split(' ');
      updateData.firstName = parts[0] || manager.firstName;
      updateData.lastName = parts.slice(1).join(' ') || manager.lastName || '';
    }

    const updatedManager = await Manager.findByIdAndUpdate(
      manager._id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role isActive')
      .populate('teamMembers', 'firstName lastName employeeCode department designation');

    // If firstName or lastName or name changed, also update User name
    if (updateData.firstName || updateData.lastName || updateData.name) {
      const fullName = `${updatedManager.firstName} ${updatedManager.lastName}`.trim();
      if (updatedManager.userId) {
        await User.findByIdAndUpdate(updatedManager.userId._id || updatedManager.userId, { name: fullName });
      }
    }

    // If email changed, update User email
    if (updateData.email && updatedManager.userId) {
      await User.findByIdAndUpdate(updatedManager.userId._id || updatedManager.userId, { email: updateData.email });
    }

    // If status changed, update User isActive
    if (updateData.status && updatedManager.userId) {
      await User.findByIdAndUpdate(updatedManager.userId._id || updatedManager.userId, {
        isActive: updateData.status === 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Manager updated successfully',
      data: updatedManager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete / deactivate manager
 * @route   DELETE /api/managers/:id
 * @access  Private (HR)
 */
const deleteManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    let manager = await Manager.findById(id);
    if (!manager) {
      manager = await Manager.findOne({ userId: id });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    // Soft delete profile
    manager.status = 'inactive';
    await manager.save();

    // Deactivate User account
    if (manager.userId) {
      await User.findByIdAndUpdate(manager.userId, { isActive: false });
    }

    res.status(200).json({
      success: true,
      message: 'Manager deactivated successfully.',
      data: manager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Permanently delete manager and associated user account
 * @route   DELETE /api/managers/:id/permanent
 * @access  Private (HR)
 */
const hardDeleteManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    let manager = await Manager.findById(id);
    if (!manager) {
      manager = await Manager.findOne({ userId: id });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    const userId = manager.userId;

    // Unassign managerId from any employees reporting to this manager
    if (userId) {
      await Employee.updateMany({ managerId: userId }, { $unset: { managerId: 1 } });
    }

    // Remove Manager profile document
    await Manager.findByIdAndDelete(manager._id);

    // Remove User account
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Manager permanently deleted from the system.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team members for the logged-in manager
 * @route   GET /api/managers/my-team
 * @access  Private (Manager)
 */
const getMyTeam = async (req, res, next) => {
  try {
    // Find all employees where managerId equals the logged-in user's ID
    const teamMembers = await Employee.find({ managerId: req.user._id })
      .populate('userId', 'name email role isActive')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add an employee to manager's team
 * @route   PUT /api/managers/:id/team/add
 * @access  Private (Manager, HR)
 */
const addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params; // Manager profile ID or Manager User ID
    const { employeeId } = req.body; // Employee profile ID

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId in request body'
      });
    }

    // Find the manager
    let manager = await Manager.findById(id);
    if (!manager) {
      manager = await Manager.findOne({ userId: id });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    // Find the employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if employee is already in the manager's teamMembers array
    if (!manager.teamMembers.includes(employee._id)) {
      manager.teamMembers.push(employee._id);
      await manager.save();
    }

    // Also update the employee's managerId to point to this manager's userId
    employee.managerId = manager.userId;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee added to team successfully',
      data: manager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an employee from manager's team
 * @route   PUT /api/managers/:id/team/remove
 * @access  Private (Manager, HR)
 */
const removeTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId in request body'
      });
    }

    // Find manager
    let manager = await Manager.findById(id);
    if (!manager) {
      manager = await Manager.findOne({ userId: id });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    // Remove employee from manager's teamMembers array
    manager.teamMembers = manager.teamMembers.filter(
      (memberId) => memberId.toString() !== employeeId.toString()
    );
    await manager.save();

    // Clear managerId on employee document if it points to this manager
    await Employee.findByIdAndUpdate(employeeId, {
      $unset: { managerId: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Employee removed from team successfully',
      data: manager
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllManagers,
  getManager,
  updateManager,
  deleteManager,
  hardDeleteManager,
  getMyTeam,
  addTeamMember,
  removeTeamMember
};
