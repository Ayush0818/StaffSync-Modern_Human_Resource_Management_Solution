// ============================================================
// controllers/announcementController.js - Announcement Controller
// ============================================================

const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Create new company announcement (HR only)
 * @route   POST /api/announcements
 * @access  Private (HR)
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, targetAudience, isPinned, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'general',
      targetAudience: targetAudience || 'all',
      isPinned: isPinned || false,
      expiresAt: expiresAt || undefined,
      postedBy: req.user._id
    });

    // Notify targeted users
    let userFilter = { isActive: true, _id: { $ne: req.user._id } };
    if (announcement.targetAudience === 'employees') {
      userFilter.role = 'employee';
    } else if (announcement.targetAudience === 'managers') {
      userFilter.role = 'manager';
    }

    const targetUsers = await User.find(userFilter).select('_id');
    if (targetUsers.length > 0) {
      const notifications = targetUsers.map((u) => ({
        userId: u._id,
        type: 'announcement',
        title: `Announcement: ${announcement.title}`,
        message: announcement.content.length > 100
          ? `${announcement.content.substring(0, 97)}...`
          : announcement.content,
        link: '/dashboard/announcements'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all announcements relevant to user's role
 * @route   GET /api/announcements
 * @access  Private
 */
const getAllAnnouncements = async (req, res, next) => {
  try {
    const query = {};

    // Filter by user role audience
    if (req.user.role === 'employee') {
      query.targetAudience = { $in: ['all', 'employees'] };
    } else if (req.user.role === 'manager') {
      query.targetAudience = { $in: ['all', 'managers'] };
    }
    // HR can see all announcements

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name email role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single announcement by ID
 * @route   GET /api/announcements/:id
 * @access  Private
 */
const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('postedBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update announcement (HR only)
 * @route   PUT /api/announcements/:id
 * @access  Private (HR)
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete announcement (HR only)
 * @route   DELETE /api/announcements/:id
 * @access  Private (HR)
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle pinned state on announcement (HR only)
 * @route   PUT /api/announcements/:id/pin
 * @access  Private (HR)
 */
const pinAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement
};
