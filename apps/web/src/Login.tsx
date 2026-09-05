import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuthStore } from "./store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // Read user from Zustand

  // Helper function for role-based redirects
  const redirectByRole = (userRole?: string) => {
    if (userRole === "COORDINATOR") {
      navigate("/dashboard/coordinator", { replace: true });
    } else if (userRole === "ADMIN" || userRole === "DEAN") {
      navigate("/dashboard/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Redirect if already authenticated (e.g. on page load)
  useEffect(() => {
    if (token && user) {
      redirectByRole(user.role);
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save into Zustand
      setAuth(
        { id: data.user.id, email: data.user.email, role: data.user.role }, 
        data.token
      );

      // Role-based routing
      redirectByRole(data.user.role);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your HireSphere account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="name@university.edu" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="••••••••" required />
          </div>

          <div className="flex items-center mt-2">
            <input type="checkbox" id="showPassLogin" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-600 cursor-pointer" />
            <label htmlFor="showPassLogin" className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Show Password</label>
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-lg shadow-purple-500/20">
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account? <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer" onClick={() => navigate("/signup", { replace: true })}>Sign up here</span>
        </p>
      </div>
    </div>
  );
}