import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';

export interface DsaLog {
  id: string;
  userId: string;
  problemTitle: string;
  problemUrl: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  completedAt: string;
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

export const DsaTracker: React.FC = () => {
  const token = useAuthStore((state: any) => state.token);
  const [logs, setLogs] = useState<DsaLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    problemTitle: '',
    problemUrl: '',
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    category: 'Arrays & Hashing',
  });

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/dsa', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch DSA logs');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setCurrentStreak(data.currentStreak || 0);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token]);

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemTitle || !formData.problemUrl) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/dsa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ problemTitle: '', problemUrl: '', difficulty: 'EASY', category: 'Arrays & Hashing' });
        setIsModalOpen(false);
        fetchProgress();
      }
    } catch (err) {
      console.error('Failed to add problem log', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildHeatMapMatrix = () => {
    const totalWeeks = 52;
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

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const weeks = [];
    const monthLabels: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = totalWeeks - 1; w >= 0; w--) {
      const weekDays = [];
      let primaryMonthInWeek = -1;

      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const targetDate = new Date(endOfWeek);
        targetDate.setDate(endOfWeek.getDate() - (w * 7 + (6 - dayOfWeek)));

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const isFuture = targetDate > today;
        const count = isFuture ? 0 : (logCountsByDate[dateKey] || 0);

        if (dayOfWeek === 3) {
          primaryMonthInWeek = targetDate.getMonth();
        }

        weekDays.push({
          date: dateKey,
          displayDate: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          count,
          isFuture,
        });
      }

      const weekIndex = totalWeeks - 1 - w;
      if (primaryMonthInWeek !== -1 && primaryMonthInWeek !== lastMonth) {
        const monthName = new Date(2026, primaryMonthInWeek, 1).toLocaleString('default', { month: 'short' });
        monthLabels.push({ name: monthName, weekIndex });
        lastMonth = primaryMonthInWeek;
      }

      weeks.push(weekDays);
    }

    return { weeks, monthLabels };
  };

  const getHeatMapColor = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-slate-900/30 border-slate-800/20 cursor-not-allowed';
    if (count === 0) return 'bg-slate-800/40 border-slate-700/30 hover:border-slate-500';
    if (count === 1) return 'bg-emerald-900/80 border-emerald-500/50 hover:border-emerald-400';
    if (count === 2) return 'bg-emerald-600 border-emerald-400 hover:border-emerald-300';
    return 'bg-emerald-400 border-emerald-200 hover:border-white';
  };

  const getDifficultyBadge = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    switch (difficulty) {
      case 'EASY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Easy
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      case 'HARD':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Hard
          </span>
        );
      default:
        return null;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/dsa/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((item) => item.id !== id));
        fetchProgress();
      }
    } catch (err) {
      console.error('Failed to delete log', err);
    }
  };

  const { weeks, monthLabels } = buildHeatMapMatrix();

  const filteredLogs = selectedCategory === 'All'
    ? logs
    : logs.filter((log) => log.category === selectedCategory);

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Solved</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{logs.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Current Streak</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{currentStreak} Days 🔥</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Accuracy Status</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">Consistent</p>
        </div>
      </div>

      {/* Full-Width Activity Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl w-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Submission Activity</h3>
            <p className="text-xs text-slate-400">Daily practice graph across the past 12 months</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-800/40 border border-slate-700/30"></span>
            <span className="w-3 h-3 rounded-sm bg-emerald-900/80 border border-emerald-500/50"></span>
            <span className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-400"></span>
            <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-200"></span>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2 w-full">
          <div className="w-full min-w-[720px]">
            {/* Month Header Row */}
            <div className="flex text-[10px] text-slate-400 mb-1.5 ml-8 h-4 relative">
              {monthLabels.map((lbl, idx) => (
                <div
                  key={idx}
                  className="absolute font-semibold text-slate-300"
                  style={{ left: `${(lbl.weekIndex / 52) * 100}%` }}
                >
                  {lbl.name}
                </div>
              ))}
            </div>

            {/* Grid with Day Labels */}
            <div className="flex w-full items-center">
              <div className="flex flex-col justify-between text-[9px] text-slate-500 font-medium h-[104px] pr-2 select-none shrink-0">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="flex justify-between w-full gap-[2px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[2px] flex-1">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={
                          day.isFuture
                            ? `${day.displayDate}`
                            : `${day.count} problem(s) solved on ${day.displayDate}`
                        }
                        className={`w-full aspect-square rounded-[2px] border transition-all ${getHeatMapColor(
                          day.count,
                          day.isFuture
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Problem History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track your completed LeetCode and DSA practice questions</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
          >
            + Log Problem
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2"></div>
            <p>Loading your solved problems...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-sm">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {selectedCategory === 'All'
              ? 'No problems logged yet. Add your first problem to start your streak!'
              : `No problems found under "${selectedCategory}".`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-medium">Problem Title</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Topic</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Difficulty</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Completed Date</th>
                  <th scope="col" className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100">
                      <a
                        href={item.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                      >
                        {item.problemTitle}
                        <span className="text-xs text-slate-500">↗</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700/60">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getDifficultyBadge(item.difficulty)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(item.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Log Completed Problem</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProblem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Two Sum"
                  value={formData.problemTitle}
                  onChange={(e) => setFormData({ ...formData, problemTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Topic Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  LeetCode / Problem URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://leetcode.com/problems/two-sum/"
                  value={formData.problemUrl}
                  onChange={(e) => setFormData({ ...formData, problemUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DsaTracker;