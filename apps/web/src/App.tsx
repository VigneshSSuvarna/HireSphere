import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ResumeScanner from './ResumeScanner';
import DeanDashboard from './DeanDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import StudentDatabase from './StudentDatabase';
import JobTracker from './JobTracker';
import MasterSchedule from './MasterSchedule';
import SystemLogs from './SystemLogs';
import Login from './Login';
import Signup from './Signup';
import DashboardLayout from './DashboardLayout';
import StudentDashboard from './StudentDashboard';
import Home from './Home';
import ProfileSettings from './ProfileSettings';
import PortalSelection from './PortalSelection';
import ProtectedRoute from './ProtectedRoute';
import { DsaTracker } from './DsaTracker';
import { ToastProvider } from './components/Toast';
import DevUiShowcase from './DevUiShowcase';

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('hiresphere_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    if (!saved) {
      localStorage.setItem('hiresphere_theme', theme);
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/portals" element={<PortalSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dev/ui" element={<DevUiShowcase />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route index element={<StudentDashboard />} />
                <Route path="tracker" element={<JobTracker />} />
                <Route path="dsa" element={<DsaTracker />} />
                <Route path="scanner" element={<ResumeScanner />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['COORDINATOR', 'ADMIN']} />}>
                <Route path="coordinator" element={<CoordinatorDashboard />} />
                <Route path="students" element={<StudentDatabase />} />
                <Route path="drives" element={<CoordinatorDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="admin" element={<DeanDashboard />} />
                <Route path="schedule" element={<MasterSchedule />} />
                <Route path="logs" element={<SystemLogs />} />
              </Route>

              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
