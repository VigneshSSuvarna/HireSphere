import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

export default function Home() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Public Header */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">HireSphere</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/portals" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Log in
          </Link>
          <Link to="/portals" className="text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-500/20">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
          The Modern Campus Placement Portal
        </div>
        
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-slate-900 dark:text-white">
          Manage university placements with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">absolute clarity.</span>
        </h2>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
          A unified workspace for students to track applications, coordinators to manage campus drives, and admins to oversee universal platform analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/portals" className="w-full sm:w-auto text-center font-bold bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl transition-all shadow-xl shadow-purple-500/20 text-lg">
            Create your account
          </Link>
          <Link to="/portals" className="w-full sm:w-auto text-center font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl transition-all text-lg shadow-sm">
            Sign In to Dashboard
          </Link>
        </div>
      </main>

    </div>
  );
}