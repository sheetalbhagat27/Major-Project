// ============================================
// Dashboard Controller
// Returns aggregated KPI data for the dashboard
// ============================================

const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Assignment = require('../models/Assignment');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Total students count
    const totalStudents = await Student.countDocuments();

    // Active courses (ongoing batches)
    const activeCourses = await Batch.countDocuments({ status: 'Ongoing' });

    // Pending assignments (submissions not yet evaluated)
    const assignments = await Assignment.find();
    let pendingAssignments = 0;
    assignments.forEach((a) => {
      a.submissions.forEach((s) => {
        if (s.status === 'Submitted' || s.status === 'LateSubmitted') {
          pendingAssignments++;
        }
      });
    });

    // Upcoming deadlines (assignments with deadline in next 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = await Assignment.find({
      deadline: { $gte: now, $lte: weekFromNow },
      status: 'Active',
    }).select('title deadline maxMarks');

    // Average class performance (average attendance percentage)
    const students = await Student.find();
    const averageClassPerformance = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length)
      : 0;

    res.json({
      totalStudents,
      activeCourses,
      pendingAssignments,
      upcomingDeadlines,
      averageClassPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats };
