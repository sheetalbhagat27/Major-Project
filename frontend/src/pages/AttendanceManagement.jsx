// ============================================
// Attendance Management Page
// Mark attendance, remark validation, history, CSV export
// ============================================

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineClipboardCheck, HiOutlineDownload, HiOutlinePencil,
  HiOutlineCalendar, HiOutlineCheck, HiOutlineX,
} from 'react-icons/hi';

const AttendanceManagement = () => {
  const { batchId } = useParams();
  const { API_URL } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [loading, setLoading] = useState(true);
  const [batchName, setBatchName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const fetchData = async () => {
    try {
      // Fetch batch details to get students
      const batchRes = await axios.get(`${API_URL}/batches`);
      const batch = batchRes.data.find((b) => b._id === batchId);
      if (batch) {
        setBatchName(batch.batchName);
        // Fetch all students for this batch
        const studentRes = await axios.get(`${API_URL}/students`);
        const batchStudentIds = batch.students.map((s) => (typeof s === 'object' ? s._id : s));
        const batchStudents = studentRes.data.filter((s) => batchStudentIds.includes(s._id));
        setStudents(batchStudents);
        // Initialize records
        setRecords(batchStudents.map((s) => ({ studentId: s._id, name: s.name, status: 'Present' })));
      }
      // Fetch attendance history
      const attRes = await axios.get(`${API_URL}/attendance/${batchId}`);
      setAttendanceRecords(attRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update student status
  const updateStatus = (studentId, status) => {
    setRecords(records.map((r) => r.studentId === studentId ? { ...r, status } : r));
  };

  // Submit attendance
  const handleSubmit = async () => {
    setRemarkError('');
    if (!remark.trim()) {
      setRemarkError('Remark is required before submitting attendance');
      return;
    }
    try {
      const payload = {
        batchId,
        date: selectedDate,
        remark,
        records: records.map((r) => ({ studentId: r.studentId, status: r.status })),
      };
      await axios.post(`${API_URL}/attendance`, payload);
      setRemark('');
      fetchData();
    } catch (err) {
      console.error('Error submitting attendance:', err);
    }
  };

  // Edit attendance (only if editable)
  const handleEdit = async (id, updatedRecords, updatedRemark) => {
    try {
      await axios.put(`${API_URL}/attendance/${id}`, {
        records: updatedRecords,
        remark: updatedRemark,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot edit this record');
    }
  };

  // Export as CSV
  const exportCSV = () => {
    let csv = 'Date,Remark,Student,Status\n';
    attendanceRecords.forEach((a) => {
      a.records.forEach((r) => {
        const name = r.studentId?.name || r.studentId || 'Unknown';
        csv += `"${new Date(a.date).toLocaleDateString()}","${a.remark}","${name}","${r.status}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${batchName || 'batch'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Status colors
  const statusColors = {
    Present: '#22c55e',
    Absent: '#ef4444',
    Late: '#f59e0b',
  };

  if (loading) return <div className="page-loading">Loading attendance...</div>;

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">
          <HiOutlineClipboardCheck /> Attendance — {batchName || 'Batch'}
        </h2>
        <button className="btn-secondary" onClick={exportCSV}>
          <HiOutlineDownload /> Export CSV
        </button>
      </div>

      {/* Mark Attendance Section */}
      <div className="dash-card">
        <h3 className="dash-card-title">Mark Attendance</h3>

        <div className="form-row" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Remark *</label>
            <input type="text" className="form-input" placeholder="E.g., Chapter 5 - Arrays Lecture"
              value={remark} onChange={(e) => { setRemark(e.target.value); setRemarkError(''); }} />
            {remarkError && <p className="field-error">{remarkError}</p>}
          </div>
        </div>

        {/* Student List with Status Toggles */}
        <div className="attendance-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.studentId}>
                  <td>{r.name}</td>
                  {['Present', 'Absent', 'Late'].map((status) => (
                    <td key={status}>
                      <button
                        className={`status-toggle ${r.status === status ? 'status-active' : ''}`}
                        style={r.status === status ? { backgroundColor: statusColors[status], color: '#fff' } : {}}
                        onClick={() => updateStatus(r.studentId, status)}
                      >
                        {status === 'Present' ? <HiOutlineCheck /> : status === 'Absent' ? <HiOutlineX /> : '⏱'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={handleSubmit}>
          Submit Attendance
        </button>
      </div>

      {/* Attendance History */}
      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="dash-card-title">
          <HiOutlineCalendar /> Attendance History
        </h3>
        {attendanceRecords.length > 0 ? (
          <div className="attendance-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Remark</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Editable</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((a) => {
                  const present = a.records.filter((r) => r.status === 'Present').length;
                  const absent = a.records.filter((r) => r.status === 'Absent').length;
                  const late = a.records.filter((r) => r.status === 'Late').length;
                  return (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.remark}</td>
                      <td><span style={{ color: '#22c55e' }}>{present}</span></td>
                      <td><span style={{ color: '#ef4444' }}>{absent}</span></td>
                      <td><span style={{ color: '#f59e0b' }}>{late}</span></td>
                      <td>
                        {a.isEditable ? (
                          <span className="status-badge" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
                            <HiOutlinePencil /> Editable
                          </span>
                        ) : (
                          <span className="status-badge" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No attendance records yet.</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
