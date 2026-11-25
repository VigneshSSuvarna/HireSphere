import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

interface NavLinkItem {
  name: string;
  path: string;
  icon: string;
}

const NAVIGATION: Record<'student' | 'coordinator' | 'admin', NavLinkItem[]> = {
  student: [
    { name: 'My Workspace', path: '/dashboard', icon: '🎓' },
    { name: 'Job Tracker', path: '/dashboard/tracker', icon: '📊' },
    { name: 'Resume Scanner', path: '/dashboard/scanner', icon: '📄' },
    { name: 'DSA Tracker', path: '/dashboard/dsa', icon: '🧩' },
  ],
  coordinator: [
    { name: 'Coordinator Portal', path: '/dashboard/coordinator', icon: '👥' },
    { name: 'Student Database', path: '/dashboard/students', icon: '🗂️' },
    { name: 'Active Drives', path: '/dashboard/drives', icon: '🏢' },
  ],
  admin: [
    { name: 'Admin Dashboard', path: '/dashboard/admin', icon: '⚙️' },
    { name: 'Master Schedule', path: '/dashboard/schedule', icon: '📅' },
    { name: 'System Logs', path: '/dashboard/logs', icon: '🖥️' },
    { name: 'Student Database', path: '/dashboard/students', icon: '🗂️' },
    { name: 'Active Drives', path: '/dashboard/drives', icon: '🏢' },
  ],
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!activeUser) return null;

  const activeRole = activeUser.role.toLowerCase() as 'student' | 'coordinator' | 'admin';
  const currentLinks = NAVIGATION[activeRole] || NAVIGATION.student;

  const getPageTitle = () => {
    if (location.pathname.includes('coordinator')) return 'Coordinator Portal';
    if (location.pathname.includes('students')) return 'Student Database';
    if (location.pathname.includes('drives')) return 'Active Drives';
    if (location.pathname.includes('admin')) return 'Dean & Admin Portal';
    if (location.pathname.includes('schedule')) return 'Master Schedule';
    if (location.pathname.includes('logs')) return 'System Audit Logs';
    if (location.pathname.includes('tracker')) return 'Job Application Tracker';
    if (location.pathname.includes('scanner')) return 'ATS Resume Scanner';
    if (location.pathname.includes('profile')) return 'Profile Settings';
    if (location.pathname.includes('dsa')) return 'DSA Practice Tracker';
    return 'Student Overview';
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-40 transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              HireSphere
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Campus Portal
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xl"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {currentLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-600/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-8 justify-between relative z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {activeUser.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500 capitalize">{activeRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white dark:border-slate-800">
                {activeUser.email.substring(0, 2).toUpperCase()}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeUser.email}
                  </p>
                </div>

                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Profile Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
