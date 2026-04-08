// ============================================
// Support Requests Page
// List, filter, reply, resolve, and schedule backup classes
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineSupport, HiOutlineReply, HiOutlineCheck,
  HiOutlineCalendar, HiOutlinePaperClip, HiOutlineFilter,
} from 'react-icons/hi';

const SupportRequests = () => {
  const { API_URL } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [backupDates, setBackupDates] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [courseFilter, statusFilter]);

  const fetchRequests = async () => {
    try {
      let url = `${API_URL}/support?`;
      if (courseFilter) url += `course=${courseFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await axios.get(url);
      setRequests(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reply to a request
  const handleReply = async (id) => {
    const reply = replyTexts[id];
    if (!reply?.trim()) return;
    try {
      await axios.post(`${API_URL}/support/reply/${id}`, { reply });
      setReplyTexts({ ...replyTexts, [id]: '' });
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Mark as resolved
  const handleResolve = async (id) => {
    try {
      await axios.put(`${API_URL}/support/resolve/${id}`);
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Schedule backup class
  const handleBackup = async (id) => {
    const date = backupDates[id];
    if (!date) return;
    try {
      await axios.put(`${API_URL}/support/backup/${id}`, { backupClassDate: date });
      setBackupDates({ ...backupDates, [id]: '' });
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Unique courses from requests
  const courses = [...new Set(requests.map((r) => r.course))];

  if (loading) return <div className="page-loading">Loading support requests...</div>;

  return (
    <div className="support-page">
      <h2 className="page-title">
        <HiOutlineSupport /> Support Requests
      </h2>

      {/* Filters */}
      <div className="search-bar-row">
        <div className="filter-group">
          <HiOutlineFilter />
          <select className="form-input filter-select" value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input filter-select" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Request Cards */}
      <div className="support-grid">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req._id} className="support-card">
              {/* Card Header */}
              <div className="support-card-header">
                <div>
                  <h3 className="support-student">{req.studentName}</h3>
                  <p className="support-meta">{req.studentId} • {req.course}</p>
                </div>
                <span className="status-badge" style={{
                  backgroundColor: req.status === 'Pending' ? '#f59e0b20' : '#22c55e20',
                  color: req.status === 'Pending' ? '#f59e0b' : '#22c55e',
                }}>
                  {req.status}
                </span>
              </div>

              {/* Topic and Description */}
              <div className="support-body">
                <h4 className="support-topic">{req.topic}</h4>
                <p className="support-desc">{req.description}</p>
                {req.attachmentUrl && (
                  <a href={req.attachmentUrl} className="attachment-link">
                    <HiOutlinePaperClip /> View Attachment
                  </a>
                )}
              </div>

              {/* Existing Reply */}
              {req.reply && (
                <div className="support-reply-box">
                  <strong>Reply:</strong> {req.reply}
                  {req.replyFileUrl && (
                    <a href={req.replyFileUrl} className="link"> (File attached)</a>
                  )}
                </div>
              )}

              {/* Backup Class Info */}
              {req.backupClassScheduled && (
                <div className="backup-info">
                  <HiOutlineCalendar />
                  Backup class scheduled: {new Date(req.backupClassDate).toLocaleDateString()}
                </div>
              )}

              {/* Actions */}
              <div className="support-actions">
                {/* Reply Input */}
                {req.status === 'Pending' && (
                  <>
                    <div className="reply-input-row">
                      <textarea
                        className="form-input form-textarea-sm"
                        placeholder="Type your reply..."
                        value={replyTexts[req._id] || ''}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [req._id]: e.target.value })}
                      />
                      <button className="btn-primary btn-sm" onClick={() => handleReply(req._id)}>
                        <HiOutlineReply /> Reply
                      </button>
                    </div>

                    <div className="action-buttons">
                      <button className="btn-success btn-sm" onClick={() => handleResolve(req._id)}>
                        <HiOutlineCheck /> Mark Resolved
                      </button>
                      <div className="backup-input">
                        <input type="date" className="form-input-sm"
                          value={backupDates[req._id] || ''}
                          onChange={(e) => setBackupDates({ ...backupDates, [req._id]: e.target.value })} />
                        <button className="btn-secondary btn-sm" onClick={() => handleBackup(req._id)}>
                          <HiOutlineCalendar /> Schedule Backup
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Created Date */}
              <div className="support-footer">
                Created: {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No support requests found.</p>
        )}
      </div>
    </div>
  );
};

export default SupportRequests;
