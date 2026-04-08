// ============================================
// Assessment Controller
// CRUD for assignments and quizzes, plus evaluation
// ============================================

const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');

// ==================== ASSIGNMENTS ====================

// @desc    Get all assignments
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('batchId', 'batchName');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline, maxMarks, submissionType, lessonId, batchId } = req.body;
    const assignment = await Assignment.create({
      title, description, deadline, maxMarks, submissionType, lessonId, batchId,
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Evaluate a student's submission
// @route   POST /api/assignments/:id/evaluate
const evaluateSubmission = async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Find the student's submission
    const submission = assignment.submissions.find(
      (s) => s.studentId.toString() === studentId
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Update submission with marks and feedback
    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'Evaluated';
    await assignment.save();
    await updateStudentOGI(studentId);

     // ✅ Student OGI update (manual trigger)
    const submissionOgi = assignment.submissions.find(s => s.studentId.toString() === studentId);
    const student = await Student.findById(submission.studentId);
    if (student) {
      student.OGI = calculateOGI(student);
      await student.save();
    }

    res.json({ message: 'Submission evaluated successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== QUIZZES ====================

// @desc    Get all quizzes
// @route   GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('batchId', 'batchName');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
  try {
    const { title, duration, totalMarks, attemptLimit, lessonId, batchId, questions } = req.body;
    const quiz = await Quiz.create({
      title, duration, totalMarks, attemptLimit, lessonId, batchId, questions,
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get quiz attempts
// @route   GET /api/quizzes/:id/attempts
const getQuizAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('attempts.studentId', 'name enrollmentId');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz.attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Restrict quiz attempts
// @route   POST /api/quizzes/:id/restrict
const restrictQuiz = async (req, res) => {
  try {
    const { attemptLimit } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { attemptLimit },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz attempt limit updated', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAssignments, createAssignment, updateAssignment, evaluateSubmission,
  getQuizzes, createQuiz, getQuizAttempts, restrictQuiz,
};
