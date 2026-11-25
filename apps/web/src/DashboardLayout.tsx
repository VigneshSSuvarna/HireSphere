import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const activeUser = authUser;
  // 1. Ensure only signed-in accounts from the DB get access


  if (!activeUser) return null; 

  // 2. Map database roles (Uppercase) to navigation dictionary (Lowercase)
  const activeRole = activeUser.role.toLowerCase();

  // 3. Dynamic Overview Title based on URL
  const getPageTitle = () => {
    if (location.pathname.includes("coordinator")) return "Coordinator Overview";
    if (location.pathname.includes("dean")) return "Admin Overview";
    if (location.pathname.includes("scanner")) return "ATS Scanner Tools";
    if (location.pathname.includes("profile")) return "Profile Settings";
    return "Student Overview";
  };

  // Extract initials from the email prefix (e.g., rahul@... -> RA)
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // 4. Handle Logout (Moved to profile dropdown)
const logout = useAuthStore((state) => state.logout);

const handleLogout = () => {
  logout();
  navigate("/login");
};

  const navigation = {
    student: [
      { name: "My Workspace", path: "/dashboard", icon: "🎓" },
      { name: "Resume Scanner", path: "/dashboard/scanner", icon: "📄" }, 
      { name: "Job Tracker", path: "#", icon: "📊" },
    ],
    coordinator: [
      { name: "Coordinator Portal", path: "/dashboard/coordinator", icon: "👥" },
      { name: "Student Database", path: "#", icon: "🗂️" },
      { name: "Active Drives", path: "#", icon: "🏢" },
    ],
    dean: [
      { name: "Admin Dashboard", path: "/dashboard/dean", icon: "⚙️" },
      { name: "Master Schedule", path: "#", icon: "📅" },
      { name: "System Logs", path: "#", icon: "🖥️" },
    ]
  };

  const currentLinks = navigation[activeRole as keyof typeof navigation] || navigation.student;

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-extrabold text-purple-400 tracking-tight">HireSphere</h2>
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
                    ? "bg-purple-600/10 text-purple-400 font-medium border border-purple-500/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center px-8 justify-between relative z-10">
          
          <h1 className="text-lg font-semibold text-slate-200">{getPageTitle()}</h1>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-200">{activeUser.email.split('@')[0]}</p>
                <p className="text-xs text-slate-500 capitalize">{activeRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-slate-800">
                {getInitials(activeUser.email)}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs text-slate-400 truncate">{activeUser.email}</p>
                </div>
                
                {/* --- THIS IS THE UPDATED SECTION --- */}
                <Link 
                  to="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-purple-400 transition-colors"
                >
                  Profile Settings
                </Link>
                {/* ----------------------------------- */}

                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto bg-slate-950">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
}