import { useEffect, useState } from "react";
import { API_URL } from "./config";

export default function Home() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setMessage(
          data.status === "ok"
            ? "✅ Connected to HireSphere Backend successfully!"
            : data.message || "Connected"
        );
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
        <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          {message}
        </p>
      </div>
    </div>
  );
}
