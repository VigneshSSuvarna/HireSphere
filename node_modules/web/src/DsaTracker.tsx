import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';

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
  const token = useAuthStore((state: any) => state.token);
  const [logs, setLogs] = useState<DsaLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Platform Links State
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [newLinkData, setNewLinkData] = useState({ name: '', url: '' });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');

  // Animation trigger state for SVG rotation key
  const [animateKey, setAnimateKey] = useState<number>(0);

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

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/dsa', {
        headers: {
          Authorization: `Bearer ${token}`,
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
    if (token) {
      fetchProgress();
    }
  }, [token]);

  const handleDifficultyClick = (diff: 'EASY' | 'MEDIUM' | 'HARD') => {
    setSelectedDifficulty((prev) => (prev === diff ? 'ALL' : diff));
    setAnimateKey((prev) => prev + 1);
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
      const res = await fetch('http://localhost:5000/api/dsa', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemTitle: formData.problemTitle,
          problemUrl: formData.problemUrl,
          difficulty: formData.difficulty,
          category: formData.category,
          language: resolvedLanguage,
        }),
      });

      if (res.ok) {
        setFormData({
          problemTitle: '',
          problemUrl: '',
          difficulty: 'EASY',
          category: 'Arrays & Hashing',
          language: 'C++',
          customLanguage: '',
        });
        setIsModalOpen(false);
        fetchProgress();
      }
    } catch (err) {
      console.error('Failed to add problem log', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPlatformLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkData.name || !newLinkData.url) return;

    const newLink: PlatformLink = {
      id: Date.now().toString(),
      name: newLinkData.name,
      url: newLinkData.url.startsWith('http') ? newLinkData.url : `https://${newLinkData.url}`,
    };

    setPlatformLinks((prev) => [...prev, newLink]);
    setNewLinkData({ name: '', url: '' });
    setIsLinkModalOpen(false);
  };

  const handleDeletePlatformLink = (id: string) => {
    setPlatformLinks((prev) => prev.filter((link) => link.id !== id));
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

    const monthsData: { name: string; weeks: any[][] }[] = [];

    for (let m = 11; m >= 0; m--) {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthName = firstDayOfMonth.toLocaleString('default', { month: 'short' });
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() - m + 1, 0);

      const weeks: any[][] = [];
      let currentWeek: any[] = [];

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
          displayDate: currentDate.toLocaleDateString(undefined, {
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

  const getHeatMapColor = (count: number, isFuture: boolean, isEmpty: boolean) => {
    if (isEmpty) return 'bg-transparent border-none';
    if (isFuture) return 'bg-slate-900/10 cursor-not-allowed';
    if (count === 0) return 'bg-slate-800/40 hover:bg-slate-700/60';
    if (count === 1) return 'bg-emerald-700/80 hover:bg-emerald-600';
    if (count === 2) return 'bg-emerald-500 hover:bg-emerald-400';
    return 'bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-400/50';
  };

  const getDifficultyBadge = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    switch (difficulty) {
      case 'EASY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10">
            Easy
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/10">
            Medium
          </span>
        );
      case 'HARD':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10">
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
          Authorization: `Bearer ${token}`,
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

  const { monthsData, totalActiveDays } = buildHeatMapMatrix();

  const easyCount = logs.filter((l) => l.difficulty === 'EASY').length;
  const mediumCount = logs.filter((l) => l.difficulty === 'MEDIUM').length;
  const hardCount = logs.filter((l) => l.difficulty === 'HARD').length;
  const totalSolved = logs.length;

  const totalArc = 100;
  const easyRatio = totalSolved > 0 ? (easyCount / totalSolved) * totalArc : 0;
  const medRatio = totalSolved > 0 ? (mediumCount / totalSolved) * totalArc : 0;
  const hardRatio = totalSolved > 0 ? (hardCount / totalSolved) * totalArc : 0;

  const languageCounts = logs.reduce((acc, log) => {
    const lang = log.language || 'Other';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredLogs = logs.filter((log) => {
    const matchCategory = selectedCategory === 'All' || log.category === selectedCategory;
    const matchDifficulty = selectedDifficulty === 'ALL' || log.difficulty === selectedDifficulty;
    const matchLanguage = selectedLanguage === 'ALL' || (log.language || 'Other') === selectedLanguage;
    return matchCategory && matchDifficulty && matchLanguage;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Difficulty Progress Box with Animated Gauge */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl transition-all duration-300 hover:border-slate-700">
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg
              key={animateKey}
              className="w-full h-full transform -rotate-90 transition-transform duration-700 ease-out hover:rotate-[270deg]"
              style={{
                animation: 'spinOnce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              viewBox="0 0 36 36"
            >
              <path
                className="text-slate-800"
                strokeWidth="2.8"
                stroke="currentColor"
                fill="none"
                strokeDasharray="75, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />

              {easyRatio > 0 && (
                <path
                  className="text-cyan-400 transition-all duration-700 ease-in-out"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${(easyRatio * 0.75).toFixed(1)}, 100`}
                  strokeDashoffset="0"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}

              {medRatio > 0 && (
                <path
                  className="text-amber-400 transition-all duration-700 ease-in-out"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${(medRatio * 0.75).toFixed(1)}, 100`}
                  strokeDashoffset={`-${(easyRatio * 0.75).toFixed(1)}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}

              {hardRatio > 0 && (
                <path
                  className="text-rose-500 transition-all duration-700 ease-in-out"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${(hardRatio * 0.75).toFixed(1)}, 100`}
                  strokeDashoffset={`-${((easyRatio + medRatio) * 0.75).toFixed(1)}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-100 leading-none">
                {totalSolved}
              </span>
              <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
                ✓ Solved
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-32">
            <button
              onClick={() => handleDifficultyClick('EASY')}
              className={`p-2.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                selectedDifficulty === 'EASY'
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5'
              }`}
            >
              <p className="text-xs font-semibold text-cyan-400">Easy</p>
              <p className="text-sm font-bold text-slate-100">{easyCount}</p>
            </button>

            <button
              onClick={() => handleDifficultyClick('MEDIUM')}
              className={`p-2.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                selectedDifficulty === 'MEDIUM'
                  ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5'
              }`}
            >
              <p className="text-xs font-semibold text-amber-400">Med.</p>
              <p className="text-sm font-bold text-slate-100">{mediumCount}</p>
            </button>

            <button
              onClick={() => handleDifficultyClick('HARD')}
              className={`p-2.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                selectedDifficulty === 'HARD'
                  ? 'bg-rose-500/20 border-rose-400 shadow-md shadow-rose-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/5'
              }`}
            >
              <p className="text-xs font-semibold text-rose-500">Hard</p>
              <p className="text-sm font-bold text-slate-100">{hardCount}</p>
            </button>
          </div>
        </div>

        {/* Box 2: Performance & Languages */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-slate-700">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Performance Stats
              </h3>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full shadow-sm shadow-orange-500/20">
                🔥 {currentStreak} Days Streak
              </span>
            </div>

            <div className="mt-2 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Languages Solved
              </p>
              {Object.keys(languageCounts).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No logs yet</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {Object.entries(languageCounts).map(([lang, count]) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageClick(lang)}
                      className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-indigo-600/30 border-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/50'
                      }`}
                    >
                      <span className="text-xs font-semibold text-indigo-400">
                        {lang}
                      </span>
                      <span className="text-xs font-bold text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Box 3: Platform Profile Links */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-slate-700">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Platform Links
              </h3>
            </div>

            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {platformLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 group"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-400 hover:text-indigo-300 text-sm truncate max-w-[170px]"
                  >
                    {link.name}
                  </a>
                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors"
                    >
                      View Profile ↗
                    </a>
                    <button
                      onClick={() => handleDeletePlatformLink(link.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs ml-1 transition-colors"
                      title="Remove Link"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400 text-xs font-semibold transition-all duration-200 group"
              >
                <span className="text-base group-hover:scale-125 transition-transform">
                  +
                </span>
                <span>Add Platform Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full overflow-hidden transition-all duration-300 hover:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-slate-100">{totalSolved}</span>
            <span className="text-sm font-normal text-slate-400">
              submissions in the past one year
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <div>
              Total active days: <span className="text-slate-100 font-bold">{totalActiveDays}</span>
            </div>
            <div>
              Max streak: <span className="text-slate-100 font-bold">{currentStreak}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2 w-full">
          <div className="flex gap-4 min-w-[720px] justify-between">
            {monthsData.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-2">
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
                              ? `${day.displayDate}`
                              : `${day.count} submission(s) on ${day.displayDate}`
                          }
                          className={`w-3 h-3 rounded-[3px] transition-all duration-150 ${getHeatMapColor(
                            day.count,
                            day.isFuture,
                            day.isEmpty
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-medium text-slate-400">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Problem History</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track your completed practice questions
              </p>
            </div>
            <div className="flex gap-2">
              {selectedDifficulty !== 'ALL' && (
                <button
                  onClick={() => setSelectedDifficulty('ALL')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  Difficulty: {selectedDifficulty} ✕
                </button>
              )}
              {selectedLanguage !== 'ALL' && (
                <button
                  onClick={() => setSelectedLanguage('ALL')}
                  className="text-xs bg-indigo-900/60 hover:bg-indigo-900/90 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-700 flex items-center gap-1.5 transition-colors"
                >
                  Language: {selectedLanguage} ✕
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all duration-200"
          >
            + Log Problem
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
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
            No problems found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-medium">Problem Title</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Topic</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Language</th>
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
                    <td className="px-6 py-4 text-xs font-semibold text-indigo-400">
                      {item.language || 'C++'}
                    </td>
                    <td className="px-6 py-4">
                      {getDifficultyBadge(item.difficulty)}
                    </td>
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
              <h3 className="text-lg font-bold text-slate-100">
                Log Completed Problem
              </h3>
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
                  onChange={(e) =>
                    setFormData({ ...formData, problemTitle: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Problem URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://leetcode.com/problems/..."
                  value={formData.problemUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, problemUrl: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setFormData({ ...formData, difficulty: diff })}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        formData.difficulty === diff
                          ? diff === 'EASY'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                            : diff === 'MEDIUM'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                            : 'bg-rose-500/20 border-rose-400 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
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
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {formData.language === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Custom Language
                  </label>
                  <input
                    type="text"
                    placeholder="Specify language..."
                    value={formData.customLanguage}
                    onChange={(e) =>
                      setFormData({ ...formData, customLanguage: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Platform Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                Add Platform Profile Link
              </h3>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlatformLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LeetCode, Codeforces, HackerRank"
                  value={newLinkData.name}
                  onChange={(e) =>
                    setNewLinkData({ ...newLinkData, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Profile URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://leetcode.com/u/yourusername/"
                  value={newLinkData.url}
                  onChange={(e) =>
                    setNewLinkData({ ...newLinkData, url: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};