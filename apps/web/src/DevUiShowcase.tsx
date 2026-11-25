import { useState } from 'react';
import { Sun, Moon, Plus, MoreHorizontal, LogOut, Settings } from 'lucide-react';
import {
  Avatar,
  Button,
  Checkbox,
  DataTable,
  DropdownMenu,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Panel,
  Select,
  StatBlock,
  StatusTag,
  Tabs,
  Textarea,
  Tooltip,
  type DataTableColumn,
} from './components/ui';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';
import { useToast } from './components/Toast';

interface SampleRow {
  id: string;
  company: string;
  role: string;
  lpa: number;
  cutoff: number;
  status: string;
}

const SAMPLE_ROWS: SampleRow[] = [
  { id: '1', company: 'Razorpay', role: 'SDE-1 (Backend)', lpa: 18.5, cutoff: 7.5, status: 'OPEN' },
  { id: '2', company: 'Atlassian', role: 'Software Engineer', lpa: 24.0, cutoff: 8.0, status: 'INTERVIEW' },
  { id: '3', company: 'Zoho', role: 'Member Technical Staff', lpa: 10.2, cutoff: 6.5, status: 'SHORTLISTED' },
  { id: '4', company: 'CRED', role: 'Frontend Engineer', lpa: 21.0, cutoff: 7.5, status: 'OFFERED' },
];

export default function DevUiShowcase() {
  const { showToast } = useToast();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [tab, setTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(true);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('hiresphere_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const columns: DataTableColumn<SampleRow>[] = [
    {
      key: 'company',
      header: 'Company',
      sortValue: (r) => r.company,
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
      sortValue: (r) => r.lpa,
      render: (r) => <span className="font-mono tabular-nums">{r.lpa.toFixed(1)}</span>,
    },
    {
      key: 'cutoff',
      header: 'Min CGPA',
      align: 'right',
      sortValue: (r) => r.cutoff,
      render: (r) => <span className="font-mono tabular-nums">{r.cutoff.toFixed(1)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusTag status={r.status} />,
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          title="UI Component Registry"
          description="Internal reference for HireSphere design tokens, typography, and controls."
          actions={
            <>
              <Button variant="secondary" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
                {isDark ? 'Light mode' : 'Dark mode'}
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Open modal
              </Button>
            </>
          }
        />

        {/* Typography & StatBlocks */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-muted">StatBlocks &amp; Status Tags</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBlock label="Eligible Drives" value={14} delta="+3 this week" deltaTone="positive" />
            <StatBlock label="Active Applications" value={6} />
            <StatBlock label="Avg ATS Score" value="78%" delta="+6 pts" deltaTone="positive" />
            <StatBlock label="Rejected" value={2} deltaTone="negative" />
          </div>
          <Panel className="flex flex-wrap items-center gap-3">
            <StatusTag status="APPLIED" />
            <StatusTag status="SHORTLISTED" />
            <StatusTag status="INTERVIEW" />
            <StatusTag status="OFFERED" />
            <StatusTag status="REJECTED" />
            <StatusTag status="OPEN" variant="dot" />
            <StatusTag status="CLOSED" variant="dot" />
          </Panel>
        </section>

        {/* Buttons, Avatars, Dropdown, Tooltip */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-muted">Buttons, Avatars &amp; Popovers</h3>
          <Panel className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => showToast('Saved changes to placement record.', 'success')}>
              Primary action
            </Button>
            <Button variant="secondary" onClick={() => showToast('Showing informational notice.', 'info')}>
              Secondary
            </Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="danger" onClick={() => showToast('Could not submit application.', 'error')}>
              Danger
            </Button>
            <Avatar name="Ananya Deshmukh" size="sm" />
            <Avatar name="Rohan Kulkarni" size="md" />
            <Tooltip content="Keyboard accessible tooltip">
              <Button variant="secondary" size="sm">Hover or focus</Button>
            </Tooltip>
            <DropdownMenu
              trigger={
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                  Menu
                </Button>
              }
              header={<p className="text-[12px] text-muted">coord.ananya@hiresphere.edu</p>}
              items={[
                { label: 'Profile settings', icon: <Settings className="h-3.5 w-3.5" />, onClick: () => {} },
                { label: 'Sign out', danger: true, icon: <LogOut className="h-3.5 w-3.5" />, onClick: () => {} },
              ]}
            />
          </Panel>
        </section>

        {/* Form Controls */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-muted">Form Controls</h3>
          <Panel className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Company name" placeholder="e.g. Razorpay" hint="Registered legal or campus recruiting name." />
            <Input label="Minimum CGPA" type="number" defaultValue="7.5" error="Must be between 0.0 and 10.0" />
            <Select label="Department">
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
            </Select>
            <div className="flex items-end pb-2">
              <Checkbox
                label="Restrict to unplaced students only"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea label="Eligibility notes" rows={2} placeholder="Specify backlog policy or bond details..." />
            </div>
          </Panel>
        </section>

        {/* Tabs & DataTable */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-muted">Tabs &amp; DataTable</h3>
          <Panel padded={false}>
            <div className="px-4 pt-2">
              <Tabs
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'all', label: 'All drives', count: 4 },
                  { value: 'open', label: 'Open', count: 1 },
                  { value: 'empty', label: 'Empty state', count: 0 },
                ]}
              />
            </div>
            {tab === 'empty' ? (
              <div className="p-4">
                <EmptyState
                  message="No drives match the selected filter."
                  action={<Button variant="secondary" size="sm" onClick={() => setTab('all')}>Reset filter</Button>}
                />
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={tab === 'open' ? SAMPLE_ROWS.filter((r) => r.status === 'OPEN') : SAMPLE_ROWS}
                rowKey={(r) => r.id}
              />
            )}
          </Panel>
        </section>

        {/* Skeletons */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-muted">Loading Skeletons</h3>
          <StatSkeleton />
          <CardSkeleton rows={2} />
        </section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Placement Modal"
        description="Press Escape or click outside to dismiss."
      >
        <div className="space-y-4">
          <Input label="Drive title" defaultValue="SDE-1 Campus Recruitment" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
