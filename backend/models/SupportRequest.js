// ============================================
// Support Request Model
// Stores student help requests and teacher replies
// ============================================

const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  course: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrl: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  reply: { type: String, default: '' },
  replyFileUrl: { type: String, default: '' },
  backupClassScheduled: { type: Boolean, default: false },
  backupClassDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
