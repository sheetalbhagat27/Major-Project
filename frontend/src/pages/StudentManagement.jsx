// ============================================
// Student Management Page
// Search, filter, table, and detailed modal with 3 tabs
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineUsers, HiOutlineSearch, HiOutlineX,
  HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineCalendar,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const StudentManagement = () => {
  const { API_URL } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('course');
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student detail
  const openStudentDetail = async (student) => {
    setSelectedStudent(student);
    setDetailTab('course');
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/students/${student._id}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = !courseFilter || s.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  // Summary counts
  const totalStudents = students.length;
  const ongoingStudents = students.filter((s) => s.status === 'Ongoing').length;
  const completedStudents = students.filter((s) => s.status === 'Completed').length;

  // Unique courses
  const courses = [...new Set(students.map((s) => s.course))];

  // Attendance color
  const attColor = (pct) => {
    if (pct >= 75) return '#22c55e';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="page-loading">Loading students...</div>;

  return (
    <div className="student-page">
      <h2 className="page-title">
        <HiOutlineUsers /> Student Management
      </h2>

      {/* Summary Cards */}
      <div className="kpi-grid kpi-grid-3">
        <div className="kpi-card kpi-blue">
          <div className="kpi-content">
            <p className="kpi-value">{totalStudents}</p>
            <p className="kpi-label">Total Students</p>
          </div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-content">
            <p className="kpi-value">{ongoingStudents}</p>
            <p className="kpi-label">Ongoing</p>
          </div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-content">
            <p className="kpi-value">{completedStudents}</p>
            <p className="kpi-label">Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-bar-row">
        <div className="search-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input type="text" className="search-input" placeholder="Search by name, ID, or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input filter-select" value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Student Table */}
      <div className="dash-card">
        <div className="attendance-table-wrap">
          <table className="data-table student-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Enrollment ID</th>
                <th>Course</th>
                <th>Modules</th>
                <th>Attendance %</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GitHub</th>
                <th>LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s._id} className="clickable-row" onClick={() => openStudentDetail(s)}>
                  <td>
                    <div className="student-avatar">
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.name} />
                      ) : (
                        <span>{s.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>
                  <td className="student-name-cell">{s.name}</td>
                  <td>{s.enrollmentId}</td>
                  <td>{s.course}</td>
                  <td>{s.modules?.length || 0}</td>
                  <td>
                    <span className="att-badge" style={{ color: attColor(s.attendancePercentage) }}>
                      {s.attendancePercentage}%
                    </span>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.github ? <a href={s.github} className="link" onClick={(e) => e.stopPropagation()}>↗</a> : '—'}</td>
                  <td>{s.linkedin ? <a href={s.linkedin} className="link" onClick={(e) => e.stopPropagation()}>↗</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== STUDENT DETAIL MODAL ==================== */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}>
          <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="student-modal-header">
                <div className="student-avatar lg">
                  <span>{selectedStudent.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="modal-title">{selectedStudent.name}</h3>
                  <p className="student-modal-sub">{selectedStudent.enrollmentId} • {selectedStudent.course}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}>
                <HiOutlineX />
              </button>
            </div>

            {/* Tabs */}
            <div className="filter-tabs modal-tabs">
              <button className={`filter-tab ${detailTab === 'course' ? 'filter-tab-active' : ''}`}
                onClick={() => setDetailTab('course')}>
                <HiOutlineAcademicCap /> Course Info
              </button>
              <button className={`filter-tab ${detailTab === 'progress' ? 'filter-tab-active' : ''}`}
                onClick={() => setDetailTab('progress')}>
                <HiOutlineChartBar /> Progress
              </button>
              <button className={`filter-tab ${detailTab === 'attendance' ? 'filter-tab-active' : ''}`}
                onClick={() => setDetailTab('attendance')}>
                <HiOutlineCalendar /> Attendance
              </button>
            </div>

            {detailLoading ? (
              <div className="page-loading">Loading details...</div>
            ) : studentDetail ? (
              <div className="modal-body">
                {/* TAB 1: Course Information */}
                {detailTab === 'course' && (
                  <div className="detail-tab-content">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Current Course</label>
                        <p>{selectedStudent.course}</p>
                      </div>
                      <div className="detail-item">
                        <label>Enrollment Number</label>
                        <p>{selectedStudent.enrollmentId}</p>
                      </div>
                      <div className="detail-item">
                        <label>Email</label>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div className="detail-item">
                        <label>Learning Streak</label>
                        <p>🔥 {selectedStudent.learningStreak} days</p>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="detail-section">
                      <h4>Modules ({selectedStudent.modules?.length || 0})</h4>
                      <div className="tag-list">
                        {selectedStudent.modules?.map((m, i) => (
                          <span key={i} className="tag">{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="detail-section">
                      <h4>Skills Acquired</h4>
                      <div className="tag-list">
                        {selectedStudent.skillsAcquired?.map((s, i) => (
                          <span key={i} className="tag tag-skill">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Activity Chart */}
                    <div className="detail-section">
                      <h4>Weekly Activity</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { day: 'Mon', activity: 3 }, { day: 'Tue', activity: 5 },
                          { day: 'Wed', activity: 2 }, { day: 'Thu', activity: 4 },
                          { day: 'Fri', activity: 6 }, { day: 'Sat', activity: 1 }, { day: 'Sun', activity: 0 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="day" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Bar dataKey="activity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* TAB 2: Progress */}
                {detailTab === 'progress' && (
                  <div className="detail-tab-content">
                    {/* Overall Progress */}
                    <div className="progress-big">
                      <div className="progress-big-number">{studentDetail.progressPercentage}%</div>
                      <p>Overall Progress</p>
                    </div>

                    {/* Module-wise progress */}
                    <div className="detail-section">
                      <h4>Module-wise Completion</h4>
                      {selectedStudent.modules?.map((m, i) => (
                        <div key={i} className="module-progress">
                          <span>{m}</span>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, ((i + 1) / selectedStudent.modules.length) * 100)}%`, backgroundColor: '#6366f1' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Assignment Summary */}
                    <div className="detail-section">
                      <h4>Assignment Summary</h4>
                      <p>{studentDetail.assignmentSubmissions?.length || 0} submitted</p>
                      {studentDetail.assignmentSubmissions?.map((a, i) => (
                        <div key={i} className="submission-item">
                          <span>{a.assignmentTitle}</span>
                          <span className="status-badge" style={{
                            backgroundColor: a.status === 'Evaluated' ? '#22c55e20' : '#f59e0b20',
                            color: a.status === 'Evaluated' ? '#22c55e' : '#f59e0b',
                          }}>{a.status}</span>
                          {a.status === 'Evaluated' && <span>{a.marks}/{a.maxMarks}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Quiz Summary */}
                    <div className="detail-section">
                      <h4>Quiz Summary</h4>
                      <p>{studentDetail.quizAttempts?.length || 0} attempted</p>
                      {studentDetail.quizAttempts?.map((q, i) => (
                        <div key={i} className="submission-item">
                          <span>{q.quizTitle}</span>
                          <span>{q.score}/{q.totalMarks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Attendance */}
                {detailTab === 'attendance' && (
                  <div className="detail-tab-content">
                    {/* Attendance Summary */}
                    <div className="att-summary">
                      <div className="att-summary-item">
                        <div className="att-big" style={{ color: attColor(selectedStudent.attendancePercentage) }}>
                          {selectedStudent.attendancePercentage}%
                        </div>
                        <p>Overall Attendance</p>
                      </div>
                      <div className="att-summary-item">
                        <div className="att-big" style={{ color: '#22c55e' }}>
                          {studentDetail.attendanceRecords?.filter((r) => r.status === 'Present').length || 0}
                        </div>
                        <p>Present</p>
                      </div>
                      <div className="att-summary-item">
                        <div className="att-big" style={{ color: '#ef4444' }}>
                          {studentDetail.attendanceRecords?.filter((r) => r.status === 'Absent').length || 0}
                        </div>
                        <p>Absent</p>
                      </div>
                      <div className="att-summary-item">
                        <div className="att-big" style={{ color: '#f59e0b' }}>
                          {studentDetail.attendanceRecords?.filter((r) => r.status === 'Late').length || 0}
                        </div>
                        <p>Late</p>
                      </div>
                    </div>

                    {/* Attendance Records Table */}
                    <div className="detail-section">
                      <h4>Date-wise Attendance</h4>
                      {studentDetail.attendanceRecords?.length > 0 ? (
                        <table className="data-table">
                          <thead>
                            <tr><th>Date</th><th>Batch</th><th>Status</th><th>Remark</th></tr>
                          </thead>
                          <tbody>
                            {studentDetail.attendanceRecords.map((r, i) => (
                              <tr key={i}>
                                <td>{new Date(r.date).toLocaleDateString()}</td>
                                <td>{r.batchId?.batchName || '—'}</td>
                                <td>
                                  <span className="status-badge" style={{
                                    backgroundColor: (r.status === 'Present' ? '#22c55e' : r.status === 'Absent' ? '#ef4444' : '#f59e0b') + '20',
                                    color: r.status === 'Present' ? '#22c55e' : r.status === 'Absent' ? '#ef4444' : '#f59e0b',
                                  }}>{r.status}</span>
                                </td>
                                <td>{r.remark}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">No attendance records found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
