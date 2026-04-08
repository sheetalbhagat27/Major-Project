// ============================================
// Auth Context
// Manages JWT token, login/logout, and auth state
// ============================================

import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Base URL for API calls
const API_URL = 'http://localhost:5000/api';

// Set axios header immediately on load if token exists in localStorage
const savedToken = localStorage.getItem('token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(savedToken);
  const [teacher, setTeacher] = useState(
    JSON.parse(localStorage.getItem('teacher') || 'null')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: jwt, teacher: teacherData } = res.data;

      // Save to localStorage and set axios header immediately
      localStorage.setItem('token', jwt);
      localStorage.setItem('teacher', JSON.stringify(teacherData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setToken(jwt);
      setTeacher(teacherData);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacher');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ token, teacher, loading, error, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
