import type { AtsBreakdown } from '@hiresphere/shared';

export interface AtsScoreOutput {
  score: number;
  breakdown: AtsBreakdown;
  suggestions: string[];
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  education: /\b(education|academic|university|college|b\.?tech|b\.?e\.?|bachelor|master|gpa|cgpa)\b/i,
  experience: /\b(experience|employment|internship|intern|work history|career)\b/i,
  projects: /\b(projects|personal projects|academic projects|portfolio)\b/i,
  skills: /\b(skills|technical skills|technologies|tech stack|competencies|tools)\b/i,
};

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'architected', 'engineered',
  'created', 'launched', 'led', 'managed', 'optimized', 'improved', 'reduced',
  'increased', 'automated', 'deployed', 'integrated', 'refactored', 'scaled',
  'analyzed', 'researched', 'mentored', 'collaborated', 'delivered', 'streamlined',
  'migrated', 'tested', 'resolved', 'spearheaded', 'established',
];

const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'also', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'more', 'most', 'must',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
  'role', 'team', 'work', 'working', 'years', 'experience', 'strong', 'ability',
  'looking', 'using', 'required', 'preferred', 'responsibilities', 'requirements',
]);

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word]) => word);
}

export function scoreResumeText(rawText: string, jobDescription?: string | null): AtsScoreOutput {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const suggestions: string[] = [];

  // 1. Section Detection (20 pts)
  const foundSections: string[] = [];
  const missingSections: string[] = [];
  for (const [section, regex] of Object.entries(SECTION_PATTERNS)) {
    if (regex.test(text)) {
      foundSections.push(section);
    } else {
      missingSections.push(section);
    }
  }
  const sectionsScore = Math.round((foundSections.length / 4) * 20);
  if (missingSections.length > 0) {
    suggestions.push(
      `Add clearly labeled section(s): ${missingSections.map((s) => s[0].toUpperCase() + s.slice(1)).join(', ')}.`
    );
  }

  // 2. Contact Info (15 pts)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-()]{7,}\d)/.test(text);
  const hasLinks = /(linkedin\.com|github\.com|https?:\/\/)/i.test(text);
  const contactScore = (hasEmail ? 6 : 0) + (hasPhone ? 5 : 0) + (hasLinks ? 4 : 0);
  if (!hasEmail) suggestions.push('Include a professional email address at the top of your resume.');
  if (!hasPhone) suggestions.push('Include a reachable phone number.');
  if (!hasLinks) suggestions.push('Add links to your GitHub, LinkedIn, or portfolio.');

  // 3. Length (15 pts)
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  let lengthScore = 0;
  if (wordCount >= 250 && wordCount <= 900) {
    lengthScore = 15;
  } else if (wordCount >= 150 && wordCount < 250) {
    lengthScore = 9;
    suggestions.push(`Your resume is a bit short (${wordCount} words). Aim for 300–750 words with project details.`);
  } else if (wordCount > 900 && wordCount <= 1200) {
    lengthScore = 10;
    suggestions.push(`Your resume is slightly long (${wordCount} words). Tighten bullet points to fit 1 page if possible.`);
  } else if (wordCount < 150) {
    lengthScore = 4;
    suggestions.push(`Resume text is very sparse (${wordCount} words). Ensure text is selectable and add detailed bullet points.`);
  } else {
    lengthScore = 6;
    suggestions.push(`Resume is too dense (${wordCount} words). Trim older or less relevant items.`);
  }

  // 4. Action Verbs (15 pts)
  const matchedVerbs = ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, 'i').test(lower));
  const actionVerbScore = Math.min(15, Math.round((matchedVerbs.length / 8) * 15));
  if (matchedVerbs.length < 5) {
    suggestions.push('Start more bullet points with strong action verbs (e.g., Built, Optimized, Architected, Automated).');
  }

  // 5. Quantified Achievements (15 pts)
  const metricMatches = text.match(/\b\d+(\.\d+)?(%|x|k|m|ms|s|hrs?|users?|requests?|lpa)?\b/gi) || [];
  // Filter out likely years (1990-2035) to avoid inflating metric count
  const meaningfulMetrics = metricMatches.filter((m) => !/^(19|20)\d{2}$/.test(m));
  const metricCount = meaningfulMetrics.length;
  const quantifiedScore = Math.min(15, Math.round((metricCount / 6) * 15));
  if (metricCount < 4) {
    suggestions.push('Quantify your impact with numbers, percentages, latency reductions, or user counts.');
  }

  // 6. Formatting Red Flags (10 pts without JD, or 20 pts normalized)
  const redFlags: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const allCapsLines = lines.filter((l) => l.length > 20 && l === l.toUpperCase() && /[A-Z]/.test(l));
  if (allCapsLines.length > 4) {
    redFlags.push('Excessive ALL-CAPS lines reduce readability.');
  }
  if (/[^\x00-\x7F\u2013\u2014\u2022\u2018\u2019\u201C\u201D]/.test(text) && (text.match(/[│┌┐└┘├┤┬┴┼]/g)?.length || 0) > 2) {
    redFlags.push('Detected table/box-drawing characters that can break ATS parsers.');
  }
  if (wordCount > 0 && lines.length / Math.max(1, wordCount) > 0.45) {
    redFlags.push('Many fragmented single-word lines detected (multi-column layout may scramble reading order).');
  }
  const formattingScore = Math.max(0, 10 - redFlags.length * 4);
  for (const flag of redFlags) {
    suggestions.push(flag);
  }

  // 7. Optional Job Description Keyword Match
  const jdClean = jobDescription?.trim();
  let totalScore: number;
  const breakdown: AtsBreakdown = {
    sections: { score: sectionsScore, max: 20, found: foundSections, missing: missingSections },
    contactInfo: { score: contactScore, max: 15, hasEmail, hasPhone, hasLinks },
    length: { score: lengthScore, max: 15, wordCount },
    actionVerbs: { score: actionVerbScore, max: 15, count: matchedVerbs.length, matched: matchedVerbs.slice(0, 12) },
    quantifiedAchievements: { score: quantifiedScore, max: 15, count: metricCount },
    formatting: { score: formattingScore, max: 10, redFlags },
  };

  if (jdClean && jdClean.length >= 20) {
    const jdKeywords = extractKeywords(jdClean);
    const matchedKeywords = jdKeywords.filter((kw) => lower.includes(kw));
    const missingKeywords = jdKeywords.filter((kw) => !lower.includes(kw));
    const kwRatio = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 1;
    const keywordScore = Math.round(kwRatio * 25);

    breakdown.keywordMatch = {
      score: keywordScore,
      max: 25,
      matched: matchedKeywords.slice(0, 15),
      missing: missingKeywords.slice(0, 10),
    };

    if (missingKeywords.length > 0) {
      suggestions.push(
        `Incorporate relevant job-description keywords if applicable: ${missingKeywords.slice(0, 6).join(', ')}.`
      );
    }

    // Core sections total = 90; with JD = 115 -> normalize to 0-100
    const rawTotal = sectionsScore + contactScore + lengthScore + actionVerbScore + quantifiedScore + formattingScore + keywordScore;
    totalScore = Math.min(100, Math.round((rawTotal / 115) * 100));
  } else {
    // Without JD, core sections max = 90 -> normalize to 0-100
    const rawTotal = sectionsScore + contactScore + lengthScore + actionVerbScore + quantifiedScore + formattingScore;
    totalScore = Math.min(100, Math.round((rawTotal / 90) * 100));
  }

  if (suggestions.length === 0) {
    suggestions.push('Great job! Your resume has strong structure, measurable impact, and clean ATS formatting.');
  }

  return {
    score: totalScore,
    breakdown,
    suggestions,
  };
}
