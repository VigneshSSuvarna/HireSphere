import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

const ROUTE_TITLES: Array<[string, string]> = [
  ['/dashboard/coordinator', 'Coordinator Portal — HireSphere'],
  ['/dashboard/students', 'Student Database — HireSphere'],
  ['/dashboard/drives', 'Active Drives — HireSphere'],
  ['/dashboard/admin', 'Dean & Admin Overview — HireSphere'],
  ['/dashboard/schedule', 'Master Schedule — HireSphere'],
  ['/dashboard/logs', 'System Logs — HireSphere'],
  ['/dashboard/tracker', 'Job Tracker — HireSphere'],
  ['/dashboard/scanner', 'ATS Resume Scanner — HireSphere'],
  ['/dashboard/dsa', 'DSA Practice Tracker — HireSphere'],
  ['/dashboard/profile', 'Profile Settings — HireSphere'],
  ['/dashboard', 'Student Workspace — HireSphere'],
  ['/portals', 'Select Portal — HireSphere'],
  ['/login', 'Sign In — HireSphere'],
  ['/signup', 'Student Registration — HireSphere'],
  ['/dev/ui', 'UI Registry — HireSphere'],
  ['/', 'HireSphere — Campus Placement Portal'],
];

function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = ROUTE_TITLES.find(([prefix]) =>
      prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    );
    document.title = match ? match[1] : 'HireSphere — Campus Placement Portal';
  }, [pathname]);
  return null;
}

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
        <RouteTitle />
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
