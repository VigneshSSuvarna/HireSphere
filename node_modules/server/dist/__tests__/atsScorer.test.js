import { describe, expect, it } from 'vitest';
import { scoreResumeText } from '../utils/atsScorer.js';
describe('atsScorer', () => {
    it('scores a complete, quantified resume higher than a sparse one', () => {
        const strongResume = `
      Aarav Sharma
      aarav@student.edu | +91-9876543210 | https://github.com/aarav | https://linkedin.com/in/aarav

      Education
      B.Tech in Computer Science, 2026, CGPA: 8.9

      Experience
      Software Engineering Intern - TechNova
      - Built and deployed a React + TypeScript dashboard reducing load latency by 35% for 2,000 users.
      - Automated CI/CD pipelines and integrated PostgreSQL caching, improving throughput by 40%.
      - Led a 4-person sprint team to deliver 12 production features ahead of schedule.

      Projects
      HireSphere Campus Placement Portal
      - Architected REST APIs with Express, Drizzle ORM, and Zod validation handling 500+ requests/min.
      - Implemented deterministic ATS resume scoring engine with PDF parsing.

      Skills
      TypeScript, React, Node.js, PostgreSQL, Docker, AWS, Git, Python
    ` + ' '.repeat(10) + 'scalable microservices testing monitoring '.repeat(45);
        const weakResume = 'John Doe. Looking for software job.';
        const strongResult = scoreResumeText(strongResume);
        const weakResult = scoreResumeText(weakResume);
        expect(strongResult.score).toBeGreaterThan(75);
        expect(weakResult.score).toBeLessThan(35);
        expect(strongResult.breakdown.sections.found).toEqual(expect.arrayContaining(['education', 'experience', 'projects', 'skills']));
        expect(strongResult.breakdown.contactInfo.hasEmail).toBe(true);
        expect(strongResult.breakdown.contactInfo.hasPhone).toBe(true);
        expect(strongResult.breakdown.contactInfo.hasLinks).toBe(true);
    });
    it('computes job description keyword match when JD is provided', () => {
        const resume = `
      Jane Doe | jane@test.edu | +1 555-234-5678 | https://github.com/jane
      Education: B.Tech CSE
      Experience: Built Kubernetes and PostgreSQL services in TypeScript and React.
      Projects: Deployed Docker containers on AWS.
      Skills: TypeScript, React, PostgreSQL, Docker, Kubernetes
    `;
        const jd = 'Seeking engineer experienced in TypeScript, React, PostgreSQL, Kubernetes, and Terraform.';
        const result = scoreResumeText(resume, jd);
        expect(result.breakdown.keywordMatch).toBeDefined();
        expect(result.breakdown.keywordMatch?.matched).toEqual(expect.arrayContaining(['typescript', 'react', 'postgresql', 'kubernetes']));
        expect(result.breakdown.keywordMatch?.missing).toContain('terraform');
    });
});
//# sourceMappingURL=atsScorer.test.js.map