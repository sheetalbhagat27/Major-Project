// // ============================================
// // Attendance Controller
// // Record, edit, and view attendance with remark validation
// // ============================================

// const Attendance = require('../models/Attendance');

// // @desc    Get attendance records for a batch
// // @route   GET /api/attendance/:batchId
// const getAttendanceByBatch = async (req, res) => {
//   try {
//     const records = await Attendance.find({ batchId: req.params.batchId })
//       .populate('records.studentId', 'name enrollmentId')
//       .sort({ date: -1 });
//     res.json(records);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // @desc    Submit attendance
// // @route   POST /api/attendance
// const submitAttendance = async (req, res) => {
//   try {
//     const { batchId, date, remark, records } = req.body;

//     // Remark is mandatory
//     if (!remark || remark.trim() === '') {
//       return res.status(400).json({ message: 'Remark is required for attendance submission' });
//     }

//     const attendance = await Attendance.create({
//       batchId,
//       date: date || new Date(),
//       remark,
//       records,
//       submittedAt: new Date(),
//       isEditable: true,
//     });

//     res.status(201).json(attendance);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // @desc    Edit attendance (only if within 10-minute window)
// // @route   PUT /api/attendance/:id
// const editAttendance = async (req, res) => {
//   try {
//     const attendance = await Attendance.findById(req.params.id);
//     if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

//     // Check if editing window has passed
//     if (!attendance.isEditable) {
//       return res.status(403).json({ message: 'Editing window has passed (10 minutes). Cannot modify.' });
//     }

//     // Update the records and remark
//     if (req.body.records) attendance.records = req.body.records;
//     if (req.body.remark) attendance.remark = req.body.remark;
//     await attendance.save();

//     res.json(attendance);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // @desc    Get attendance history for a specific student
// // @route   GET /api/attendance/student/:studentId
// const getStudentAttendance = async (req, res) => {
//   try {
//     const records = await Attendance.find({ 'records.studentId': req.params.studentId })
//       .populate('batchId', 'batchName')
//       .sort({ date: -1 });

//     // Extract only the relevant student record from each attendance entry
//     const studentRecords = records.map((r) => {
//       const studentRecord = r.records.find(
//         (rec) => rec.studentId.toString() === req.params.studentId
//       );
//       return {
//         _id: r._id,
//         batchId: r.batchId,
//         date: r.date,
//         remark: r.remark,
//         status: studentRecord ? studentRecord.status : 'Unknown',
//       };
//     });

//     res.json(studentRecords);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { getAttendanceByBatch, submitAttendance, editAttendance, getStudentAttendance };

// ============================================
// Attendance Controller - WITH OGI UPDATE
// ============================================

const Attendance = require('../models/Attendance');
const Student = require('../models/Student');           // ✅ ADD
const { calculateOGI } = require('../services/ogi.service');  // ✅ ADD

// @desc    Submit attendance (OGI AUTO UPDATE)
// @route   POST /api/attendance
const submitAttendance = async (req, res) => {
  try {
    const { batchId, date, remark, records } = req.body;

    // Remark is mandatory
    if (!remark || remark.trim() === '') {
      return res.status(400).json({ message: 'Remark is required for attendance submission' });
    }

    const attendance = await Attendance.create({
      batchId,
      date: date || new Date(),
      remark,
      records,
      submittedAt: new Date(),
      isEditable: true,
    });

    // ✅ OGI UPDATE FOR ALL STUDENTS IN RECORDS
    for (const record of records) {
      const student = await Student.findById(record.studentId);
      if (student) {
        student.OGI = calculateOGI(student);
        await student.save();
        console.log(`✅ OGI updated for: ${student.name}`);
      }
    }
    await updateStudentOGI(record.studentId);

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// बाकी functions same रहेंगे...
const getAttendanceByBatch = async (req, res) => {
  // ... existing code
};

const editAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

    if (!attendance.isEditable) {
      return res.status(403).json({ message: 'Editing window has passed (10 minutes). Cannot modify.' });
    }

    // Update the records and remark
    if (req.body.records) attendance.records = req.body.records;
    if (req.body.remark) attendance.remark = req.body.remark;
    await attendance.save();
    await updateStudentOGI(record.studentId);

    // ✅ OGI UPDATE भी edit के बाद
    for (const record of attendance.records) {
      const student = await Student.findById(record.studentId);
      if (student) {
        student.OGI = calculateOGI(student);
        await student.save();
      }
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  // ... existing code same
};

module.exports = { getAttendanceByBatch, submitAttendance, editAttendance, getStudentAttendance };
