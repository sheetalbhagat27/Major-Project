// ============================================
// Batch Management Page
// List batches with filters, progress bars, and actions
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineCollection, HiOutlinePlus, HiOutlinePencil,
  HiOutlineStop, HiOutlineCalendar, HiOutlineUsers,
} from 'react-icons/hi';

const BatchManagement = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    batchName: '', batchType: '', totalStudents: 0,
    status: 'Upcoming', startDate: '', endDate: '',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/batches`);
      setBatches(res.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter batches by status
  const filteredBatches = filter === 'All'
    ? batches
    : batches.filter((b) => b.status === filter);

  // Create a new batch
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/batches`, form);
      setShowModal(false);
      setForm({ batchName: '', batchType: '', totalStudents: 0, status: 'Upcoming', startDate: '', endDate: '' });
      fetchBatches();
    } catch (err) {
      console.error('Error creating batch:', err);
    }
  };

  // End a batch
  const handleEndBatch = async (id) => {
    if (!confirm('Are you sure you want to end this batch?')) return;
    try {
      await axios.put(`${API_URL}/batches/${id}/end`);
      fetchBatches();
    } catch (err) {
      console.error('Error ending batch:', err);
    }
  };

  // Status color mapping
  const statusColor = {
    Ongoing: '#22c55e',
    Completed: '#6366f1',
    Upcoming: '#f59e0b',
  };

  // Progress bar color
  const progressColor = (p) => {
    if (p >= 75) return '#22c55e';
    if (p >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="page-loading">Loading batches...</div>;

  return (
    <div className="batch-page">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">
          <HiOutlineCollection /> Batch Management
        </h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Create Batch
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['All', 'Ongoing', 'Completed', 'Upcoming'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Batch Cards Grid */}
      <div className="batch-grid">
        {filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => (
            <div key={batch._id} className="batch-card">
              <div className="batch-card-header">
                <h3 className="batch-name">{batch.batchName}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColor[batch.status] + '20', color: statusColor[batch.status] }}
                >
                  {batch.status}
                </span>
              </div>

              <p className="batch-type">{batch.batchType}</p>

              <div className="batch-info">
                <span><HiOutlineUsers /> {batch.totalStudents} Students</span>
                <span><HiOutlineCalendar /> {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{batch.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${batch.progress}%`,
                      backgroundColor: progressColor(batch.progress),
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="batch-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/attendance/${batch._id}`)}
                >
                  Manage
                </button>
                {batch.status === 'Ongoing' && (
                  <button
                    className="btn-danger"
                    onClick={() => handleEndBatch(batch._id)}
                  >
                    <HiOutlineStop /> End
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No batches found for this filter.</p>
        )}
      </div>

      {/* Create Batch Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create New Batch</h3>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Batch Name</label>
                <input type="text" className="form-input" required
                  value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Type</label>
                <input type="text" className="form-input" required placeholder="e.g., Regular, Intensive, Weekend"
                  value={form.batchType} onChange={(e) => setForm({ ...form, batchType: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Students</label>
                  <input type="number" className="form-input"
                    value={form.totalStudents} onChange={(e) => setForm({ ...form, totalStudents: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Upcoming</option>
                    <option>Ongoing</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input"
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input"
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
