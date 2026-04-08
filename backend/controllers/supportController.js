// ============================================
// Support Controller
// Handle support requests, replies, and backup classes
// ============================================

const SupportRequest = require('../models/SupportRequest');

// @desc    Get all support requests (with filters)
// @route   GET /api/support
const getSupportRequests = async (req, res) => {
  try {
    const { course, status } = req.query;
    const filter = {};
    if (course) filter.course = { $regex: course, $options: 'i' };
    if (status) filter.status = status;

    const requests = await SupportRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reply to a support request
// @route   POST /api/support/reply/:id
const replyToRequest = async (req, res) => {
  try {
    const { reply, replyFileUrl } = req.body;
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { reply, replyFileUrl: replyFileUrl || '' },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Support request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark a support request as resolved
// @route   PUT /api/support/resolve/:id
const resolveRequest = async (req, res) => {
  try {
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved' },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Support request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Schedule a backup class
// @route   PUT /api/support/backup/:id
const scheduleBackupClass = async (req, res) => {
  try {
    const { backupClassDate } = req.body;
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { backupClassScheduled: true, backupClassDate },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Support request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSupportRequests, replyToRequest, resolveRequest, scheduleBackupClass };
