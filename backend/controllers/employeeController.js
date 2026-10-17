// ============================================================
// controllers/employeeController.js - Employee Management Controller
// ============================================================
// Manages employee profiles, queries, updates, soft deletion,
// department lookups, and profile photo uploads.
// ============================================================

const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * @desc    Get all employees with optional filtering and search
 * @route   GET /api/employees
 * @access  Private (HR, Manager)
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};

    // Filter by department
    if (department) {
      filter.department = department;
    }

    // Filter by status (active, inactive, terminated)
    if (status) {
      filter.status = status;
    }

    // Search by first name, last name, or employee code
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeCode: searchRegex }
      ];
    }

    const employees = await Employee.find(filter)
      .populate('userId', 'name email role isActive')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee by profile ID or User ID
 * @route   GET /api/employees/:id
 * @access  Private
 */
const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id)
      .populate('userId', 'name email role isActive')
      .populate('managerId', 'name email');

    // Fallback: check if the id provided was actually a userId
    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate('userId', 'name email role isActive')
        .populate('managerId', 'name email');
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in employee's own profile
 * @route   GET /api/employees/profile/me
 * @access  Private (Employee)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate('userId', 'name email role isActive')
      .populate('managerId', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found for the current user.'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee profile details
 * @route   PUT /api/employees/:id
 * @access  Private (HR or Self)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id ${id}`
      });
    }

    // Authorization: Only HR or the employee themselves can update
    const isSelf = employee.userId.toString() === req.user._id.toString();
    const isHR = req.user.role === 'hr';

    if (!isSelf && !isHR) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this employee profile.'
      });
    }

    // Fields that only HR is allowed to alter
    const hrOnlyFields = ['salary', 'status', 'employeeCode', 'managerId', 'leaveBalance'];
    const updateData = { ...req.body };

    if (!isHR) {
      hrOnlyFields.forEach((field) => {
        delete updateData[field];
      });
    }

    // Update the employee profile document
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role isActive')
      .populate('managerId', 'name email');

    // If name was updated, synchronize User model name
    if (updateData.firstName || updateData.lastName) {
      const newFullName = `${updatedEmployee.firstName} ${updatedEmployee.lastName}`.trim();
      await User.findByIdAndUpdate(employee.userId, { name: newFullName });
    }

    res.status(200).json({
      success: true,
      message: 'Employee profile updated successfully.',
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete employee (set status to terminated, deactivate User)
 * @route   DELETE /api/employees/:id
 * @access  Private/HR
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id ${id}`
      });
    }

    // Soft delete profile
    employee.status = 'terminated';
    await employee.save();

    // Deactivate authentication record
    await User.findByIdAndUpdate(employee.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Employee terminated and account deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Permanently delete an employee and their User account from the DB
 * @route   DELETE /api/employees/:id/permanent
 * @access  Private/HR
 */
const hardDeleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const userId = employee.userId;

    // Remove Employee profile document
    await Employee.findByIdAndDelete(employee._id);

    // Remove User account
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Employee permanently deleted from the system.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload & update employee profile photo
 * @route   PUT /api/employees/:id/photo
 * @access  Private (HR or Self)
 */
const uploadProfilePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload.'
      });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ userId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id ${id}`
      });
    }

    // Authorization: Only HR or the employee themselves
    const isSelf = employee.userId.toString() === req.user._id.toString();
    const isHR = req.user.role === 'hr';

    if (!isSelf && !isHR) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update photo for this employee.'
      });
    }

    // Normalize path with forward slashes for static serving
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    employee.profilePhoto = normalizedPath;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      profilePhoto: normalizedPath,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employees filtered by department
 * @route   GET /api/employees/department/:dept
 * @access  Private (HR, Manager)
 */
const getEmployeesByDepartment = async (req, res, next) => {
  try {
    const { dept } = req.params;
    const departmentRegex = new RegExp(`^${dept}$`, 'i');

    const employees = await Employee.find({ department: departmentRegex })
      .populate('userId', 'name email role isActive')
      .populate('managerId', 'name email')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      department: dept,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployee,
  getMyProfile,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  uploadProfilePhoto,
  getEmployeesByDepartment
};

