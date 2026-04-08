// ============================================
// Batch Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getBatches, createBatch, updateBatch, endBatch } = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBatches);
router.post('/', protect, createBatch);
router.put('/:id', protect, updateBatch);
router.put('/:id/end', protect, endBatch);

module.exports = router;
