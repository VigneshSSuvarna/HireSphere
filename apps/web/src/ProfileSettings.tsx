import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import {
  Avatar,
  Button,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusTag,
  Textarea,
} from './components/ui';

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
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('hiresphere_theme') || 'light';
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
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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

      showToast('Profile saved.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Profile Settings"
        description="Academic credentials, links, and appearance preferences."
      />

      <Panel className="flex items-center gap-4">
        <Avatar name={fullName || activeUser.email} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[16px] font-semibold text-ink truncate">
              {fullName || activeUser.email.split('@')[0]}
            </h3>
            <StatusTag status={activeUser.role} tone="neutral" />
          </div>
          <p className="font-mono text-[12px] text-muted mt-0.5 truncate">
            {activeUser.email}
          </p>
        </div>
      </Panel>

      {isLoading ? (
        <Panel>
          <CardSkeleton rows={5} />
        </Panel>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <Panel className="space-y-4">
            <h4 className="text-[14px] font-semibold text-ink pb-2 border-b border-hairline">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <Textarea
              label="Short bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summarize your technical focus, internships, and projects..."
            />
          </Panel>

          <Panel className="space-y-4">
            <h4 className="text-[14px] font-semibold text-ink pb-2 border-b border-hairline">
              Academic Record &amp; Skills
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </Select>
              <Input
                label="CGPA (0 - 10)"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="font-mono tabular-nums"
              />
              <Input
                label="Graduation year"
                type="number"
                min="2020"
                max="2035"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="font-mono tabular-nums"
              />
            </div>
            <Input
              label="Skills (comma-separated)"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="TypeScript, React, Node.js, PostgreSQL"
            />
          </Panel>

          <Panel className="space-y-4">
            <h4 className="text-[14px] font-semibold text-ink pb-2 border-b border-hairline">
              Links &amp; Appearance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="LinkedIn URL"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
              <Input
                label="GitHub URL"
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
              <Input
                label="Resume URL (optional)"
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="max-w-xs">
              <Select
                label="Theme"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                <option value="light">Light (Paper)</option>
                <option value="dark">Dark (Charcoal)</option>
              </Select>
            </div>
          </Panel>

          {/* Sticky Save Bar */}
          <div className="sticky bottom-0 z-10 bg-surface border border-hairline rounded-[8px] px-5 py-3 flex items-center justify-between gap-4">
            <span className="text-[12px] text-muted">
              CGPA and department are used to check drive eligibility.
            </span>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
