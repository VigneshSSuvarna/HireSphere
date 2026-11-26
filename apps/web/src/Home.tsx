import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { BrandMark } from './components/BrandMark';
import { Button, DataTable, Panel, StatusTag, type DataTableColumn } from './components/ui';

interface PreviewDrive {
  id: string;
  company: string;
  role: string;
  lpa: number;
  cutoff: number;
  deadline: string;
  status: string;
}

const SAMPLE_DRIVES: PreviewDrive[] = [
  { id: '1', company: 'Razorpay', role: 'SDE-1 (Payments)', lpa: 18.5, cutoff: 7.5, deadline: '14 Oct', status: 'OPEN' },
  { id: '2', company: 'Zoho', role: 'Member Technical Staff', lpa: 10.2, cutoff: 6.5, deadline: '18 Oct', status: 'SHORTLISTED' },
  { id: '3', company: 'Atlassian', role: 'Software Engineer', lpa: 24.0, cutoff: 8.0, deadline: '21 Oct', status: 'INTERVIEW' },
  { id: '4', company: 'BrowserStack', role: 'Frontend Engineer', lpa: 16.0, cutoff: 7.0, deadline: '25 Oct', status: 'OFFERED' },
];

const PREVIEW_COLUMNS: DataTableColumn<PreviewDrive>[] = [
  {
    key: 'company',
    header: 'Company & Role',
    render: (r) => (
      <div>
        <span className="font-medium text-ink">{r.company}</span>
        <span className="text-muted ml-2 text-[12px]">{r.role}</span>
      </div>
    ),
  },
  {
    key: 'lpa',
    header: 'CTC (LPA)',
    align: 'right',
    render: (r) => <span className="font-mono tabular-nums">{r.lpa.toFixed(1)}</span>,
  },
  {
    key: 'cutoff',
    header: 'Min CGPA',
    align: 'right',
    render: (r) => <span className="font-mono tabular-nums">{r.cutoff.toFixed(1)}</span>,
  },
  {
    key: 'deadline',
    header: 'Deadline',
    render: (r) => <span className="font-mono text-[12px] text-muted">{r.deadline}</span>,
  },
  {
    key: 'status',
    header: 'Stage',
    render: (r) => <StatusTag status={r.status} />,
  },
];

const LIFECYCLE_STEPS = [
  { step: '01', title: 'Drive published', detail: 'Coordinator sets CTC, CGPA cutoff, eligible branches, and deadline.' },
  { step: '02', title: 'Eligibility checked', detail: 'Students see only drives matching their profile CGPA and department.' },
  { step: '03', title: 'Shortlist & rounds', detail: 'Tests, PPTs, and interviews are scheduled and tracked per stage.' },
  { step: '04', title: 'Offer recorded', detail: 'Final offers update placement rates and write to the audit trail.' },
];

export default function Home() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* Quiet Top Bar */}
      <header className="h-14 border-b border-hairline bg-surface">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] font-medium text-muted hover:text-ink px-2.5 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link to="/portals">
              <Button size="sm">Open portal</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Asymmetric Left-Aligned Hero + Live Component Preview */}
        <section className="max-w-6xl mx-auto px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-[12px] font-mono text-muted">
              Training &amp; Placement Cell Ledger
            </p>
            <h1 className="font-display text-[36px] sm:text-[44px] leading-[1.1] font-medium tracking-[-0.02em] text-ink">
              Campus placements, tracked from shortlist to offer.
            </h1>
            <p className="text-[15px] text-muted leading-[1.6] max-w-md">
              A single ledger for engineering placement offices. Students check CGPA eligibility and
              scan resumes; coordinators run drives and export shortlists; deans track department
              outcomes.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/portals">
                <Button>
                  Select portal
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </Link>
              <Link
                to="/signup"
                className="text-[14px] font-medium text-accent hover:underline"
              >
                Register as student
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Panel padded={false} className="overflow-hidden">
              <div className="px-4 py-3 border-b border-hairline bg-subtle/60 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">
                  Active Campus Drives — 2026 Batch
                </span>
                <span className="text-[11px] font-mono text-muted">Sample preview</span>
              </div>
              <DataTable
                columns={PREVIEW_COLUMNS}
                rows={SAMPLE_DRIVES}
                rowKey={(r) => r.id}
              />
            </Panel>
          </div>
        </section>

        {/* Three-Column Role Breakdown */}
        <section className="border-t border-hairline bg-surface">
          <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                01 / Student
              </p>
              <h2 className="text-[16px] font-semibold text-ink">
                Eligibility &amp; application tracking
              </h2>
              <p className="text-[13px] text-muted leading-relaxed">
                View open drives filtered against your CGPA and branch, apply in one click,
                track round statuses, score PDF resumes, and log daily DSA practice.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                02 / Coordinator
              </p>
              <h2 className="text-[16px] font-semibold text-ink">
                Drives, shortlists &amp; student export
              </h2>
              <p className="text-[13px] text-muted leading-relaxed">
                Publish drives with package and cutoff rules, advance candidates from
                shortlisted to offered, filter the student registry, and export CSVs.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                03 / Dean &amp; Admin
              </p>
              <h2 className="text-[16px] font-semibold text-ink">
                Department metrics &amp; schedule
              </h2>
              <p className="text-[13px] text-muted leading-relaxed">
                Monitor placement rates across CSE, IT, ECE, and MECH, maintain the master
                assessment calendar, assign coordinator roles, and inspect audit logs.
              </p>
            </div>
          </div>
        </section>

        {/* Drive Lifecycle Strip */}
        <section className="border-t border-hairline bg-paper">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-[13px] font-semibold text-muted mb-6">
              How a drive moves through the system
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LIFECYCLE_STEPS.map((item) => (
                <Panel key={item.step} className="space-y-1.5">
                  <span className="font-mono text-[12px] text-accent font-medium">
                    {item.step}
                  </span>
                  <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
                  <p className="text-[13px] text-muted leading-relaxed">{item.detail}</p>
                </Panel>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-muted">
          <span>HireSphere — Campus Training &amp; Placement System</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-ink transition-colors">
              Student registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
