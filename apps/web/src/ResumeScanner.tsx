import { useEffect, useState, useCallback } from 'react';
import type { AtsScanResult } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';

export default function ResumeScanner() {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScan, setActiveScan] = useState<AtsScanResult | null>(null);
  const [history, setHistory] = useState<AtsScanResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get<{ scans: AtsScanResult[] }>('/api/resume/scans');
      setHistory(res.scans || []);
      if (!activeScan && res.scans?.length) {
        setActiveScan(res.scans[0]);
      }
    } catch {
      // ignore initial history load errors silently
    } finally {
      setLoadingHistory(false);
    }
  }, [activeScan]);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }

      const res = await api.post<{ scan: AtsScanResult }>('/api/resume/scan', formData);
      setActiveScan(res.scan);
      setHistory((prev) => [res.scan, ...prev]);
      showToast(`ATS scan complete: ${res.scan.score}/100`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scan resume';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const score = activeScan?.score ?? 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            ATS Resume Scanner
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Upload your PDF resume (max 5MB) and optionally paste a job description for keyword matching.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-slate-50 dark:bg-slate-950/50">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
            <span className="text-4xl mb-3">📄</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium hover:text-purple-500 transition-colors">
              {file ? file.name : 'Click to upload a PDF resume'}
            </span>
            <span className="text-slate-500 text-xs mt-1">PDF only (Max 5MB)</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Target Job Description (Optional)
          </label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to measure keyword alignment..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-500 dark:text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleScan}
            disabled={!file || isScanning}
            className="px-6 py-3 rounded-lg font-bold transition-all shadow-lg bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? 'Analyzing PDF...' : 'Run ATS Scan'}
          </button>
        </div>
      </div>

      {/* Results */}
      {activeScan && !isScanning && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Scan Report: {activeScan.fileName}
              </h3>
              <p className="text-xs text-slate-500">
                Scanned on {new Date(activeScan.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* SVG Score Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className={
                    score >= 80
                      ? 'text-emerald-500'
                      : score >= 60
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {score}
                </span>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  / 100
                </p>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Sections</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {activeScan.breakdown.sections.score} / {activeScan.breakdown.sections.max}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Contact Info</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {activeScan.breakdown.contactInfo.score} / {activeScan.breakdown.contactInfo.max}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Length ({activeScan.breakdown.length.wordCount} words)
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {activeScan.breakdown.length.score} / {activeScan.breakdown.length.max}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Action Verbs ({activeScan.breakdown.actionVerbs.count})
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {activeScan.breakdown.actionVerbs.score} / {activeScan.breakdown.actionVerbs.max}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Quantified Metrics ({activeScan.breakdown.quantifiedAchievements.count})
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {activeScan.breakdown.quantifiedAchievements.score} /{' '}
                  {activeScan.breakdown.quantifiedAchievements.max}
                </p>
              </div>
              {activeScan.breakdown.keywordMatch && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">JD Keyword Match</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {activeScan.breakdown.keywordMatch.score} /{' '}
                    {activeScan.breakdown.keywordMatch.max}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Actionable Suggestions
            </h4>
            {activeScan.suggestions.map((tip, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300"
              >
                • {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Scan History
        </h3>
        {loadingHistory ? (
          <CardSkeleton rows={3} />
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-500">No scans yet. Upload a PDF above to get started.</p>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScan(item)}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  activeScan?.id === item.id
                    ? 'bg-purple-500/10 border-purple-500/40'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-purple-500/30'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                  {item.score} / 100
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
