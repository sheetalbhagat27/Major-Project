// ============================================
// Dashboard Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/dashboard — Dashboard KPI stats
router.get('/', protect, getDashboardStats);

module.exports = router;
