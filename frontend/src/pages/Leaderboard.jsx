// ============================================
// Leaderboard Page
// Top 3 podium + full ranked table
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineStar, HiOutlineRefresh, HiOutlineTrendingUp,
  HiOutlineChartBar,
} from 'react-icons/hi';

const Leaderboard = () => {
  const { API_URL } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [sortBy, setSortBy] = useState('OGI');

  useEffect(() => {
    fetchLeaderboard();
  }, [courseFilter, sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (courseFilter) params.append('course', courseFilter);
      if (sortBy) params.append('sortBy', sortBy);
      const res = await axios.get(`${API_URL}/leaderboard?${params}`);
      setLeaderboard(res.data);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    try {
      setRefreshing(true);
      setSuccessMsg('');
      const res = await axios.post(`${API_URL}/leaderboard/update`);
      setSuccessMsg(res.data.message);
      fetchLeaderboard();
    } catch (err) {
      setError('Failed to refresh leaderboard');
    } finally {
      setRefreshing(false);
    }
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

  const getRowStyle = (rank) => {
    if (rank === 1) return { background: 'rgba(255, 215, 0, 0.06)', borderLeft: '3px solid #FFD700' };
    if (rank === 2) return { background: 'rgba(192, 192, 192, 0.06)', borderLeft: '3px solid #C0C0C0' };
    if (rank === 3) return { background: 'rgba(205, 127, 50, 0.06)', borderLeft: '3px solid #CD7F32' };
    return {};
  };

  const getTrophy = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  if (loading) {
    return <div className="page-loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h2 className="page-title"><HiOutlineStar /> Leaderboard</h2>
        <button className="btn-primary" onClick={refreshLeaderboard} disabled={refreshing}>
          <HiOutlineRefresh className={refreshing ? 'spin-icon' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Leaderboard'}
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}
      {successMsg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', color: '#22c55e', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="search-bar-row">
        <select className="form-input filter-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          <option value="Web Development">Web Development</option>
          <option value="DSA">DSA</option>
          <option value="Python">Python</option>
        </select>
        <select className="form-input filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="OGI">Sort by OGI</option>
          <option value="attendance">Sort by Attendance</option>
          <option value="assignmentScore">Sort by Assignment Score</option>
        </select>
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="podium-section">
          <div className="podium">
            {podiumOrder.map((student, idx) => {
              const isFirst = idx === 1;
              const rank = student.rank;
              const heights = [140, 180, 120];
              const trophyColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
              return (
                <div key={student.studentId} className="podium-item" style={{ height: `${heights[idx]}px` }}>
                  <div className="podium-avatar" style={{ borderColor: trophyColors[idx] }}>
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="podium-trophy">{getTrophy(rank)}</div>
                  <p className="podium-name">{student.name}</p>
                  <p className="podium-ogi">{student.OGI}</p>
                  <div className="podium-pedestal" style={{
                    height: `${isFirst ? 80 : idx === 0 ? 50 : 35}px`,
                    background: `linear-gradient(180deg, ${trophyColors[idx]}33 0%, ${trophyColors[idx]}11 100%)`,
                    borderTop: `2px solid ${trophyColors[idx]}`,
                  }}>
                    <span className="podium-rank">{rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="dash-card">
        <h3 className="dash-card-title"><HiOutlineChartBar /> Full Rankings</h3>
        <div className="attendance-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Enrollment</th>
                <th>Course</th>
                <th>OGI</th>
                <th>Attendance</th>
                <th>Assignment</th>
                <th>Quiz</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.studentId} style={getRowStyle(entry.rank)}>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: entry.rank <= 3 ? '1.25rem' : '0.875rem' }}>
                      {getTrophy(entry.rank)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div className="student-avatar">
                        {entry.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="student-name-cell">{entry.name}</span>
                    </div>
                  </td>
                  <td>{entry.enrollmentId}</td>
                  <td><span className="tag">{entry.course}</span></td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: entry.OGI >= 80 ? '#22c55e'
                        : entry.OGI >= 60 ? '#3b82f6'
                        : entry.OGI >= 40 ? '#f59e0b'
                        : '#ef4444'
                    }}>
                      {entry.OGI}
                    </span>
                  </td>
                  <td>
                    <span className="att-badge" style={{
                      color: entry.attendancePercentage >= 75 ? '#22c55e' : entry.attendancePercentage >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {entry.attendancePercentage}%
                    </span>
                  </td>
                  <td>{entry.assignmentScore}%</td>
                  <td>{entry.quizScore}%</td>
                  <td>{getGrowthBadge(entry.growthClassification)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && <p className="no-data">No students found. Run the seeder or generate snapshots first.</p>}
    </div>
  );
};

export default Leaderboard;
