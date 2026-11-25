import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';

interface ProfileResponse {
  profile: {
    fullName: string;
    phone: string;
    bio: string;
    linkedin: string;
    github: string;
    department: string;
    cgpa: number;
    graduationYear: number;
    skills: string[];
    resumeUrl: string;
  };
}

export default function ProfileSettings() {
  const activeUser = useAuthStore((state) => state.user);
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [cgpa, setCgpa] = useState('0');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [skillsText, setSkillsText] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('hiresphere_theme') || 'dark';
    setTheme(savedTheme);

    api
      .get<ProfileResponse>('/api/profile')
      .then(({ profile }) => {
        setFullName(profile.fullName || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setLinkedin(profile.linkedin || '');
        setGithub(profile.github || '');
        setDepartment(profile.department || 'CSE');
        setCgpa(String(profile.cgpa ?? 0));
        setGraduationYear(String(profile.graduationYear ?? 2026));
        setSkillsText((profile.skills || []).join(', '));
        setResumeUrl(profile.resumeUrl || '');
      })
      .catch((err: unknown) => {
        showToast(err instanceof Error ? err.message : 'Failed to load profile', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [showToast]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('hiresphere_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.put('/api/profile', {
        fullName,
        phone,
        bio,
        linkedin,
        github,
        department,
        cgpa: Number(cgpa) || 0,
        graduationYear: Number(graduationYear) || 2026,
        skills,
        resumeUrl,
      });

      showToast('Profile saved successfully!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xl flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white dark:border-slate-900 shrink-0">
          {(fullName || activeUser.email).substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {fullName || activeUser.email.split('@')[0]}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm truncate">
            {activeUser.email} •{' '}
            <span className="uppercase text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              {activeUser.role}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Profile & Academic Details
          </h3>
          <p className="text-sm text-slate-500">
            Keep your CGPA, department, and skills up to date for drive eligibility checks.
          </p>
        </div>

        {isLoading ? (
          <div className="p-8">
            <CardSkeleton rows={5} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  CGPA (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="TypeScript, React, Node.js, PostgreSQL"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                About Me (Bio)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell recruiters about your projects, interests, and goals..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Resume Link (optional)
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="w-full sm:w-64">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Theme Appearance
                </label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
