import { useState } from "react";

export default function CoordinatorDashboard() {
  // Safe mock data - will not break the backend!
  const [drives] = useState([
    { id: 1, company: "TechNova Solutions", role: "Frontend Developer", applicants: 142, status: "Active" },
    { id: 2, company: "DataSphere", role: "Data Analyst", applicants: 89, status: "Active" },
    { id: 3, company: "Global Finance", role: "Investment Banker", applicants: 210, status: "Closed" },
  ]);

  const [students] = useState([
    { id: "STU-001", name: "Rahul Sharma", department: "Computer Science", cgpa: "8.9", status: "Unplaced" },
    { id: "STU-002", name: "Priya Patel", department: "Information Tech", cgpa: "9.2", status: "Placed" },
    { id: "STU-003", name: "Amit Kumar", department: "Electronics", cgpa: "7.8", status: "Unplaced" },
  ]);

  // Mock function for future database connection
  const handleCreateDrive = () => {
    alert("This will open a modal to POST a new drive to your real database!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Coordinator Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 p-8 rounded-2xl border border-blue-500/20 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Coordinator Control Center</h2>
          <p className="text-slate-300">Manage placement drives, monitor student progress, and export reports.</p>
        </div>
        <button 
          onClick={handleCreateDrive}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Drive
        </button>
      </div>

      {/* Admin Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Registered</p>
          <p className="text-3xl font-bold text-white">842</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Students Placed</p>
          <p className="text-3xl font-bold text-green-400">315</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Active Drives</p>
          <p className="text-3xl font-bold text-blue-400">12</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Upcoming Interviews</p>
          <p className="text-3xl font-bold text-purple-400">4</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Drives Manager */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-lg font-bold text-slate-200">Drive Management</h3>
            <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Live</span>
          </div>
          <div className="p-6 flex-1 overflow-auto">
            <div className="space-y-4">
              {drives.map((drive) => (
                <div key={drive.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-200">{drive.company}</h4>
                    <p className="text-xs text-slate-500">{drive.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">{drive.applicants} Applicants</p>
                    <p className={`text-xs font-bold mt-1 ${drive.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                      {drive.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Database Preview */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-lg font-bold text-slate-200">Student Database Overview</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Dept & CGPA</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-300">{student.department}</p>
                      <p className="text-xs text-slate-500">CGPA: {student.cgpa}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Placed' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}