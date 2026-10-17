// ============================================================
// controllers/authController.js - Authentication & Account Controller
// ============================================================
// Handles user registration (HR only), login, profile retrieval,
// and password change operations.
// ============================================================

const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user and create their Employee/Manager profile
 * @route   POST /api/auth/register
 * @access  Private/HR
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      employeeCode,
      firstName,
      lastName,
      department,
      designation,
      phone,
      dateOfJoining,
      salary,
      managerId,
      address
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email ? email.toLowerCase().trim() : '' });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Name splitting fallback if firstName / lastName not explicitly provided
    const computedFirstName = firstName || (name ? name.trim().split(' ')[0] : 'Employee');
    const computedLastName = lastName || (name && name.trim().split(' ').length > 1
      ? name.trim().split(' ').slice(1).join(' ')
      : 'User');

    // Generate fallback employee code if missing
    const generatedCode = employeeCode
      ? employeeCode.toUpperCase().trim()
      : `${role === 'manager' ? 'MGR' : 'EMP'}-${Date.now().toString().slice(-4)}`;

    // Create Base User
    const user = await User.create({
      name: name || `${computedFirstName} ${computedLastName}`,
      email: email.toLowerCase().trim(),
      password,
      role
    });

    let profileDoc = null;

    // Create role-specific profile document
    if (role === 'employee') {
      profileDoc = await Employee.create({
        userId: user._id,
        employeeCode: generatedCode,
        firstName: computedFirstName,
        lastName: computedLastName,
        department: department || 'Engineering',
        designation: designation || 'Staff Member',
        managerId: managerId || undefined,
        dateOfJoining: dateOfJoining || new Date(),
        salary: salary !== undefined ? salary : 50000,
        phone: phone || '0000000000',
        address: address || {}
      });

      // Link profile back to User
      user.profileRef = profileDoc._id;
      user.profileModel = 'Employee';
      await user.save();

      // If a manager was assigned, add employee to manager's team
      if (managerId) {
        await Manager.findOneAndUpdate(
          { userId: managerId },
          { $addToSet: { teamMembers: profileDoc._id } }
        );
      }
    } else if (role === 'manager') {
      profileDoc = await Manager.create({
        userId: user._id,
        employeeCode: generatedCode,
        firstName: computedFirstName,
        lastName: computedLastName,
        department: department || 'Engineering',
        designation: designation || 'Team Manager',
        phone: phone || '0000000000',
        dateOfJoining: dateOfJoining || new Date(),
        salary: salary !== undefined ? salary : 80000
      });

      // Link profile back to User
      user.profileRef = profileDoc._id;
      user.profileModel = 'Manager';
      await user.save();
    }

    // Generate authentication token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileDoc
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Check for user (include password field for matching)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Verify active account status
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please reach out to HR.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user's details and profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('profileRef');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // If profileRef wasn't populated or null, attempt fallback lookup
    let profile = user.profileRef;
    if (!profile) {
      if (user.role === 'employee') {
        profile = await Employee.findOne({ userId: user._id });
      } else if (user.role === 'manager') {
        profile = await Manager.findOne({ userId: user._id });
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change current user's password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, oldPassword, newPassword } = req.body;
    const providedOldPassword = currentPassword || oldPassword;

    if (!providedOldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.'
      });
    }

    // Fetch user with password included
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(providedOldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
