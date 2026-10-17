// ============================================================
// routes/announcementRoutes.js - Announcement Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement
} = require('../controllers/announcementController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', protect, getAllAnnouncements);
router.post('/', protect, authorize('hr'), createAnnouncement);

router.put('/:id/pin', protect, authorize('hr'), pinAnnouncement);
router.get('/:id', protect, getAnnouncement);
router.put('/:id', protect, authorize('hr'), updateAnnouncement);
router.delete('/:id', protect, authorize('hr'), deleteAnnouncement);

module.exports = router;
