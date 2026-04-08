// ============================================
// Attendance Model
// Stores daily attendance with edit window logic
// ============================================

const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
});

const attendanceSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: Date, required: true },
  remark: { type: String, required: true },
  records: [recordSchema],
  submittedAt: { type: Date, default: Date.now },
  isEditable: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-set isEditable to false after 10 minutes via post-save
attendanceSchema.post('save', function (doc) {
  setTimeout(async () => {
    try {
      await mongoose.model('Attendance').findByIdAndUpdate(doc._id, { isEditable: false });
    } catch (err) {
      console.error('Error auto-locking attendance:', err.message);
    }
  }, 10 * 60 * 1000); // 10 minutes
});

module.exports = mongoose.model('Attendance', attendanceSchema);
