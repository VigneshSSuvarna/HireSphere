import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import type { AtsScanResult } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import { Button, EmptyState, PageHeader, Panel, Textarea } from './components/ui';

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
      if (res.scans?.length) {
        setActiveScan((prev) => prev || res.scans[0]);
      }
    } catch {
      // ignore initial history load errors
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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

  const breakdownBars = activeScan
    ? [
        { label: 'Sections (Edu, Exp, Projects, Skills)', score: activeScan.breakdown.sections.score, max: activeScan.breakdown.sections.max },
        { label: 'Contact Information', score: activeScan.breakdown.contactInfo.score, max: activeScan.breakdown.contactInfo.max },
        { label: `Length (${activeScan.breakdown.length.wordCount} words)`, score: activeScan.breakdown.length.score, max: activeScan.breakdown.length.max },
        { label: `Action Verbs (${activeScan.breakdown.actionVerbs.count})`, score: activeScan.breakdown.actionVerbs.score, max: activeScan.breakdown.actionVerbs.max },
        { label: `Quantified Metrics (${activeScan.breakdown.quantifiedAchievements.count})`, score: activeScan.breakdown.quantifiedAchievements.score, max: activeScan.breakdown.quantifiedAchievements.max },
        { label: 'Formatting Hygiene', score: activeScan.breakdown.formatting.score, max: activeScan.breakdown.formatting.max },
        ...(activeScan.breakdown.keywordMatch
          ? [{ label: 'Job Description Keyword Match', score: activeScan.breakdown.keywordMatch.score, max: activeScan.breakdown.keywordMatch.max }]
          : []),
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <PageHeader
        title="ATS Resume Scanner"
        description="Deterministic rule-based check for sections, contact info, metrics, and job-description keywords."
      />

      <Panel className="space-y-5">
        <div className="border border-dashed border-hairline rounded-[6px] p-6 text-center bg-subtle/40 hover:border-accent transition-colors">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
            {file ? (
              <FileText className="h-6 w-6 text-accent" strokeWidth={1.75} />
            ) : (
              <Upload className="h-6 w-6 text-muted" strokeWidth={1.75} />
            )}
            <span className="text-[14px] font-medium text-ink">
              {file ? file.name : 'Select a PDF resume'}
            </span>
            <span className="text-[12px] text-muted">Text-based PDF only, up to 5 MB</span>
          </label>
        </div>

        <Textarea
          label="Target job description (optional)"
          rows={3}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste a role description to measure keyword alignment..."
        />

        {error && (
          <div className="p-3 rounded-[6px] bg-status-rejected-bg border border-status-rejected/25 text-[13px] text-status-rejected">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleScan} disabled={!file || isScanning}>
            {isScanning ? 'Scanning PDF...' : 'Run ATS scan'}
          </Button>
        </div>
      </Panel>

      {activeScan && !isScanning && (
        <Panel className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-hairline">
            <div>
              <h3 className="text-[16px] font-semibold text-ink">{activeScan.fileName}</h3>
              <p className="font-mono text-[12px] text-muted mt-0.5">
                {new Date(activeScan.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[44px] leading-none font-medium text-ink tabular-nums">
                {activeScan.score}
              </span>
              <span className="font-mono text-[13px] text-muted">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal Breakdown Bars */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Score Breakdown</h4>
              <div className="space-y-3">
                {breakdownBars.map((bar) => {
                  const pct = bar.max > 0 ? Math.round((bar.score / bar.max) * 100) : 0;
                  return (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted">{bar.label}</span>
                        <span className="font-mono text-ink tabular-nums">
                          {bar.score}/{bar.max}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-150"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions Checklist */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Suggestions Checklist</h4>
              <ul className="space-y-2">
                {activeScan.suggestions.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-[6px] bg-paper border border-hairline text-[13px] text-ink"
                  >
                    <CheckCircle2
                      className="h-4 w-4 text-accent shrink-0 mt-0.5"
                      strokeWidth={1.75}
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      <Panel className="space-y-3">
        <h3 className="text-[14px] font-semibold text-ink">Previous Scans</h3>
        {loadingHistory ? (
          <CardSkeleton rows={3} />
        ) : history.length === 0 ? (
          <EmptyState message="No previous resume scans recorded." />
        ) : (
          <div className="divide-y divide-hairline border border-hairline rounded-[6px]">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScan(item)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  activeScan?.id === item.id ? 'bg-subtle' : 'bg-surface hover:bg-subtle/60'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{item.fileName}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {new Date(item.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-semibold text-accent tabular-nums shrink-0">
                  {item.score}/100
                </span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
