// ============================================
// Login Page
// Email/password form with validation and API call
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineAcademicCap } from 'react-icons/hi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    
    
    e.preventDefault();
    setFormError('');

    // Validate empty fields
    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-decoration"></div>

      <div className="login-card">
        {/* Logo Section */}
        <div className="login-header">
          <div className="login-logo">
            <HiOutlineAcademicCap />
          </div>
          <h1 className="login-title">Academic Portal</h1>
          <p className="login-subtitle">Teacher Module — Sign In</p>
        </div>

        {/* Error Messages */}
        {(formError || error) && (
          <div className="login-error">
            {formError || error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <HiOutlineMail className="input-icon" />
              <input
                type="email"
                placeholder="teacher@portal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="login-demo">
          <p>Demo: <strong>teacher@portal.com</strong> / <strong>Teacher@123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
