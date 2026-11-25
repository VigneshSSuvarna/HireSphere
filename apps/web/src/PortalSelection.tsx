import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { BrandMark } from './components/BrandMark';
import { Button } from './components/ui';

type PortalRole = 'STUDENT' | 'COORDINATOR' | 'ADMIN';

const PORTALS: Array<{
  role: PortalRole;
  title: string;
  summary: string;
  canSignup: boolean;
}> = [
  {
    role: 'STUDENT',
    title: 'Student Workspace',
    summary: 'Browse eligible campus drives, track applications, scan PDF resumes, and log DSA practice.',
    canSignup: true,
  },
  {
    role: 'COORDINATOR',
    title: 'Placement Coordinator',
    summary: 'Create drives, update applicant round statuses, filter the student database, and export CSVs.',
    canSignup: false,
  },
  {
    role: 'ADMIN',
    title: 'Dean & Admin',
    summary: 'Review department placement rates, manage user roles, maintain the master schedule, and view audit logs.',
    canSignup: false,
  },
];

export default function PortalSelection() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PortalRole>('STUDENT');

  useEffect(() => {
    logout();
  }, [logout]);

  const activePortal = PORTALS.find((p) => p.role === selected) || PORTALS[0];

  return (
    <div className="min-h-screen bg-paper text-ink grid grid-cols-1 lg:grid-cols-12">
      {/* Left: Role Radio List */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 bg-surface">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Back to overview
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-10 space-y-6">
          <div>
            <h1 className="font-display text-[28px] font-medium text-ink tracking-[-0.015em]">
              Select your portal
            </h1>
            <p className="text-[14px] text-muted mt-1">
              Choose the workspace that matches your Training &amp; Placement role.
            </p>
          </div>

          <div role="radiogroup" aria-label="Portal role" className="space-y-2.5">
            {PORTALS.map((portal) => {
              const isSelected = selected === portal.role;
              return (
                <button
                  key={portal.role}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(portal.role)}
                  className={`w-full text-left p-4 rounded-[8px] border transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-accent bg-accent-soft'
                      : 'border-hairline bg-surface hover:bg-subtle/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-ink">{portal.title}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-accent' : 'border-hairline'
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted mt-1 leading-relaxed">{portal.summary}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => navigate('/login')} className="flex-1">
              Continue to sign in
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
            {activePortal.canSignup && (
              <Link to="/signup">
                <Button variant="secondary">Register</Button>
              </Link>
            )}
          </div>
        </div>

        <p className="text-[12px] text-muted">
          Coordinator and Admin accounts are provisioned by an administrator.
        </p>
      </div>

      {/* Right: Calm Paper Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-paper border-l border-hairline p-12 flex-col justify-between">
        <BrandMark subtitle="Campus Placement Office" />
        <p className="font-display text-[22px] leading-[1.35] text-ink max-w-sm">
          One record for every drive, shortlist, and offer letter across the graduating batch.
        </p>
        <p className="font-mono text-[12px] text-muted">
          Academic Year 2025–26
        </p>
      </div>
    </div>
  );
}
