import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Regex feature for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    setError(""); 

    try {
      // 2. Original Database Connection (Untouched)
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password, 
          role 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      alert("Account created successfully!");
      navigate("/login");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-400 tracking-tight mb-2">Join HireSphere</h1>
          <p className="text-slate-400 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="student@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              id="showPassSignup" 
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)} 
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900 cursor-pointer" 
            />
            <label htmlFor="showPassSignup" className="ml-2 text-sm text-slate-400 cursor-pointer">Show Password</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            >
              <option value="STUDENT">Student</option>
              <option value="COORDINATOR">Placement Coordinator</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-lg shadow-purple-500/20">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <span className="text-purple-400 hover:text-purple-300 cursor-pointer hover:underline" onClick={() => navigate("/login")}>Sign in here</span>
        </p>

      </div>
    </div>
  );
}