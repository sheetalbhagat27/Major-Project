// // ============================================
// // Student Model
// // Stores student profile, courses, and progress
// // ============================================

// const mongoose = require('mongoose');

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   enrollmentId: { type: String, required: true, unique: true },
//   email: { type: String, required: true },
//   phone: { type: String, default: '' },
//   course: { type: String, required: true },
//   modules: [{ type: String }],
//   github: { type: String, default: '' },
//   linkedin: { type: String, default: '' },
//   attendancePercentage: { type: Number, default: 0 },
//   status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
//   profileImage: { type: String, default: '' },
//   skillsAcquired: [{ type: String }],
//   learningStreak: { type: Number, default: 0 },
//   OGI: { type: Number, default: 0 },
// }, { timestamps: true });

// module.exports = mongoose.model('Student', studentSchema);

// ============================================
// Student Model - COMPLETE WITH OGI MIDDLEWARE
// ============================================

const mongoose = require('mongoose');

// ✅ OGI service import (top पर)
const { calculateOGI } = require('../services/ogi.service.js');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  course: { type: String, required: true },
  modules: [{ type: String }],
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  attendancePercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
  profileImage: { type: String, default: '' },
  skillsAcquired: [{ type: String }],
  learningStreak: { type: Number, default: 0 },
  OGI: { type: Number, default: 0 },
}, { timestamps: true });

// ✅ MIDDLEWARE - Schema define करने के बाद, model बनाने से पहले
studentSchema.post('save', async function(doc) {
  console.log('🔄 OGI recalculating for:', doc.name);
  doc.OGI = calculateOGI(doc);
  await doc.save({ validateBeforeSave: false }); // Recursive save prevent
});

// ✅ Update operations के लिए भी
studentSchema.post('updateOne', async function() {
  const query = this.getUpdate();
  // attendancePercentage, marks जैसे fields update होने पर
  if (query.$set?.attendancePercentage !== undefined || 
      query.$set?.assignments !== undefined ||
      query.$set?.quizzes !== undefined) {
    
    const student = await this.model.findOne(this.getQuery());
    if (student) {
      student.OGI = calculateOGI(student);
      await student.save();
    }
  }
});

// ✅ Model export (सबसे last में)
module.exports = mongoose.model('Student', studentSchema);
