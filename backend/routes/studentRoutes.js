// ============================================
// Student Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getStudents, getStudentDetail } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentDetail);

module.exports = router;
