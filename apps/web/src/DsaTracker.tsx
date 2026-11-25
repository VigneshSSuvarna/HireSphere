import React, { useEffect, useState } from 'react';
import { ExternalLink, Flame, Plus, Trash2, X } from 'lucide-react';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import {
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Panel,
  Select,
  StatusTag,
} from './components/ui';

export interface DsaLog {
  id: string;
  userId: string;
  problemTitle: string;
  problemUrl: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  language?: string;
  completedAt: string;
}

export interface PlatformLink {
  id: string;
  name: string;
  url: string;
}

interface HeatMapDay {
  date?: string;
  displayDate?: string;
  count?: number;
  isFuture?: boolean;
  isEmpty: boolean;
}

const CATEGORIES = [
  'All',
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees & Graphs',
  'Dynamic Programming',
  'Greedy',
  'Other',
];

const PROGRAMMING_LANGUAGES = [
  'C++',
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'C#',
  'Kotlin',
  'Swift',
  'Ruby',
  'PHP',
  'SQL',
  'Other',
];

export const DsaTracker: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<DsaLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Platform Links State
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>(() => {
    try {
      const saved = localStorage.getItem('hiresphere_dsa_links');
      return saved ? (JSON.parse(saved) as PlatformLink[]) : [];
    } catch {
      return [];
    }
  });
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [newLinkData, setNewLinkData] = useState({ name: '', url: '' });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    problemTitle: '',
    problemUrl: '',
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    category: 'Arrays & Hashing',
    language: 'C++',
    customLanguage: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem('hiresphere_dsa_links', JSON.stringify(platformLinks));
    } catch {
      // ignore storage quota errors
    }
  }, [platformLinks]);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ logs: DsaLog[]; currentStreak: number }>('/api/dsa');
      setLogs(data.logs || []);
      setCurrentStreak(data.currentStreak || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load DSA progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDifficultyClick = (diff: 'EASY' | 'MEDIUM' | 'HARD') => {
    setSelectedDifficulty((prev) => (prev === diff ? 'ALL' : diff));
  };

  const handleLanguageClick = (lang: string) => {
    setSelectedLanguage((prev) => (prev === lang ? 'ALL' : lang));
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemTitle || !formData.problemUrl) return;

    const resolvedLanguage =
      formData.language === 'Other'
        ? formData.customLanguage.trim() || 'Other'
        : formData.language;

    setIsSubmitting(true);
    try {
      await api.post('/api/dsa', {
        problemTitle: formData.problemTitle,
        problemUrl: formData.problemUrl,
        difficulty: formData.difficulty,
        category: formData.category,
        language: resolvedLanguage,
      });

      setFormData({
        problemTitle: '',
        problemUrl: '',
        difficulty: 'EASY',
        category: 'Arrays & Hashing',
        language: 'C++',
        customLanguage: '',
      });
      setIsModalOpen(false);
      showToast('Problem logged.', 'success');
      fetchProgress();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to log problem', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPlatformLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkData.name.trim() || !newLinkData.url.trim()) return;

    const newLink: PlatformLink = {
      id: Date.now().toString(),
      name: newLinkData.name.trim(),
      url: newLinkData.url.startsWith('http') ? newLinkData.url.trim() : `https://${newLinkData.url.trim()}`,
    };

    setPlatformLinks((prev) => [...prev, newLink]);
    setNewLinkData({ name: '', url: '' });
    setIsLinkModalOpen(false);
  };

  const handleDeletePlatformLink = (id: string) => {
    setPlatformLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/dsa/${id}`);
      setLogs((prev) => prev.filter((item) => item.id !== id));
      showToast('Log removed.', 'info');
      fetchProgress();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete log', 'error');
    }
  };

  const buildHeatMapMatrix = () => {
    const today = new Date();
    const logCountsByDate: Record<string, number> = {};

    logs.forEach((log) => {
      const d = new Date(log.completedAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      logCountsByDate[dateKey] = (logCountsByDate[dateKey] || 0) + 1;
    });

    const monthsData: { name: string; weeks: HeatMapDay[][] }[] = [];

    for (let m = 11; m >= 0; m--) {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthName = firstDayOfMonth.toLocaleString('default', { month: 'short' });
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() - m + 1, 0);

      const weeks: HeatMapDay[][] = [];
      let currentWeek: HeatMapDay[] = [];

      const startDay = firstDayOfMonth.getDay();
      for (let i = 0; i < startDay; i++) {
        currentWeek.push({ isEmpty: true });
      }

      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDate = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), day);
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const isFuture = currentDate > today;
        const count = isFuture ? 0 : logCountsByDate[dateKey] || 0;

        currentWeek.push({
          date: dateKey,
          displayDate: currentDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          count,
          isFuture,
          isEmpty: false,
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({ isEmpty: true });
        }
        weeks.push(currentWeek);
      }

      monthsData.push({ name: monthName, weeks });
    }

    return { monthsData, totalActiveDays: Object.keys(logCountsByDate).length };
  };

  const getHeatMapColor = (count = 0, isFuture = false, isEmpty = false) => {
    if (isEmpty) return 'bg-transparent';
    if (isFuture) return 'bg-subtle/40';
    if (count === 0) return 'bg-subtle border border-hairline';
    if (count === 1) return 'bg-accent/35';
    if (count === 2) return 'bg-accent/65';
    return 'bg-accent';
  };

  const { monthsData, totalActiveDays } = buildHeatMapMatrix();
  const easyCount = logs.filter((l) => l.difficulty === 'EASY').length;
  const mediumCount = logs.filter((l) => l.difficulty === 'MEDIUM').length;
  const hardCount = logs.filter((l) => l.difficulty === 'HARD').length;
  const totalSolved = logs.length;

  const languageCounts = logs.reduce((acc, log) => {
    const lang = log.language || 'Other';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredLogs = logs.filter((log) => {
    const catMatch = selectedCategory === 'All' || (log.category || 'General') === selectedCategory;
    const diffMatch = selectedDifficulty === 'ALL' || log.difficulty === selectedDifficulty;
    const langMatch = selectedLanguage === 'ALL' || (log.language || 'Other') === selectedLanguage;
    return catMatch && diffMatch && langMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <PageHeader
        title="DSA Practice Tracker"
        description="Log solved interview problems, track daily consistency, and filter by topic or difficulty."
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Log problem
          </Button>
        }
      />

      {/* Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Difficulty Breakdown */}
        <Panel className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Difficulty Breakdown</h3>
            <span className="font-mono text-[13px] text-muted tabular-nums">
              {totalSolved} total
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDifficultyClick('EASY')}
              className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                selectedDifficulty === 'EASY'
                  ? 'border-accent bg-accent-soft'
                  : 'border-hairline bg-paper hover:bg-subtle/60'
              }`}
            >
              <p className="text-[12px] text-status-offered font-medium">Easy</p>
              <p className="font-mono text-[20px] font-semibold text-ink tabular-nums mt-0.5">
                {easyCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyClick('MEDIUM')}
              className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                selectedDifficulty === 'MEDIUM'
                  ? 'border-accent bg-accent-soft'
                  : 'border-hairline bg-paper hover:bg-subtle/60'
              }`}
            >
              <p className="text-[12px] text-status-shortlisted font-medium">Medium</p>
              <p className="font-mono text-[20px] font-semibold text-ink tabular-nums mt-0.5">
                {mediumCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyClick('HARD')}
              className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                selectedDifficulty === 'HARD'
                  ? 'border-accent bg-accent-soft'
                  : 'border-hairline bg-paper hover:bg-subtle/60'
              }`}
            >
              <p className="text-[12px] text-status-rejected font-medium">Hard</p>
              <p className="font-mono text-[20px] font-semibold text-ink tabular-nums mt-0.5">
                {hardCount}
              </p>
            </button>
          </div>
        </Panel>

        {/* Streak & Languages */}
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Consistency &amp; Languages</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-status-shortlisted-bg text-status-shortlisted font-mono text-[12px] font-medium tabular-nums">
              <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
              {currentStreak}d streak
            </span>
          </div>
          {Object.keys(languageCounts).length === 0 ? (
            <p className="text-[12px] text-muted">No language logs yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(languageCounts).map(([lang, count]) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageClick(lang)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[12px] transition-colors cursor-pointer ${
                    selectedLanguage === lang
                      ? 'border-accent bg-accent-soft text-ink font-medium'
                      : 'border-hairline bg-paper text-muted hover:text-ink'
                  }`}
                >
                  <span>{lang}</span>
                  <span className="font-mono tabular-nums text-ink">{count}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* Platform Links */}
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Coding Profiles</h3>
            <Button variant="tertiary" size="sm" onClick={() => setIsLinkModalOpen(true)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Add link
            </Button>
          </div>
          {platformLinks.length === 0 ? (
            <p className="text-[12px] text-muted">
              Save quick links to your LeetCode, Codeforces, or HackerRank profiles.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {platformLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-paper border border-hairline"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline truncate"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeletePlatformLink(link.id)}
                    aria-label={`Remove ${link.name}`}
                    className="text-muted hover:text-status-rejected cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Submissions Heatmap */}
      <Panel className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-[13px] text-ink">
            <span className="font-mono font-semibold tabular-nums">{totalSolved}</span>{' '}
            <span className="text-muted">submissions in the past 12 months</span>
          </p>
          <div className="flex items-center gap-4 font-mono text-[12px] text-muted tabular-nums">
            <span>Active days: {totalActiveDays}</span>
            <span>Max streak: {currentStreak}d</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-3.5 min-w-[700px] justify-between">
            {monthsData.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-1.5">
                <div className="flex gap-1">
                  {m.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          title={
                            day.isEmpty
                              ? undefined
                              : day.isFuture
                              ? day.displayDate
                              : `${day.count} submission(s) on ${day.displayDate}`
                          }
                          className={`w-2.5 h-2.5 rounded-[2px] ${getHeatMapColor(
                            day.count,
                            day.isFuture,
                            day.isEmpty
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-mono text-muted">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Problem History Table */}
      <Panel padded={false} className="overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline flex flex-wrap items-center justify-between gap-3 bg-subtle/40">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-semibold text-ink">Problem History</h3>
            {selectedDifficulty !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedDifficulty('ALL')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-surface border border-hairline text-[12px] text-ink cursor-pointer"
              >
                {selectedDifficulty}
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            )}
            {selectedLanguage !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedLanguage('ALL')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-surface border border-hairline text-[12px] text-ink cursor-pointer"
              >
                {selectedLanguage}
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            )}
          </div>
          <span className="font-mono text-[12px] text-muted tabular-nums">
            {filteredLogs.length} shown
          </span>
        </div>

        {/* Category Filter Strip */}
        <div className="px-4 py-2 border-b border-hairline flex gap-1.5 overflow-x-auto bg-paper/60">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-[5px] text-[12px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-accent text-accent-fg font-medium'
                  : 'text-muted hover:text-ink hover:bg-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-4">
            <CardSkeleton rows={4} />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-[13px] text-status-rejected">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-4">
            <EmptyState
              message="No problems match the selected category, difficulty, or language."
              action={
                <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
                  Log first problem
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="bg-subtle border-b border-hairline">
                <tr>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Problem
                  </th>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Topic
                  </th>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Language
                  </th>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Difficulty
                  </th>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Completed
                  </th>
                  <th className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredLogs.map((item) => (
                  <tr key={item.id} className="h-10 hover:bg-subtle/60 transition-colors">
                    <td className="px-4 py-2 font-medium text-ink">
                      <a
                        href={item.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
                      >
                        <span>{item.problemTitle}</span>
                        <ExternalLink className="h-3 w-3 text-muted" strokeWidth={1.75} />
                      </a>
                    </td>
                    <td className="px-4 py-2 text-[12px] text-muted">
                      {item.category || 'General'}
                    </td>
                    <td className="px-4 py-2 font-mono text-[12px] text-ink">
                      {item.language || 'C++'}
                    </td>
                    <td className="px-4 py-2">
                      <StatusTag
                        status={item.difficulty}
                        label={
                          item.difficulty === 'EASY'
                            ? 'Easy'
                            : item.difficulty === 'MEDIUM'
                            ? 'Medium'
                            : 'Hard'
                        }
                        tone={
                          item.difficulty === 'EASY'
                            ? 'offered'
                            : item.difficulty === 'MEDIUM'
                            ? 'shortlisted'
                            : 'rejected'
                        }
                      />
                    </td>
                    <td className="px-4 py-2 font-mono text-[12px] text-muted tabular-nums">
                      {new Date(item.completedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.problemTitle}`}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] text-muted hover:text-status-rejected hover:bg-status-rejected-bg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Log Problem Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Completed Problem"
      >
        <form onSubmit={handleAddProblem} className="space-y-4">
          <Input
            label="Problem title"
            required
            placeholder="e.g. Two Sum"
            value={formData.problemTitle}
            onChange={(e) => setFormData({ ...formData, problemTitle: e.target.value })}
          />
          <Input
            label="Problem URL"
            type="url"
            required
            placeholder="https://leetcode.com/problems/..."
            value={formData.problemUrl}
            onChange={(e) => setFormData({ ...formData, problemUrl: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD',
                })
              }
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Select>
            <Select
              label="Topic"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>
          {formData.language === 'Other' && (
            <Input
              label="Custom language"
              placeholder="Specify language..."
              value={formData.customLanguage}
              onChange={(e) => setFormData({ ...formData, customLanguage: e.target.value })}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save log'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Platform Link Modal */}
      <Modal
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Add Coding Profile"
      >
        <form onSubmit={handleAddPlatformLink} className="space-y-4">
          <Input
            label="Platform name"
            required
            placeholder="e.g. LeetCode, Codeforces"
            value={newLinkData.name}
            onChange={(e) => setNewLinkData({ ...newLinkData, name: e.target.value })}
          />
          <Input
            label="Profile URL"
            required
            placeholder="https://leetcode.com/u/handle/"
            value={newLinkData.url}
            onChange={(e) => setNewLinkData({ ...newLinkData, url: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add link</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
