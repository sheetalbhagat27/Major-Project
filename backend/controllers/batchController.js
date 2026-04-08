// ============================================
// Batch Controller
// CRUD operations for batch management
// ============================================

const Batch = require('../models/Batch');

// @desc    Get all batches
// @route   GET /api/batches
const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('students', 'name enrollmentId');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new batch
// @route   POST /api/batches
const createBatch = async (req, res) => {
  try {
    const { batchName, batchType, totalStudents, progress, status, students, startDate, endDate } = req.body;
    const batch = await Batch.create({
      batchName, batchType, totalStudents, progress, status, students, startDate, endDate,
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a batch
// @route   PUT /api/batches/:id
const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    End a batch (set status to Completed)
// @route   PUT /api/batches/:id/end
const endBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', progress: 100 },
      { new: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBatches, createBatch, updateBatch, endBatch };
