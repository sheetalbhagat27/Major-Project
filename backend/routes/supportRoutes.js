// ============================================
// Support Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getSupportRequests, replyToRequest, resolveRequest, scheduleBackupClass,
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSupportRequests);
router.post('/reply/:id', protect, replyToRequest);
router.put('/resolve/:id', protect, resolveRequest);
router.put('/backup/:id', protect, scheduleBackupClass);

module.exports = router;
