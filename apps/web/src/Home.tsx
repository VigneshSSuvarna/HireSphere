import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Connecting to backend...");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setUsers(data.users || []);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setMessage("❌ Error connecting to backend server.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-purple-400 tracking-tight">HireSphere</h1>
        <p className="text-slate-300 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          {message}
        </p>
        
        <div className="mt-6 text-left bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-3 text-purple-300">Database Users:</h2>
          {users.length === 0 ? (
            <p className="text-slate-500 italic text-sm">No users registered in Neon PostgreSQL yet.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="text-slate-300 text-sm bg-slate-900 p-3 rounded border border-slate-800">
                  <span className="font-medium text-white">{user.fullName}</span> — <span className="text-slate-400">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}