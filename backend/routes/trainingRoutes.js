// ============================================================
// routes/trainingRoutes.js - Training Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  createTraining,
  getAllTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
  enrollEmployee,
  removeEmployee,
  getMyTrainings
} = require('../controllers/trainingController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('manager', 'hr'), createTraining);
router.get('/my', protect, authorize('employee'), getMyTrainings);

router.get('/:id', protect, getTraining);
router.put('/:id', protect, authorize('manager', 'hr'), updateTraining);
router.delete('/:id', protect, authorize('manager', 'hr'), deleteTraining);

router.put('/:id/enroll', protect, authorize('manager', 'hr'), enrollEmployee);
router.put('/:id/remove', protect, authorize('manager', 'hr'), removeEmployee);

module.exports = router;
