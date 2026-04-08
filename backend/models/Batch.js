// ============================================
// Batch Model
// Stores batch info, progress, and student refs
// ============================================

const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  batchType: { type: String, required: true },
  totalStudents: { type: Number, default: 0 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['Ongoing', 'Completed', 'Upcoming'], default: 'Upcoming' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
