// ============================================================
// controllers/trainingController.js - Training Programs Controller
// ============================================================

const Training = require('../models/Training');
const Employee = require('../models/Employee');
const sendNotification = require('../utils/sendNotification');

/**
 * Helper to determine status based on start/end dates
 */
const determineStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'ongoing';
  return 'upcoming';
};

/**
 * @desc    Create a new training program
 * @route   POST /api/trainings
 * @access  Private (Manager, HR)
 */
const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      trainer,
      department,
      startDate,
      endDate,
      mode,
      maxParticipants,
      participants
    } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, trainer, startDate, and endDate'
      });
    }

    const status = determineStatus(startDate, endDate);

    const training = await Training.create({
      title,
      description,
      trainer,
      department,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mode: mode || 'online',
      maxParticipants: maxParticipants || 50,
      participants: participants || [],
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all training programs with filters
 * @route   GET /api/trainings
 * @access  Private
 */
const getAllTrainings = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email role')
      .populate('participants', 'firstName lastName employeeCode department designation')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single training program
 * @route   GET /api/trainings/:id
 * @access  Private
 */
const getTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('participants', 'firstName lastName employeeCode department designation profilePhoto');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: training
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update training details
 * @route   PUT /api/trainings/:id
 * @access  Private (Manager, HR)
 */
const updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    const updateData = { ...req.body };

    // Auto update status if dates are updated
    const start = updateData.startDate || training.startDate;
    const end = updateData.endDate || training.endDate;
    if (!updateData.status) {
      updateData.status = determineStatus(start, end);
    }

    const updatedTraining = await Training.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email role')
      .populate('participants', 'firstName lastName employeeCode department designation');

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: updatedTraining
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a training program
 * @route   DELETE /api/trainings/:id
 * @access  Private (Manager, HR)
 */
const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll employee into training program
 * @route   PUT /api/trainings/:id/enroll
 * @access  Private (Manager, HR)
 */
const enrollEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId to enroll'
      });
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

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

    // Check if employee already enrolled
    const alreadyEnrolled = training.participants.some(
      (p) => p.toString() === employee._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already enrolled in this training program'
      });
    }

    // Check capacity limit
    if (training.participants.length >= training.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Training program is full. Capacity limit reached.'
      });
    }

    training.participants.push(employee._id);
    await training.save();

    // Send notification to employee
    await sendNotification({
      userId: employee.userId,
      type: 'training',
      title: 'Enrolled in Training Program',
      message: `You have been enrolled in '${training.title}' starting on ${new Date(training.startDate).toLocaleDateString()}.`,
      link: `/dashboard/trainings/${training._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Employee enrolled successfully',
      data: training
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove employee from training program
 * @route   PUT /api/trainings/:id/remove
 * @access  Private (Manager, HR)
 */
const removeEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId to remove'
      });
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    training.participants = training.participants.filter(
      (id) => id.toString() !== employeeId.toString()
    );
    await training.save();

    res.status(200).json({
      success: true,
      message: 'Employee removed from training program',
      data: training
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainings where logged-in employee is enrolled
 * @route   GET /api/trainings/my
 * @access  Private (Employee)
 */
const getMyTrainings = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const trainings = await Training.find({ participants: employee._id })
      .populate('createdBy', 'name email role')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTraining,
  getAllTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
  enrollEmployee,
  removeEmployee,
  getMyTrainings
};
