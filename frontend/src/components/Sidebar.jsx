// ============================================
// Sidebar Component
// Persistent left navigation with NavLink highlighting
// ============================================

import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineSupport,
  HiOutlineChartBar,
  HiOutlineStar,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/batches', icon: HiOutlineCollection, label: 'Batch Management' },
  { to: '/assessment', icon: HiOutlineClipboardList, label: 'Assessment Management' },
  { to: '/students', icon: HiOutlineUsers, label: 'Student Management' },
  { to: '/support', icon: HiOutlineSupport, label: 'Support Requests' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/leaderboard', icon: HiOutlineStar, label: 'Leaderboard' },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Portal Logo / Name */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🎓</div>
        <div>
          <h2 className="sidebar-title">Academic Portal</h2>
          <p className="sidebar-subtitle">Teacher Module</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <item.icon className="sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>© 2026 NavKalpana</p>
      </div>
    </aside>
  );
};

export default Sidebar;
