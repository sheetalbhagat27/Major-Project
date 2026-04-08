// ============================================
// Quiz Model
// Stores quizzes with MCQ questions and attempts
// ============================================

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const attemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  score: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  attemptLimit: { type: Number, default: 1 },
  lessonId: { type: String, default: '' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  questions: [questionSchema],
  attempts: [attemptSchema],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
