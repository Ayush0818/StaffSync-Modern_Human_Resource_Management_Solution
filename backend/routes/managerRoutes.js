// ============================================================
// routes/managerRoutes.js - Manager Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getAllManagers,
  getManager,
  updateManager,
  deleteManager,
  hardDeleteManager,
  getMyTeam,
  addTeamMember,
  removeTeamMember
} = require('../controllers/managerController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('hr'), getAllManagers);
router.get('/my-team', protect, authorize('manager'), getMyTeam);

router.get('/:id', protect, authorize('hr', 'manager'), getManager);
router.put('/:id', protect, authorize('hr'), updateManager);
router.delete('/:id/permanent', protect, authorize('hr'), hardDeleteManager);
router.delete('/:id', protect, authorize('hr'), deleteManager);
router.put('/:id/team/add', protect, authorize('manager', 'hr'), addTeamMember);
router.put('/:id/team/remove', protect, authorize('manager', 'hr'), removeTeamMember);

module.exports = router;
