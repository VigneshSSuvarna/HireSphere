import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';
import { BrandMark } from './components/BrandMark';
import { Button, Input } from './components/ui';
import { useToast } from './components/Toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { showToast } = useToast();

  useEffect(() => {
    logout();
  }, [logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post<{ message: string }>(
        '/api/auth/register',
        { email: email.trim(), password },
        { skipAuth: true }
      );

      logout();
      showToast('Student account created. Please sign in.', 'success');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
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
              Register as a student
            </h1>
            <p className="text-[14px] text-muted mt-1">
              Public registration creates a Student account. Coordinator and Admin roles are assigned by an administrator.
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
              label="College email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usn@college.edu"
              autoComplete="email"
              required
              disabled={isLoading}
            />

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-[13px] font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="h-9 w-full rounded-[6px] bg-surface border border-hairline pl-3 pr-10 text-[14px] text-ink placeholder:text-muted/70 focus:outline-none focus:border-accent disabled:opacity-50"
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

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating account...' : 'Create student account'}
            </Button>
          </form>

          <p className="text-[13px] text-muted">
            Already registered?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-[12px] text-muted">
          Complete your CGPA and department in Profile Settings after signing in.
        </p>
      </div>

      <div className="hidden lg:flex lg:col-span-5 bg-paper border-l border-hairline p-12 flex-col justify-between">
        <BrandMark subtitle="Campus Placement Office" />
        <p className="font-display text-[22px] leading-[1.35] text-ink max-w-sm">
          Keep your academic profile, resume checks, and drive applications organized through placement season.
        </p>
        <p className="font-mono text-[12px] text-muted">
          Batch 2026
        </p>
      </div>
    </div>
  );
}
