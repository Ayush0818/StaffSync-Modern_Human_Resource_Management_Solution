// ============================================================
// routes/employeeRoutes.js - Employee Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getAllEmployees,
  getEmployee,
  getMyProfile,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  uploadProfilePhoto,
  getEmployeesByDepartment
} = require('../controllers/employeeController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

// Specific paths must precede parameter routes (/:id)
router.get('/', protect, authorize('hr', 'manager'), getAllEmployees);
router.get('/profile/me', protect, authorize('employee'), getMyProfile);
router.get('/department/:dept', protect, authorize('hr', 'manager'), getEmployeesByDepartment);

router.get('/:id', protect, getEmployee);
router.put('/:id', protect, updateEmployee);
router.put('/:id/photo', protect, uploadProfile, uploadProfilePhoto);
router.delete('/:id/permanent', protect, authorize('hr'), hardDeleteEmployee); // Hard delete
router.delete('/:id', protect, authorize('hr'), deleteEmployee);                // Soft delete (deactivate)

module.exports = router;

