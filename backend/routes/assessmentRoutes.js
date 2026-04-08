// ============================================
// Assessment Routes (Assignments + Quizzes)
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAssignments, createAssignment, updateAssignment, evaluateSubmission,
  getQuizzes, createQuiz, getQuizAttempts, restrictQuiz,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

// Assignment routes
router.get('/assignments', protect, getAssignments);
router.post('/assignments', protect, createAssignment);
router.put('/assignments/:id', protect, updateAssignment);
router.post('/assignments/:id/evaluate', protect, evaluateSubmission);

// Quiz routes
router.get('/quizzes', protect, getQuizzes);
router.post('/quizzes', protect, createQuiz);
router.get('/quizzes/:id/attempts', protect, getQuizAttempts);
router.post('/quizzes/:id/restrict', protect, restrictQuiz);

module.exports = router;
