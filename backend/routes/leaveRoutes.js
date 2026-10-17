// ============================================================
// routes/leaveRoutes.js - Leave Management Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalance
} = require('../controllers/leaveController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.post('/apply', protect, authorize('employee'), applyLeave);
router.get('/my', protect, authorize('employee'), getMyLeaves);
router.get('/balance', protect, authorize('employee'), getLeaveBalance);
router.get('/pending', protect, authorize('manager', 'hr'), getPendingLeaves);
router.get('/', protect, authorize('manager', 'hr'), getAllLeaves);

router.put('/:id/approve', protect, authorize('manager', 'hr'), approveLeave);
router.put('/:id/reject', protect, authorize('manager', 'hr'), rejectLeave);
router.delete('/:id', protect, authorize('employee'), cancelLeave);

module.exports = router;
