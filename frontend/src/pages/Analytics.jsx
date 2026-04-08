// ============================================
// Analytics Page
// 3 tabs: Class Analytics, Student Monitoring, Weekly Snapshots
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineChartBar, HiOutlineUsers, HiOutlineCalendar,
  HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineTrendingUp,
  HiOutlineTrendingDown, HiOutlineMinus, HiOutlineFire, HiOutlineStar,
  HiOutlineDownload, HiOutlineRefresh,
} from 'react-icons/hi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const Analytics = () => {
  const { API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('class');
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [growthFilter, setGrowthFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'class') fetchClassAnalytics();
    else if (activeTab === 'monitoring') fetchStudentMonitoring();
    else if (activeTab === 'snapshots') fetchStudentList();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'monitoring') fetchStudentMonitoring();
  }, [courseFilter, growthFilter]);

  useEffect(() => {
    if (selectedStudentId) fetchSnapshots(selectedStudentId);
  }, [selectedStudentId]);

  const fetchClassAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/analytics/class`);
      setClassData(res.data);
    } catch (err) {
      setError('Failed to load class analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMonitoring = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (courseFilter) params.append('course', courseFilter);
      if (growthFilter) params.append('growth', growthFilter);
      const res = await axios.get(`${API_URL}/analytics/students?${params}`);
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load student monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/students`);
      setAllStudents(res.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchSnapshots = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/analytics/snapshots?studentId=${studentId}`);
      setSnapshots(res.data);
    } catch (err) {
      setError('Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const generateSnapshots = async () => {
    try {
      setGenerating(true);
      setGenMessage('');
      const res = await axios.post(`${API_URL}/analytics/generate-snapshots`);
      setGenMessage(res.data.message);
      if (selectedStudentId) fetchSnapshots(selectedStudentId);
    } catch (err) {
      setGenMessage('Failed to generate snapshots');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (studentId) => {
    try {
      const res = await axios.get(`${API_URL}/analytics/download/${studentId}`);
      const data = res.data;
      // Convert to CSV
      let csv = 'Section,Field,Value\n';
      csv += `Profile,Name,${data.student.name}\n`;
      csv += `Profile,Enrollment ID,${data.student.enrollmentId}\n`;
      csv += `Profile,Email,${data.student.email}\n`;
      csv += `Profile,Course,${data.student.course}\n`;
      csv += `Profile,Attendance %,${data.student.attendancePercentage}\n`;
      csv += `Profile,Learning Streak,${data.student.learningStreak}\n\n`;

      csv += 'Week,Quiz Avg,Assignment Avg,Attendance,Completion,OGI\n';
      data.weeklySnapshots.forEach((s) => {
        csv += `${s.weekNumber},${s.quizAverage},${s.assignmentAverage},${s.attendancePercentage},${s.completionRate},${s.OGI}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.student.enrollmentId}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const getHeatmapColor = (percentage) => {
    if (percentage === -1) return 'var(--bg-hover)';
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 75) return '#86efac';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getGrowthBadge = (classification) => {
    const colors = {
      Excellent: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
      Improving: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
      Stable: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
      'Needs Attention': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
    };
    const c = colors[classification] || colors.Stable;
    return (
      <span className="status-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {classification}
      </span>
    );
  };

  const getOGIColor = (ogi) => {
    if (ogi >= 80) return '#22c55e';
    if (ogi >= 60) return '#3b82f6';
    if (ogi >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const tabs = [
    { key: 'class', label: 'Class Analytics', icon: HiOutlineChartBar },
    { key: 'monitoring', label: 'Student Monitoring', icon: HiOutlineUsers },
    { key: 'snapshots', label: 'Weekly Snapshots', icon: HiOutlineCalendar },
  ];

  if (loading && !classData && students.length === 0) {
    return <div className="page-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <h2 className="page-title"><HiOutlineChartBar /> Analytics</h2>

      {/* Tab Navigation */}
      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${activeTab === tab.key ? 'filter-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="login-error">{error}</div>}

      {/* ═══════ TAB 1: CLASS ANALYTICS ═══════ */}
      {activeTab === 'class' && classData && (
        <div>
          {/* KPI Cards */}
          <div className="analytics-kpi-grid">
            <div className="kpi-card kpi-blue">
              <div className="kpi-icon-wrap"><HiOutlineAcademicCap /></div>
              <div className="kpi-content">
                <p className="kpi-value">{classData.averageQuizScore}%</p>
                <p className="kpi-label">Avg Quiz Score</p>
              </div>
            </div>
            <div className="kpi-card kpi-green">
              <div className="kpi-icon-wrap"><HiOutlineClipboardCheck /></div>
              <div className="kpi-content">
                <p className="kpi-value">{classData.averageAssignmentScore}%</p>
                <p className="kpi-label">Avg Assignment Score</p>
              </div>
            </div>
            <div className="kpi-card kpi-orange">
              <div className="kpi-icon-wrap"><HiOutlineTrendingUp /></div>
              <div className="kpi-content">
                <p className="kpi-value">{classData.submissionConsistency}%</p>
                <p className="kpi-label">Submission Consistency</p>
              </div>
            </div>
            <div className="kpi-card" style={{ borderLeft: '3px solid var(--cyan)' }}>
              <div className="kpi-icon-wrap" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyan)' }}>
                <HiOutlineChartBar />
              </div>
              <div className="kpi-content">
                <p className="kpi-value">{classData.moduleCompletionRate}%</p>
                <p className="kpi-label">Module Completion</p>
              </div>
            </div>
            <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="kpi-icon-wrap" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                <HiOutlineStar />
              </div>
              <div className="kpi-content">
                <p className="kpi-value" style={{ color: getOGIColor(classData.overallClassOGI) }}>
                  {classData.overallClassOGI}
                </p>
                <p className="kpi-label">Overall Class OGI</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-row">
            <div className="dash-card">
              <h3 className="dash-card-title"><HiOutlineTrendingUp /> Weekly Activity Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={classData.weeklyActivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="quizAttempts" stroke="#6366f1" strokeWidth={2} name="Quiz Attempts" dot={{ fill: '#6366f1' }} />
                  <Line type="monotone" dataKey="assignmentSubmissions" stroke="#22d3ee" strokeWidth={2} name="Assignment Submissions" dot={{ fill: '#22d3ee' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-card">
              <h3 className="dash-card-title"><HiOutlineChartBar /> Module-wise Attendance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classData.moduleWiseAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="batchName" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="attendancePercentage" name="Attendance %" radius={[4, 4, 0, 0]}>
                    {classData.moduleWiseAttendance.map((entry, idx) => (
                      <rect key={idx} fill={entry.attendancePercentage >= 80 ? '#22c55e' : entry.attendancePercentage >= 60 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Heatmap */}
          <div className="dash-card">
            <h3 className="dash-card-title"><HiOutlineCalendar /> Attendance Heatmap (Last 30 Days)</h3>
            <div className="heatmap-grid">
              {classData.attendanceHeatmap.map((day, i) => (
                <div
                  key={i}
                  className="heatmap-cell"
                  style={{ backgroundColor: getHeatmapColor(day.percentage) }}
                  title={day.percentage === -1
                    ? `${day.date}: No class`
                    : `${day.date}: ${day.percentage}% (P:${day.present} A:${day.absent} L:${day.late})`
                  }
                >
                  <span className="heatmap-date">{new Date(day.date).getDate()}</span>
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span><span className="heatmap-swatch" style={{ background: '#22c55e' }}></span>90%+</span>
              <span><span className="heatmap-swatch" style={{ background: '#86efac' }}></span>75-89%</span>
              <span><span className="heatmap-swatch" style={{ background: '#f59e0b' }}></span>50-74%</span>
              <span><span className="heatmap-swatch" style={{ background: '#ef4444' }}></span>&lt;50%</span>
              <span><span className="heatmap-swatch" style={{ background: 'var(--bg-hover)' }}></span>No class</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB 2: STUDENT MONITORING ═══════ */}
      {activeTab === 'monitoring' && (
        <div>
          {/* Filters */}
          <div className="search-bar-row">
            <select className="form-input filter-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All Courses</option>
              <option value="Web Development">Web Development</option>
              <option value="DSA">DSA</option>
              <option value="Python">Python</option>
            </select>
            <select className="form-input filter-select" value={growthFilter} onChange={(e) => setGrowthFilter(e.target.value)}>
              <option value="">All Growth Levels</option>
              <option value="Excellent">Excellent</option>
              <option value="Improving">Improving</option>
              <option value="Stable">Stable</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>

          {loading ? (
            <div className="page-loading">Loading student data...</div>
          ) : (
            <div className="monitoring-grid">
              {students.map((s) => (
                <div key={s.studentId} className="monitoring-card">
                  <div className="monitoring-card-header">
                    <div className="student-avatar">
                      {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="monitoring-info">
                      <h4>{s.name}</h4>
                      <p className="monitoring-enrollment">{s.enrollmentId}</p>
                    </div>
                    {getGrowthBadge(s.growthClassification)}
                  </div>

                  <div className="monitoring-course-badge">
                    <span className="tag">{s.course}</span>
                  </div>

                  {/* Mini OGI Trend Chart */}
                  <div className="monitoring-chart">
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={s.ogiTrend}>
                        <Line type="monotone" dataKey="OGI" stroke={getOGIColor(s.currentOGI)} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="monitoring-ogi-label">
                      OGI: <strong style={{ color: getOGIColor(s.currentOGI) }}>{s.currentOGI}</strong>
                    </p>
                  </div>

                  {/* Module Progress */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Module Progress</span>
                      <span>{s.moduleCompletionProgress.completed}/{s.moduleCompletionProgress.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(s.moduleCompletionProgress.completed / s.moduleCompletionProgress.total) * 100}%`,
                          background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="monitoring-stats">
                    <span><HiOutlineFire style={{ color: '#ef4444' }} /> {s.learningStreak} streaks</span>
                    <span><HiOutlineStar style={{ color: '#f59e0b' }} /> {s.skillAcquisitionCount} skills</span>
                  </div>

                  <button className="btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => downloadReport(s.studentId)}>
                    <HiOutlineDownload /> Download Report
                  </button>
                </div>
              ))}
            </div>
          )}
          {!loading && students.length === 0 && <p className="no-data">No students match the selected filters</p>}
        </div>
      )}

      {/* ═══════ TAB 3: WEEKLY SNAPSHOTS ═══════ */}
      {activeTab === 'snapshots' && (
        <div>
          <div className="search-bar-row">
            <select
              className="form-input"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ maxWidth: '350px' }}
            >
              <option value="">Select a student...</option>
              {allStudents.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.enrollmentId})</option>
              ))}
            </select>
            <button className="btn-primary" onClick={generateSnapshots} disabled={generating}>
              <HiOutlineRefresh /> {generating ? 'Generating...' : 'Generate Snapshots'}
            </button>
          </div>
          {genMessage && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', color: '#22c55e', fontSize: '0.875rem' }}>
              {genMessage}
            </div>
          )}

          {selectedStudentId && snapshots.length > 0 && (
            <>
              {/* OGI Trend Chart */}
              <div className="dash-card chart-card">
                <h3 className="dash-card-title"><HiOutlineTrendingUp /> OGI Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="weekNumber" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `W${v}`} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelFormatter={(v) => `Week ${v}`}
                    />
                    <Line type="monotone" dataKey="OGI" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Snapshot Table */}
              <div className="dash-card">
                <h3 className="dash-card-title"><HiOutlineCalendar /> Week-by-Week Comparison</h3>
                <div className="attendance-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Quiz Avg</th>
                        <th>Assignment Avg</th>
                        <th>Attendance</th>
                        <th>Completion</th>
                        <th>Consistency</th>
                        <th>OGI</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshots.map((s) => (
                        <tr key={s._id}>
                          <td>Week {s.weekNumber}</td>
                          <td>{s.quizAverage}%</td>
                          <td>{s.assignmentAverage}%</td>
                          <td>{s.attendancePercentage}%</td>
                          <td>{s.completionRate}%</td>
                          <td>{s.submissionConsistency}%</td>
                          <td style={{ fontWeight: 700, color: getOGIColor(s.OGI) }}>{s.OGI}</td>
                          <td>
                            {s.trend === 'improvement' && (
                              <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <HiOutlineTrendingUp /> +{s.ogiChange}
                              </span>
                            )}
                            {s.trend === 'declining' && (
                              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <HiOutlineTrendingDown /> {s.ogiChange}
                              </span>
                            )}
                            {s.trend === 'stagnation' && (
                              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <HiOutlineMinus /> {s.ogiChange}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedStudentId && snapshots.length === 0 && !loading && (
            <p className="no-data">No snapshots found for this student. Click Generate Snapshots to create data.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
