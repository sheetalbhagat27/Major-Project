// ============================================
// Assignment Model
// Stores assignments with embedded submissions
// ============================================

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fileUrl: { type: String, default: '' },
  submittedAt: { type: Date },
  status: {
    type: String,
    enum: ['NotSubmitted', 'Submitted', 'LateSubmitted', 'Evaluated'],
    default: 'NotSubmitted',
  },
  marks: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  maxMarks: { type: Number, required: true },
  submissionType: { type: String, enum: ['PDF', 'Image', 'JPG'], default: 'PDF' },
  lessonId: { type: String, default: '' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  submissions: [submissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
