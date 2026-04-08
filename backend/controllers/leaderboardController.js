// ============================================
// Leaderboard Controller
// Ranked student leaderboard with OGI sorting
// ============================================

const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const WeeklySnapshot = require('../models/WeeklySnapshot');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { batch, course, sortBy } = req.query;
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

    const leaderboard = [];
    for (const student of students) {
      // Latest OGI from snapshot
      const latestSnapshot = await WeeklySnapshot.findOne({ studentId: student._id })
        .sort({ weekNumber: -1 });
      const OGI = latestSnapshot ? latestSnapshot.OGI : 0;

      // Assignment score average
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
      const assignmentScore = assCount > 0 ? Math.round(assTotal / assCount) : 0;

      // Quiz score average
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
      const quizScore = quizCount > 0 ? Math.round(quizTotal / quizCount) : 0;

      // Growth classification
      const snapshots = await WeeklySnapshot.find({ studentId: student._id })
        .sort({ weekNumber: -1 })
        .limit(3);
      const trend = snapshots.reverse();

      let growthClassification = 'Stable';
      if (OGI >= 80) {
        growthClassification = 'Excellent';
      } else if (OGI < 50) {
        growthClassification = 'Needs Attention';
      } else if (trend.length >= 3) {
        const isImproving = trend[2].OGI > trend[0].OGI && trend[2].OGI > trend[1].OGI;
        const isDeclining = trend[2].OGI < trend[0].OGI && trend[2].OGI < trend[1].OGI;
        if (isDeclining) growthClassification = 'Needs Attention';
        else if (isImproving) growthClassification = 'Improving';
      }

      // Find batch name
      const studentBatch = await Batch.findOne({ students: student._id });

      leaderboard.push({
        studentId: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        course: student.course,
        batch: studentBatch ? studentBatch.batchName : 'N/A',
        OGI: Math.round(OGI * 100) / 100,
        attendancePercentage: student.attendancePercentage,
        assignmentScore,
        quizScore,
        growthClassification,
      });
    }

    // Sort
    const sortField = sortBy === 'attendance' ? 'attendancePercentage'
      : sortBy === 'assignmentScore' ? 'assignmentScore'
      : 'OGI';
    leaderboard.sort((a, b) => b[sortField] - a[sortField]);

    // Add ranks
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update/recalculate leaderboard
// @route   POST /api/leaderboard/update
const updateLeaderboard = async (req, res) => {
  try {
    const students = await Student.find();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

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

      const attendancePercentage = student.attendancePercentage || 0;
      const maxModules = student.course === 'Web Development' ? 5
        : student.course === 'DSA' ? 5
        : student.course === 'Python' ? 3 : 5;
      const completionRate = Math.round((student.modules.length / maxModules) * 100);

      let submitted = 0, totalSubs = 0;
      assignments.forEach((a) => {
        a.submissions.forEach((s) => {
          if (s.studentId.toString() === student._id.toString()) {
            totalSubs++;
            if (s.status === 'Submitted' || s.status === 'Evaluated') submitted++;
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
      await snapshot.save();
      count++;
    }

    // Return updated leaderboard
    const allStudents = await Student.find();
    const leaderboard = [];
    for (const student of allStudents) {
      const latestSnapshot = await WeeklySnapshot.findOne({ studentId: student._id })
        .sort({ weekNumber: -1 });
      const OGI = latestSnapshot ? latestSnapshot.OGI : 0;
      const studentBatch = await Batch.findOne({ students: student._id });

      leaderboard.push({
        rank: 0,
        studentId: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        course: student.course,
        batch: studentBatch ? studentBatch.batchName : 'N/A',
        OGI: Math.round(OGI * 100) / 100,
        attendancePercentage: student.attendancePercentage,
      });
    }

    leaderboard.sort((a, b) => b.OGI - a.OGI);
    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    res.json({ message: `Leaderboard updated. ${count} snapshots created for week ${weekNumber}.`, leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLeaderboard, updateLeaderboard };
