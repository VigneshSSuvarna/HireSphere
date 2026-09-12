import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Zustand State Management
  const authUser = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<{email: string, role: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("hiresphere_active_user");
    
    if (!storedUser && !authUser) {
      navigate("/login", { replace: true }); 
    } else {
      setActiveUser(storedUser ? JSON.parse(storedUser) : authUser);
    }
  }, [navigate, location.pathname, authUser]); 

  if (!activeUser) return null; 

  const activeRole = activeUser.role.toLowerCase();

  const getPageTitle = () => {
    if (location.pathname.includes("coordinator")) return "Coordinator Overview";
    if (location.pathname.includes("admin")) return "Admin Overview";
    if (location.pathname.includes("scanner")) return "ATS Scanner Tools";
    if (location.pathname.includes("profile")) return "Profile Settings";
    if (location.pathname.includes("dsa")) return "DSA Practice Tracker";
    return "Student Overview";
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    if (logout) logout();
    localStorage.removeItem("hiresphere_active_user");
    localStorage.removeItem("hiresphere_token");
    navigate("/login", { replace: true });
  };

  const navigation = {
    student: [
      { name: "My Workspace", path: "/dashboard", icon: "🎓" },
      { name: "Resume Scanner", path: "/dashboard/scanner", icon: "📄" }, 
      { name: "Job Tracker", path: "#", icon: "📊" },
      { name: "DSA Tracker", path: "/dashboard/dsa", icon: "🧩" },
    ],
    coordinator: [
      { name: "Coordinator Portal", path: "/dashboard/coordinator", icon: "👥" },
      { name: "Student Database", path: "#", icon: "🗂️" },
      { name: "Active Drives", path: "#", icon: "🏢" },
    ],
    admin: [ 
      { name: "Admin Dashboard", path: "/dashboard/admin", icon: "⚙️" },
      { name: "Master Schedule", path: "#", icon: "📅" },
      { name: "System Logs", path: "#", icon: "🖥️" },
    ]
  };

  const currentLinks = navigation[activeRole as keyof typeof navigation] || navigation.student;

  return (
    <div className="min-h-screen flex transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <h2 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">HireSphere</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Campus Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {currentLinks.map((link) => {
            const isActive = location.pathname === link.path;
            
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-purple-100 dark:bg-purple-600/10 text-purple-700 dark:text-purple-400 font-medium border border-purple-200 dark:border-purple-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-8 justify-between relative z-10 transition-colors duration-300">
          
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-6">
            
            {/* Profile Dropdown Logic */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activeUser.email.split('@')[0]}</p>
                  <p className="text-xs text-slate-500 capitalize">{activeRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white dark:border-slate-800">
                  {getInitials(activeUser.email)}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activeUser.email}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Profile Settings
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
}