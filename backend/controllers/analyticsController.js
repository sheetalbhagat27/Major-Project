// ============================================
// Analytics Controller
// Class analytics, student monitoring, snapshots
// ============================================

const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Attendance = require('../models/Attendance');
const WeeklySnapshot = require('../models/WeeklySnapshot');

// @desc    Get class-level analytics
// @route   GET /api/analytics/class
const getClassAnalytics = async (req, res) => {
  try {
    // ── Average Quiz Score ──
    const quizzes = await Quiz.find();
    let totalQuizScore = 0, totalQuizAttempts = 0;
    quizzes.forEach((q) => {
      q.attempts.forEach((a) => {
        totalQuizScore += (a.score / q.totalMarks) * 100;
        totalQuizAttempts++;
      });
    });
    const averageQuizScore = totalQuizAttempts > 0
      ? Math.round(totalQuizScore / totalQuizAttempts)
      : 0;

    // ── Average Assignment Score ──
    const assignments = await Assignment.find();
    let totalAssignmentScore = 0, totalEvaluated = 0;
    assignments.forEach((a) => {
      a.submissions.forEach((s) => {
        if (s.status === 'Evaluated') {
          totalAssignmentScore += (s.marks / a.maxMarks) * 100;
          totalEvaluated++;
        }
      });
    });
    const averageAssignmentScore = totalEvaluated > 0
      ? Math.round(totalAssignmentScore / totalEvaluated)
      : 0;

    // ── Submission Consistency ──
    let totalSubmissions = 0, onTimeSubmissions = 0;
    assignments.forEach((a) => {
      a.submissions.forEach((s) => {
        totalSubmissions++;
        if (s.status === 'Submitted' || s.status === 'Evaluated') {
          onTimeSubmissions++;
        }
      });
    });
    const submissionConsistency = totalSubmissions > 0
      ? Math.round((onTimeSubmissions / totalSubmissions) * 100)
      : 0;

    // ── Module Completion Rate ──
    const students = await Student.find();
    let totalModuleCompletion = 0;
    students.forEach((s) => {
      const maxModules = s.course === 'Web Development' ? 5
        : s.course === 'DSA' ? 5
        : s.course === 'Python' ? 3 : 5;
      totalModuleCompletion += (s.modules.length / maxModules) * 100;
    });
    const moduleCompletionRate = students.length > 0
      ? Math.round(totalModuleCompletion / students.length)
      : 0;

    // ── Overall Class OGI ──
    const snapshots = await WeeklySnapshot.find().sort({ weekNumber: -1 });
    const latestWeek = snapshots.length > 0 ? snapshots[0].weekNumber : 0;
    const latestSnapshots = snapshots.filter((s) => s.weekNumber === latestWeek);
    const overallClassOGI = latestSnapshots.length > 0
      ? Math.round(latestSnapshots.reduce((sum, s) => sum + s.OGI, 0) / latestSnapshots.length)
      : 0;

    // ── Module-wise Attendance ──
    const batches = await Batch.find();
    const moduleWiseAttendance = [];
    for (const batch of batches) {
      const attendances = await Attendance.find({ batchId: batch._id });
      let totalPresent = 0, totalRecords = 0;
      attendances.forEach((att) => {
        att.records.forEach((r) => {
          totalRecords++;
          if (r.status === 'Present') totalPresent++;
        });
      });
      moduleWiseAttendance.push({
        batchName: batch.batchName,
        attendancePercentage: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
      });
    }

    // ── Weekly Activity Trend (last 7 weeks) ──
    const weeklyActivityTrend = [];
    for (let w = Math.max(1, latestWeek - 6); w <= Math.max(latestWeek, 1); w++) {
      const weekSnapshots = snapshots.filter((s) => s.weekNumber === w);
      weeklyActivityTrend.push({
        week: `Week ${w}`,
        quizAttempts: weekSnapshots.reduce((sum, s) => sum + Math.round(s.quizAverage / 10), 0),
        assignmentSubmissions: weekSnapshots.reduce((sum, s) => sum + Math.round(s.assignmentAverage / 10), 0),
      });
    }

    // ── Attendance Heatmap (last 30 days) ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAttendances = await Attendance.find({ date: { $gte: thirtyDaysAgo } });
    const attendanceHeatmap = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRecords = recentAttendances.filter((a) => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === date.getTime();
      });

      let present = 0, absent = 0, late = 0;
      dayRecords.forEach((att) => {
        att.records.forEach((r) => {
          if (r.status === 'Present') present++;
          else if (r.status === 'Absent') absent++;
          else if (r.status === 'Late') late++;
        });
      });

      attendanceHeatmap.push({
        date: date.toISOString().split('T')[0],
        present,
        absent,
        late,
        total: present + absent + late,
        percentage: (present + absent + late) > 0
          ? Math.round((present / (present + absent + late)) * 100) : -1,
      });
    }

    res.json({
      averageQuizScore,
      averageAssignmentScore,
      submissionConsistency,
      moduleCompletionRate,
      overallClassOGI,
      moduleWiseAttendance,
      weeklyActivityTrend,
      attendanceHeatmap,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student monitoring data
// @route   GET /api/analytics/students
const getStudentMonitoring = async (req, res) => {
  try {
    const { course, batch, growth } = req.query;
    const filter = {};
    if (course) filter.course = { $regex: course, $options: 'i' };

    let students = await Student.find(filter);

    // Filter by batch if provided
    if (batch) {
      const batchDoc = await Batch.findById(batch);
      if (batchDoc) {
        const batchStudentIds = batchDoc.students.map((s) => s.toString());
        students = students.filter((s) => batchStudentIds.includes(s._id.toString()));
      }
    }

    const monitoringData = [];
    for (const student of students) {
      // Get last 8 weeks of OGI
      const snapshots = await WeeklySnapshot.find({ studentId: student._id })
        .sort({ weekNumber: -1 })
        .limit(8);
      const ogiTrend = snapshots.reverse().map((s) => ({
        week: s.weekNumber,
        OGI: s.OGI,
      }));

      // Current OGI
      const currentOGI = ogiTrend.length > 0 ? ogiTrend[ogiTrend.length - 1].OGI : 0;

      // Growth classification
      let growthClassification = 'Stable';
      if (currentOGI >= 80) {
        growthClassification = 'Excellent';
      } else if (currentOGI < 50) {
        growthClassification = 'Needs Attention';
      } else if (ogiTrend.length >= 3) {
        const last3 = ogiTrend.slice(-3);
        const isImproving = last3[2].OGI > last3[0].OGI && last3[2].OGI > last3[1].OGI;
        const isDeclining = last3[2].OGI < last3[0].OGI && last3[2].OGI < last3[1].OGI;
        const change = Math.abs(last3[2].OGI - last3[0].OGI);

        if (isDeclining) growthClassification = 'Needs Attention';
        else if (isImproving) growthClassification = 'Improving';
        else if (change < 5) growthClassification = 'Stable';
      }

      // Module completion
      const maxModules = student.course === 'Web Development' ? 5
        : student.course === 'DSA' ? 5
        : student.course === 'Python' ? 3 : 5;

      monitoringData.push({
        studentId: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        course: student.course,
        currentOGI,
        ogiTrend,
        growthClassification,
        moduleCompletionProgress: {
          completed: student.modules.length,
          total: maxModules,
        },
        weeklyLearningHours: Math.round(student.attendancePercentage / 100 * 5 * 3),
        skillAcquisitionCount: student.skillsAcquired ? student.skillsAcquired.length : 0,
        learningStreak: student.learningStreak || 0,
      });
    }

    // Filter by growth classification
    const filtered = growth
      ? monitoringData.filter((m) => m.growthClassification === growth)
      : monitoringData;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get weekly snapshots for a student
// @route   GET /api/analytics/snapshots
const getWeeklySnapshots = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId query parameter is required' });
    }

    const snapshots = await WeeklySnapshot.find({ studentId }).sort({ weekNumber: 1 });

    // Add week-to-week change
    const result = snapshots.map((s, i) => {
      const prev = i > 0 ? snapshots[i - 1].OGI : s.OGI;
      const diff = s.OGI - prev;
      let trend = 'stagnation';
      if (diff > 2) trend = 'improvement';
      else if (diff < -2) trend = 'declining';

      return {
        ...s.toObject(),
        ogiChange: parseFloat(diff.toFixed(2)),
        trend,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate weekly snapshots for all students
// @route   POST /api/analytics/generate-snapshots
const generateWeeklySnapshots = async (req, res) => {
  try {
    const students = await Student.find();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Determine current week number
    const existingMax = await WeeklySnapshot.findOne().sort({ weekNumber: -1 });
    const weekNumber = existingMax ? existingMax.weekNumber + 1 : 1;

    let count = 0;
    for (const student of students) {
      // Quiz average
      const quizzes = await Quiz.find({ 'attempts.studentId': student._id });
      let quizTotal = 0, quizCount = 0;
      quizzes.forEach((q) => {
        q.attempts.forEach((a) => {
          if (a.studentId.toString() === student._id.toString()) {
            quizTotal += (a.score / q.totalMarks) * 100;
            quizCount++;
          }
        });
      });
      const quizAverage = quizCount > 0 ? Math.round(quizTotal / quizCount) : 0;

      // Assignment average
      const assignments = await Assignment.find({ 'submissions.studentId': student._id });
      let assTotal = 0, assCount = 0;
      assignments.forEach((a) => {
        a.submissions.forEach((s) => {
          if (s.studentId.toString() === student._id.toString() && s.status === 'Evaluated') {
            assTotal += (s.marks / a.maxMarks) * 100;
            assCount++;
          }
        });
      });
      const assignmentAverage = assCount > 0 ? Math.round(assTotal / assCount) : 0;

      // Attendance percentage
      const attendancePercentage = student.attendancePercentage || 0;

      // Completion rate
      const maxModules = student.course === 'Web Development' ? 5
        : student.course === 'DSA' ? 5
        : student.course === 'Python' ? 3 : 5;
      const completionRate = Math.round((student.modules.length / maxModules) * 100);

      // Submission consistency
      let submitted = 0, totalSubs = 0;
      assignments.forEach((a) => {
        a.submissions.forEach((s) => {
          if (s.studentId.toString() === student._id.toString()) {
            totalSubs++;
            if (s.status === 'Submitted' || s.status === 'Evaluated') {
              submitted++;
            }
          }
        });
      });
      const submissionConsistency = totalSubs > 0 ? Math.round((submitted / totalSubs) * 100) : 0;

      const snapshot = new WeeklySnapshot({
        studentId: student._id,
        weekNumber,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        quizAverage,
        assignmentAverage,
        completionRate,
        submissionConsistency,
        attendancePercentage,
      });
      await snapshot.save(); // pre-save hook calculates OGI
      count++;
    }

    res.json({ message: `${count} weekly snapshots generated for week ${weekNumber}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download student report as JSON
// @route   GET /api/analytics/download/:studentId
const downloadStudentReport = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const snapshots = await WeeklySnapshot.find({ studentId: student._id })
      .sort({ weekNumber: 1 });

    const assignments = await Assignment.find({ 'submissions.studentId': student._id });
    const assignmentSubmissions = [];
    assignments.forEach((a) => {
      const sub = a.submissions.find((s) => s.studentId.toString() === student._id.toString());
      if (sub) {
        assignmentSubmissions.push({
          title: a.title,
          maxMarks: a.maxMarks,
          marks: sub.marks,
          status: sub.status,
          deadline: a.deadline,
        });
      }
    });

    const quizzes = await Quiz.find({ 'attempts.studentId': student._id });
    const quizAttempts = [];
    quizzes.forEach((q) => {
      const attempt = q.attempts.find((a) => a.studentId.toString() === student._id.toString());
      if (attempt) {
        quizAttempts.push({
          title: q.title,
          totalMarks: q.totalMarks,
          score: attempt.score,
          attemptedAt: attempt.attemptedAt,
        });
      }
    });

    const attendanceRecords = await Attendance.find({ 'records.studentId': student._id })
      .populate('batchId', 'batchName')
      .sort({ date: -1 });

    const attendanceData = attendanceRecords.map((r) => {
      const rec = r.records.find((rec) => rec.studentId.toString() === student._id.toString());
      return {
        date: r.date,
        batch: r.batchId?.batchName || '',
        status: rec ? rec.status : 'Unknown',
      };
    });

    res.json({
      student: {
        name: student.name,
        enrollmentId: student.enrollmentId,
        email: student.email,
        course: student.course,
        modules: student.modules,
        attendancePercentage: student.attendancePercentage,
        skillsAcquired: student.skillsAcquired,
        learningStreak: student.learningStreak,
      },
      weeklySnapshots: snapshots,
      assignmentSubmissions,
      quizAttempts,
      attendanceRecords: attendanceData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getClassAnalytics,
  getStudentMonitoring,
  getWeeklySnapshots,
  generateWeeklySnapshots,
  downloadStudentReport,
};
