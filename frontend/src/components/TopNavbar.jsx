// ============================================
// Top Navbar Component
// Greeting, teacher info, and logout dropdown
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineChevronDown, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';

const TopNavbar = () => {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      {/* Greeting */}
      <div className="navbar-greeting">
        <h1 className="greeting-text">{getGreeting()},</h1>
        <span className="teacher-name">{teacher?.name || 'Teacher'}</span>
        {teacher?.designation && (
          <span className="teacher-designation">• {teacher.designation}</span>
        )}
      </div>

      {/* Profile Dropdown */}
      <div className="navbar-profile">
        <button
          className="profile-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="avatar">
            {teacher?.profileImage ? (
              <img src={teacher.profileImage} alt="Profile" />
            ) : (
              <span>{teacher?.name?.charAt(0) || 'T'}</span>
            )}
          </div>
          <HiOutlineChevronDown className="chevron-icon" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
              <HiOutlineUser /> Profile
            </button>
            <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
              <HiOutlineLogout /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
