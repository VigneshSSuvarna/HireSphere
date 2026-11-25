import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store authentication in Zustand.
      // Zustand persist() automatically keeps it across refreshes.
      setAuth(data.user, data.token);

      // Redirect based on the actual role from the database
      if (data.user.role === "COORDINATOR") {
        navigate("/dashboard/coordinator");
      } else if (data.user.role === "DEAN") {
        navigate("/dashboard/dean");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">

      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-400 tracking-tight mb-2">
            Welcome Back
          </h1>

          <p className="text-slate-400 text-sm">
            Sign in to your HireSphere account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="name@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>

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
              id="showPassLogin"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900 cursor-pointer"
            />

            <label
              htmlFor="showPassLogin"
              className="ml-2 text-sm text-slate-400 cursor-pointer"
            >
              Show Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-lg shadow-purple-500/20"
          >
            Sign In
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <span
            className="text-purple-400 hover:text-purple-300 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up here
          </span>
        </p>

      </div>
    </div>
  );
}