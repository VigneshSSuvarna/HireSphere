import { useState, useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import DsaTracker from "./DsaTracker";

export default function StudentDashboard() {
  const token = useAuthStore((state: any) => state.token);
  const [activeDrives, setActiveDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch live data from the backend using the secure token
    fetch("http://localhost:5000/api/drives", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Endpoint not ready");
      return res.json();
    })
    .then(data => {
      setActiveDrives(data);
      setIsLoading(false);
    })
    .catch(() => {
      console.warn("⚠️ Backend /api/drives not built yet. Loading mock data fallback.");
      // Fallback so the UI doesn't crash while waiting for the backend team
      setActiveDrives([
        { id: 1, company: "TechNova Solutions", role: "Frontend Developer", package: "12 LPA", deadline: "Oct 15", status: "Open" },
        { id: 2, company: "DataSphere", role: "Data Analyst", package: "9 LPA", deadline: "Oct 18", status: "Applied" },
        { id: 3, company: "CyberShield Inc.", role: "Security Associate", package: "15 LPA", deadline: "Oct 20", status: "Open" },
      ]);
      setIsLoading(false);
    });
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900/50 to-slate-900 p-8 rounded-2xl border border-purple-500/20 shadow-xl">
        <h2 className="text-3xl font-extrabold text-white mb-2">Welcome to your Workspace</h2>
        <p className="text-slate-300">Track your applications, discover new drives, and prepare for placements.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Active Applications</p>
          <p className="text-3xl font-bold text-white">1</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Upcoming Interviews</p>
          <p className="text-3xl font-bold text-purple-400">0</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">ATS Average Score</p>
          <p className="text-3xl font-bold text-green-400">82%</p>
        </div>
      </div>

      {/* Job Tracker Board */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-200">Campus Drives Board</h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading live placement drives...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company & Role</th>
                  <th className="px-6 py-4 font-semibold">Package</th>
                  <th className="px-6 py-4 font-semibold">Deadline</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeDrives.map((drive) => (
                  <tr key={drive.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200">{drive.company}</p>
                      <p className="text-xs text-slate-500">{drive.role}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{drive.package}</td>
                    <td className="px-6 py-4 text-slate-400">{drive.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        drive.status === 'Applied' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {drive.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                          drive.status === 'Applied'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white'
                        }`}
                        disabled={drive.status === 'Applied'}
                      >
                        {drive.status === 'Applied' ? 'Reviewed' : 'Apply Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DSA Tracker Section */}
      <DsaTracker />

    </div>
  );
}