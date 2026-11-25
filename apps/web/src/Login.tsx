import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore, type User } from './store/authStore';
import { api, getDashboardPathForRole } from './lib/api';
import { BrandMark } from './components/BrandMark';
import { Button, Input } from './components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Enter a valid institutional or personal email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.post<{ token: string; user: User }>(
        '/api/auth/login',
        { email: email.trim(), password },
        { skipAuth: true }
      );

      setAuth(data.user, data.token);
      navigate(getDashboardPathForRole(data.user.role), { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 bg-surface">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Back to overview
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto py-10 space-y-6">
          <div>
            <h1 className="font-display text-[28px] font-medium text-ink tracking-[-0.015em]">
              Sign in
            </h1>
            <p className="text-[14px] text-muted mt-1">
              Enter your HireSphere credentials to open your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="p-3 rounded-[6px] bg-status-rejected-bg border border-status-rejected/25 text-[13px] text-status-rejected"
              >
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              autoComplete="email"
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-[13px] font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-9 w-full rounded-[6px] bg-surface border border-hairline pl-3 pr-10 text-[14px] text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-[13px] text-muted">
            New student?{' '}
            <Link to="/signup" className="text-accent font-medium hover:underline">
              Create a student account
            </Link>
          </p>
        </div>

        <p className="text-[12px] text-muted">
          HireSphere Training &amp; Placement Cell
        </p>
      </div>

      <div className="hidden lg:flex lg:col-span-5 bg-paper border-l border-hairline p-12 flex-col justify-between">
        <BrandMark subtitle="Campus Placement Office" />
        <p className="font-display text-[22px] leading-[1.35] text-ink max-w-sm">
          Track active drives, CGPA eligibility, interview rounds, and placement outcomes in one place.
        </p>
        <p className="font-mono text-[12px] text-muted">
          Role-scoped access
        </p>
      </div>
    </div>
  );
}
