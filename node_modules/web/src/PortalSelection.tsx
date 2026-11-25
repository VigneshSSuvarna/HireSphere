import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function PortalSelection() {
  
  // STRICT SECURITY: Destroy login session if they return to the Portals page
  useEffect(() => {
    localStorage.removeItem("hiresphere_active_user");
    localStorage.removeItem("hiresphere_token");
  }, []);

  const portals = [
    {
      title: "Student Workspace",
      role: "STUDENT",
      icon: "🎓",
      description:
        "Access active campus drives, run ATS resume scans, track applications, and manage your placement portfolio.",
      actionText: "ENTER WORKSPACE →",
      path: "/login",
    },
    {
      title: "Placement Coordinator",
      role: "COORDINATOR",
      icon: "🏢",
      description:
        "Manage campus placement drives, review registered students, coordinate schedules, and export placement reports.",
      actionText: "ENTER PORTAL →",
      path: "/login",
    },
    {
      title: "Admin Dashboard",
      role: "ADMIN",
      icon: "⚙️",
      description:
        "Oversee universal placement analytics, manage master schedules, monitor system logs, and control access.",
      actionText: "ENTER COMMAND CENTER →",
      path: "/login",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200/20 dark:border-slate-800 text-center transition-colors duration-300">
        
        <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-500/30 mx-auto mb-6">
          HS
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to HireSphere
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-2 mb-10">
          Please select your profile to enter your customized portal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {portals.map((portal) => (
            <div
              key={portal.title}
              className="bg-slate-50 dark:bg-slate-950/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="text-2xl mb-4 bg-white dark:bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform">
                  {portal.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                  {portal.description}
                </p>
              </div>
              <Link
                to={portal.path}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 tracking-wider flex items-center gap-1 uppercase transition-colors pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
              >
                {portal.actionText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <Link
            to="/"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <p>HireSphere Campus Portal</p>
        </div>

      </div>
    </div>
  );
}