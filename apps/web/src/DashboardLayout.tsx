import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronUp,
  Code2,
  FileSearch,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ScrollText,
  Settings,
  Sun,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { BrandMark } from './components/BrandMark';
import { Avatar, DropdownMenu } from './components/ui';

interface NavLinkItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavLinkItem[];
}

const NAV_GROUPS: Record<'student' | 'coordinator' | 'admin', NavGroup[]> = {
  student: [
    {
      label: 'Placement',
      items: [
        { name: 'Workspace', path: '/dashboard', icon: Briefcase },
        { name: 'Job Tracker', path: '/dashboard/tracker', icon: Kanban },
      ],
    },
    {
      label: 'Preparation',
      items: [
        { name: 'Resume Scanner', path: '/dashboard/scanner', icon: FileSearch },
        { name: 'DSA Tracker', path: '/dashboard/dsa', icon: Code2 },
      ],
    },
  ],
  coordinator: [
    {
      label: 'Operations',
      items: [
        { name: 'Coordinator Portal', path: '/dashboard/coordinator', icon: LayoutDashboard },
        { name: 'Active Drives', path: '/dashboard/drives', icon: Building2 },
        { name: 'Student Database', path: '/dashboard/students', icon: Users },
      ],
    },
  ],
  admin: [
    {
      label: 'Governance',
      items: [
        { name: 'Admin Overview', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Master Schedule', path: '/dashboard/schedule', icon: Calendar },
        { name: 'System Logs', path: '/dashboard/logs', icon: ScrollText },
      ],
    },
    {
      label: 'Placement Cell',
      items: [
        { name: 'Active Drives', path: '/dashboard/drives', icon: Building2 },
        { name: 'Student Database', path: '/dashboard/students', icon: Users },
      ],
    },
  ],
};

function getPageTitle(pathname: string): string {
  if (pathname.includes('coordinator')) return 'Coordinator Portal';
  if (pathname.includes('students')) return 'Student Database';
  if (pathname.includes('drives')) return 'Active Drives';
  if (pathname.includes('admin')) return 'Dean & Admin Overview';
  if (pathname.includes('schedule')) return 'Master Schedule';
  if (pathname.includes('logs')) return 'System Logs';
  if (pathname.includes('tracker')) return 'Job Tracker';
  if (pathname.includes('scanner')) return 'ATS Resume Scanner';
  if (pathname.includes('profile')) return 'Profile Settings';
  if (pathname.includes('dsa')) return 'DSA Practice Tracker';
  return 'Student Workspace';
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  if (!activeUser) return null;

  const activeRole = activeUser.role.toLowerCase() as 'student' | 'coordinator' | 'admin';
  const groups = NAV_GROUPS[activeRole] || NAV_GROUPS.student;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('hiresphere_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 232px Quiet Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-[232px] shrink-0 bg-surface border-r border-hairline flex flex-col z-40 transition-transform duration-150 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-14 px-4 border-b border-hairline flex items-center justify-between">
          <Link to="/" className="focus-visible:outline-none">
            <BrandMark subtitle="Training & Placement" />
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-ink hover:bg-subtle cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Primary">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`relative flex items-center gap-2.5 h-9 px-2.5 rounded-[6px] text-[13px] transition-colors duration-150 ${
                        isActive
                          ? 'bg-subtle text-ink font-medium'
                          : 'text-muted hover:text-ink hover:bg-subtle/60'
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r bg-accent"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-accent' : 'text-muted'
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned Bottom User Menu */}
        <div className="p-3 border-t border-hairline">
          <DropdownMenu
            align="left"
            trigger={
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 p-2 rounded-[6px] hover:bg-subtle transition-colors duration-150 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={activeUser.email} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {activeUser.email.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-muted capitalize">{activeRole}</p>
                  </div>
                </div>
                <ChevronUp className="h-3.5 w-3.5 text-muted shrink-0" strokeWidth={1.75} />
              </button>
            }
            header={
              <p className="text-[12px] text-muted truncate">{activeUser.email}</p>
            }
            items={[
              {
                label: 'Profile settings',
                icon: <Settings className="h-3.5 w-3.5" strokeWidth={1.75} />,
                onClick: () => navigate('/dashboard/profile'),
              },
              {
                label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
                icon: isDark ? (
                  <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
                ) : (
                  <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
                ),
                onClick: toggleTheme,
              },
              {
                label: 'Sign out',
                danger: true,
                icon: <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />,
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 shrink-0 bg-surface border-b border-hairline flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-ink hover:bg-subtle cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2 text-[13px] min-w-0">
              <span className="text-muted hidden sm:inline">HireSphere</span>
              <span className="text-muted hidden sm:inline">/</span>
              <h1 className="font-medium text-ink truncate">{pageTitle}</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="h-8 w-8 inline-flex items-center justify-center rounded-[6px] border border-hairline bg-surface text-muted hover:text-ink hover:bg-subtle transition-colors duration-150 cursor-pointer"
          >
            {isDark ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </header>

        <div className="flex-1 p-6 sm:p-8 overflow-auto bg-paper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
