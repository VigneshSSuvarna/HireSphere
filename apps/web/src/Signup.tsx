import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout); // 1. Access logout store action

  // 2. Wipe active session on page mount
  useEffect(() => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setIsLoading(true);

    try {
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

      // Ensure logout state persists before redirect
      if (logout) logout();

      alert("Account created successfully! Please log in.");
      navigate("/login", { replace: true });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight mb-2">Join HireSphere</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="student@university.edu"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              id="showPassSignup" 
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)} 
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-600 cursor-pointer" 
              disabled={isLoading}
            />
            <label htmlFor="showPassSignup" className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Show Password</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              <option value="STUDENT">Student</option>
              <option value="COORDINATOR">Placement Coordinator</option>
              <option value="ADMIN">Administrator / Dean</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer" onClick={() => navigate("/login", { replace: true })}>Sign in here</span>
        </p>

      </div>
    </div>
  );
}