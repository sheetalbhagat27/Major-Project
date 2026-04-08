// ============================================
// Leaderboard Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getLeaderboard, updateLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaderboard);
router.post('/update', protect, updateLeaderboard);

module.exports = router;
