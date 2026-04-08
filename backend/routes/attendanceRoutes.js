// ============================================
// Attendance Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAttendanceByBatch, submitAttendance, editAttendance, getStudentAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/student/:studentId', protect, getStudentAttendance);
router.get('/:batchId', protect, getAttendanceByBatch);
router.post('/', protect, submitAttendance);
router.put('/:id', protect, editAttendance);

module.exports = router;
