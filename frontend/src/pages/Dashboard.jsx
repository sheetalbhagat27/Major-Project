// ============================================
// Dashboard Page
// KPI cards, upcoming deadlines, performance, quick nav
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineUsers, HiOutlineBookOpen, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineChartBar, HiOutlineArrowRight,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard`);
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dummy weekly activity data for the chart
  const weeklyData = [
    { day: 'Mon', classes: 4, assignments: 2 },
    { day: 'Tue', classes: 3, assignments: 1 },
    { day: 'Wed', classes: 5, assignments: 3 },
    { day: 'Thu', classes: 4, assignments: 2 },
    { day: 'Fri', classes: 3, assignments: 4 },
    { day: 'Sat', classes: 1, assignments: 1 },
    { day: 'Sun', classes: 0, assignments: 0 },
  ];

  // Quick navigation items
  const quickNav = [
    { label: 'Batch Management', path: '/batches', icon: HiOutlineBookOpen, color: '#6366f1' },
    { label: 'Assessment', path: '/assessment', icon: HiOutlineClipboardList, color: '#f59e0b' },
    { label: 'Students', path: '/students', icon: HiOutlineUsers, color: '#10b981' },
    { label: 'Support', path: '/support', icon: HiOutlineClock, color: '#ef4444' },
  ];

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <h2 className="page-title">Dashboard Overview</h2>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-wrap">
            <HiOutlineUsers />
          </div>
          <div className="kpi-content">
            <p className="kpi-value">{stats?.totalStudents || 0}</p>
            <p className="kpi-label">Total Students</p>
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon-wrap">
            <HiOutlineBookOpen />
          </div>
          <div className="kpi-content">
            <p className="kpi-value">{stats?.activeCourses || 0}</p>
            <p className="kpi-label">Active Courses</p>
          </div>
        </div>

        <div className="kpi-card kpi-orange">
          <div className="kpi-icon-wrap">
            <HiOutlineClipboardList />
          </div>
          <div className="kpi-content">
            <p className="kpi-value">{stats?.pendingAssignments || 0}</p>
            <p className="kpi-label">Pending Assignments</p>
          </div>
        </div>
      </div>

      {/* Performance + Deadlines Row */}
      <div className="dashboard-row">
        {/* Average Performance */}
        <div className="dash-card">
          <h3 className="dash-card-title">
            <HiOutlineChartBar /> Average Class Performance
          </h3>
          <div className="performance-circle">
            <div className="perf-value">{stats?.averageClassPerformance || 0}%</div>
            <div className="perf-bar">
              <div
                className="perf-fill"
                style={{ width: `${stats?.averageClassPerformance || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="dash-card">
          <h3 className="dash-card-title">
            <HiOutlineClock /> Upcoming Deadlines
          </h3>
          <div className="deadline-list">
            {stats?.upcomingDeadlines?.length > 0 ? (
              stats.upcomingDeadlines.map((d, i) => (
                <div key={i} className="deadline-item">
                  <span className="deadline-title">{d.title}</span>
                  <span className="deadline-date">
                    {new Date(d.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="dash-card chart-card">
        <h3 className="dash-card-title">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="classes" fill="#6366f1" radius={[4, 4, 0, 0]} name="Classes" />
            <Bar dataKey="assignments" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Assignments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Navigation */}
      <div className="quick-nav-section">
        <h3 className="dash-card-title">Quick Navigation</h3>
        <div className="quick-nav-grid">
          {quickNav.map((item, i) => (
            <button
              key={i}
              className="quick-nav-btn"
              style={{ borderColor: item.color }}
              onClick={() => navigate(item.path)}
            >
              <item.icon style={{ color: item.color }} />
              <span>{item.label}</span>
              <HiOutlineArrowRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
