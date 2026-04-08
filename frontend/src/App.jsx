// ============================================
// App Component
// Protected routes with sidebar/navbar layout
// ============================================

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BatchManagement from './pages/BatchManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import AssessmentManagement from './pages/AssessmentManagement';
import StudentManagement from './pages/StudentManagement';
import SupportRequests from './pages/SupportRequests';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import './index.css';

// Protected route wrapper — redirects to login if no token
const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <TopNavbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Public route — redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batches" element={<BatchManagement />} />
          <Route path="/attendance/:batchId" element={<AttendanceManagement />} />
          <Route path="/assessment" element={<AssessmentManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/support" element={<SupportRequests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
