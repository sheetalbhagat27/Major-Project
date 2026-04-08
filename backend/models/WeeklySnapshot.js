// ============================================
// WeeklySnapshot Model
// Stores weekly performance snapshots with OGI
// ============================================

const mongoose = require('mongoose');

const weeklySnapshotSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  weekNumber: { type: Number, required: true },
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  quizAverage: { type: Number, default: 0 },
  assignmentAverage: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  submissionConsistency: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
  OGI: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook: calculate OGI automatically
weeklySnapshotSchema.pre('save', function (next) {
  this.OGI = parseFloat(
    (
      this.quizAverage * 0.25 +
      this.assignmentAverage * 0.25 +
      this.attendancePercentage * 0.25 +
      this.completionRate * 0.15 +
      this.submissionConsistency * 0.10
    ).toFixed(2)
  );
  next();
});

module.exports = mongoose.model('WeeklySnapshot', weeklySnapshotSchema);
