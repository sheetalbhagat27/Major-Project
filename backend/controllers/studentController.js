// ============================================
// Student Controller
// Student listing, search, and detailed profiles
// ============================================

const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

// @desc    Get all students (with search/filter)
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const { name, enrollmentId, email, course, status } = req.query;
    const filter = {};

    // Build dynamic filter from query params
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (enrollmentId) filter.enrollmentId = { $regex: enrollmentId, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (course) filter.course = { $regex: course, $options: 'i' };
    if (status) filter.status = status;

    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student detail with attendance, assignments, quizzes
// @route   GET /api/students/:id
const getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Get attendance records for this student
    const attendanceRecords = await Attendance.find({ 'records.studentId': req.params.id })
      .populate('batchId', 'batchName');

    // Get assignment submissions for this student
    const assignments = await Assignment.find({ 'submissions.studentId': req.params.id });
    const assignmentSubmissions = [];
    assignments.forEach((a) => {
      const sub = a.submissions.find((s) => s.studentId.toString() === req.params.id);
      if (sub) {
        assignmentSubmissions.push({
          assignmentTitle: a.title,
          maxMarks: a.maxMarks,
          deadline: a.deadline,
          ...sub.toObject(),
        });
      }
    });

    // Get quiz attempts for this student
    const quizzes = await Quiz.find({ 'attempts.studentId': req.params.id });
    const quizAttempts = [];
    quizzes.forEach((q) => {
      const attempt = q.attempts.find((a) => a.studentId.toString() === req.params.id);
      if (attempt) {
        quizAttempts.push({
          quizTitle: q.title,
          totalMarks: q.totalMarks,
          ...attempt.toObject(),
        });
      }
    });

    // Calculate progress percentage
    const totalAssignments = await Assignment.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const submittedAssignments = assignmentSubmissions.filter(
      (s) => s.status !== 'NotSubmitted'
    ).length;
    const attemptedQuizzes = quizAttempts.length;
    const progressPercentage = (totalAssignments + totalQuizzes) > 0
      ? Math.round(((submittedAssignments + attemptedQuizzes) / (totalAssignments + totalQuizzes)) * 100)
      : 0;

    res.json({
      student,
      attendanceRecords,
      assignmentSubmissions,
      quizAttempts,
      progressPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStudents, getStudentDetail };
