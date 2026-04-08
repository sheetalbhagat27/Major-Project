// ============================================
// Analytics Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getClassAnalytics,
  getStudentMonitoring,
  getWeeklySnapshots,
  generateWeeklySnapshots,
  downloadStudentReport,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/class', protect, getClassAnalytics);
router.get('/students', protect, getStudentMonitoring);
router.get('/snapshots', protect, getWeeklySnapshots);
router.post('/generate-snapshots', protect, generateWeeklySnapshots);
router.get('/download/:studentId', protect, downloadStudentReport);

module.exports = router;
