import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import {
  users,
  studentProfiles,
  companies,
  drives,
  applications,
  events,
  dsaLogs,
  auditLogs,
} from './schema.js';

async function ensureUser(email: string, passwordHash: string, role: 'ADMIN' | 'COORDINATOR' | 'STUDENT') {
  const normalized = email.toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalized));
  if (existing[0]) {
    if (existing[0].role !== role) {
      await db.update(users).set({ role }).where(eq(users.id, existing[0].id));
    }
    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({
      email: normalized,
      password_hash: passwordHash,
      role,
      is_active: true,
    })
    .returning({ id: users.id });

  return inserted[0].id;
}

async function seed() {
  const defaultPass = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@hiresphere.edu').toLowerCase();

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(defaultPass, salt);
  const userHash = await bcrypt.hash('Password123!', salt);

  // 1. 1 Admin
  const adminId = await ensureUser(adminEmail, adminHash, 'ADMIN');

  // 2. 2 Coordinators
  const coord1Id = await ensureUser('coord.ananya@hiresphere.edu', userHash, 'COORDINATOR');
  const coord2Id = await ensureUser('coord.rohan@hiresphere.edu', userHash, 'COORDINATOR');

  // 3. 10 Students + profiles
  const studentSeeds = [
    { email: 'aarav.sharma@student.edu', fullName: 'Aarav Sharma', dept: 'CSE', cgpa: 8.9, year: 2026, skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
    { email: 'diya.patel@student.edu', fullName: 'Diya Patel', dept: 'CSE', cgpa: 9.2, year: 2026, skills: ['Python', 'PyTorch', 'SQL', 'FastAPI'] },
    { email: 'kabir.verma@student.edu', fullName: 'Kabir Verma', dept: 'IT', cgpa: 8.4, year: 2026, skills: ['Java', 'Spring Boot', 'Docker', 'AWS'] },
    { email: 'meera.nair@student.edu', fullName: 'Meera Nair', dept: 'ECE', cgpa: 8.1, year: 2026, skills: ['C++', 'Embedded', 'Python', 'Linux'] },
    { email: 'vihaan.joshi@student.edu', fullName: 'Vihaan Joshi', dept: 'CSE', cgpa: 7.6, year: 2026, skills: ['JavaScript', 'React', 'Tailwind', 'MongoDB'] },
    { email: 'isha.kulkarni@student.edu', fullName: 'Isha Kulkarni', dept: 'IT', cgpa: 8.7, year: 2026, skills: ['Go', 'Kubernetes', 'PostgreSQL', 'Redis'] },
    { email: 'arjun.reddy@student.edu', fullName: 'Arjun Reddy', dept: 'MECH', cgpa: 7.4, year: 2026, skills: ['Python', 'MATLAB', 'SQL'] },
    { email: 'sana.khan@student.edu', fullName: 'Sana Khan', dept: 'ECE', cgpa: 8.5, year: 2026, skills: ['C++', 'Verilog', 'Python', 'Git'] },
    { email: 'dev.malhotra@student.edu', fullName: 'Dev Malhotra', dept: 'CSE', cgpa: 6.9, year: 2026, skills: ['HTML', 'CSS', 'JavaScript'] },
    { email: 'tara.menon@student.edu', fullName: 'Tara Menon', dept: 'IT', cgpa: 9.0, year: 2026, skills: ['TypeScript', 'Next.js', 'GraphQL', 'Docker'] },
  ];

  const studentIds: string[] = [];
  for (const s of studentSeeds) {
    const id = await ensureUser(s.email, userHash, 'STUDENT');
    studentIds.push(id);

    await db
      .insert(studentProfiles)
      .values({
        userId: id,
        fullName: s.fullName,
        phone: '+91-98765-00000',
        bio: `${s.dept} final-year undergraduate passionate about building reliable software.`,
        linkedin: `https://linkedin.com/in/${s.fullName.toLowerCase().replace(/\s+/g, '-')}`,
        github: `https://github.com/${s.fullName.toLowerCase().replace(/\s+/g, '')}`,
        department: s.dept,
        cgpa: s.cgpa,
        graduationYear: s.year,
        skills: s.skills,
      })
      .onConflictDoNothing({ target: studentProfiles.userId });
  }

  // 4. 6 Companies
  const companySeeds = [
    { name: 'TechNova Solutions', website: 'https://technova.example.com', description: 'Cloud-native SaaS and developer tooling.' },
    { name: 'DataSphere Analytics', website: 'https://datasphere.example.com', description: 'Enterprise data pipelines and ML platforms.' },
    { name: 'CyberShield Security', website: 'https://cybershield.example.com', description: 'Application security and threat intelligence.' },
    { name: 'FinPulse Systems', website: 'https://finpulse.example.com', description: 'Real-time payment infrastructure.' },
    { name: 'VoltEdge Robotics', website: 'https://voltedge.example.com', description: 'Autonomous warehouse and edge systems.' },
    { name: 'Nimbus Commerce', website: 'https://nimbus.example.com', description: 'Headless e-commerce platform.' },
  ];

  const companyMap = new Map<string, string>();
  for (const c of companySeeds) {
    const existing = await db.select().from(companies).where(eq(companies.name, c.name));
    if (existing[0]) {
      companyMap.set(c.name, existing[0].id);
    } else {
      const inserted = await db.insert(companies).values(c).returning({ id: companies.id });
      companyMap.set(c.name, inserted[0].id);
    }
  }

  // 5. 8 Drives
  const existingDrives = await db.select({ id: drives.id }).from(drives);
  let driveIds: string[] = existingDrives.map((d) => d.id);

  if (driveIds.length === 0) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const driveSeeds = [
      {
        companyId: companyMap.get('TechNova Solutions')!,
        roleTitle: 'Frontend Software Engineer',
        description: 'Build accessible React & TypeScript interfaces for developer workflows.',
        packageLpa: 14.5,
        location: 'Bengaluru',
        minCgpa: 7.5,
        allowedDepartments: ['CSE', 'IT'],
        deadline: new Date(now + 14 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord1Id,
      },
      {
        companyId: companyMap.get('TechNova Solutions')!,
        roleTitle: 'Platform Backend Engineer',
        description: 'Design resilient APIs and distributed job queues in Node.js and Postgres.',
        packageLpa: 16.0,
        location: 'Bengaluru',
        minCgpa: 8.0,
        allowedDepartments: ['CSE', 'IT'],
        deadline: new Date(now + 18 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord1Id,
      },
      {
        companyId: companyMap.get('DataSphere Analytics')!,
        roleTitle: 'Data Engineer',
        description: 'Build ETL workflows and warehousing models.',
        packageLpa: 11.0,
        location: 'Hyderabad',
        minCgpa: 7.0,
        allowedDepartments: ['CSE', 'IT', 'ECE'],
        deadline: new Date(now + 10 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord1Id,
      },
      {
        companyId: companyMap.get('CyberShield Security')!,
        roleTitle: 'Security Associate',
        description: 'Conduct vulnerability assessments and automate security checks.',
        packageLpa: 15.0,
        location: 'Pune',
        minCgpa: 7.5,
        allowedDepartments: ['CSE', 'IT', 'ECE'],
        deadline: new Date(now + 21 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord2Id,
      },
      {
        companyId: companyMap.get('FinPulse Systems')!,
        roleTitle: 'SDE-1 (Core Payments)',
        description: 'High-throughput payment microservices in Java/Go.',
        packageLpa: 18.5,
        location: 'Mumbai',
        minCgpa: 8.2,
        allowedDepartments: ['CSE', 'IT'],
        deadline: new Date(now + 12 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord2Id,
      },
      {
        companyId: companyMap.get('VoltEdge Robotics')!,
        roleTitle: 'Embedded Systems Engineer',
        description: 'Firmware and Linux driver development for edge controllers.',
        packageLpa: 12.0,
        location: 'Chennai',
        minCgpa: 7.0,
        allowedDepartments: ['ECE', 'MECH', 'CSE'],
        deadline: new Date(now + 25 * dayMs),
        status: 'OPEN' as const,
        createdBy: coord2Id,
      },
      {
        companyId: companyMap.get('Nimbus Commerce')!,
        roleTitle: 'Full Stack Developer',
        description: 'End-to-end storefront and checkout engineering.',
        packageLpa: 10.5,
        location: 'Remote',
        minCgpa: 6.5,
        allowedDepartments: ['CSE', 'IT', 'ECE'],
        deadline: new Date(now - 3 * dayMs),
        status: 'CLOSED' as const,
        createdBy: coord1Id,
      },
      {
        companyId: companyMap.get('DataSphere Analytics')!,
        roleTitle: 'MLOps Intern (FTE Conversion)',
        description: 'Model serving and observability pipelines.',
        packageLpa: 13.0,
        location: 'Hyderabad',
        minCgpa: 8.0,
        allowedDepartments: ['CSE', 'IT'],
        deadline: new Date(now - 10 * dayMs),
        status: 'COMPLETED' as const,
        createdBy: coord1Id,
      },
    ];

    const insertedDrives = await db.insert(drives).values(driveSeeds).returning({ id: drives.id });
    driveIds = insertedDrives.map((d) => d.id);
  }

  // 6. Sample Applications
  if (driveIds.length >= 6 && studentIds.length >= 6) {
    const appSeeds = [
      { driveId: driveIds[0], studentId: studentIds[0], status: 'INTERVIEW' as const },
      { driveId: driveIds[1], studentId: studentIds[0], status: 'APPLIED' as const },
      { driveId: driveIds[0], studentId: studentIds[1], status: 'SHORTLISTED' as const },
      { driveId: driveIds[2], studentId: studentIds[1], status: 'OFFERED' as const },
      { driveId: driveIds[3], studentId: studentIds[2], status: 'APPLIED' as const },
      { driveId: driveIds[5], studentId: studentIds[3], status: 'SHORTLISTED' as const },
      { driveId: driveIds[4], studentId: studentIds[5], status: 'INTERVIEW' as const },
      { driveId: driveIds[0], studentId: studentIds[9], status: 'OFFERED' as const },
    ];

    for (const app of appSeeds) {
      await db
        .insert(applications)
        .values(app)
        .onConflictDoNothing({ target: [applications.driveId, applications.studentId] });
    }
  }

  // 7. Sample Events
  const existingEvents = await db.select({ id: events.id }).from(events);
  if (existingEvents.length === 0 && driveIds.length >= 4) {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;

    await db.insert(events).values([
      {
        title: 'TechNova Pre-Placement Talk',
        type: 'PPT',
        startsAt: new Date(now + 2 * dayMs),
        endsAt: new Date(now + 2 * dayMs + 2 * hourMs),
        driveId: driveIds[0],
        createdBy: coord1Id,
      },
      {
        title: 'DataSphere Online Coding Assessment',
        type: 'TEST',
        startsAt: new Date(now + 4 * dayMs),
        endsAt: new Date(now + 4 * dayMs + 2 * hourMs),
        driveId: driveIds[2],
        createdBy: coord1Id,
      },
      {
        title: 'FinPulse Technical Interviews - Round 1',
        type: 'INTERVIEW',
        startsAt: new Date(now + 6 * dayMs),
        endsAt: new Date(now + 6 * dayMs + 4 * hourMs),
        driveId: driveIds[4],
        createdBy: coord2Id,
      },
      {
        title: 'Resume & Mock Interview Clinic',
        type: 'OTHER',
        startsAt: new Date(now + 8 * dayMs),
        endsAt: new Date(now + 8 * dayMs + 2 * hourMs),
        driveId: null,
        createdBy: adminId,
      },
    ]);
  }

  // 8. Sample DSA log for first student if none exist
  const existingDsa = await db.select({ id: dsaLogs.id }).from(dsaLogs).limit(1);
  if (existingDsa.length === 0 && studentIds[0]) {
    await db.insert(dsaLogs).values([
      {
        userId: studentIds[0],
        problemTitle: 'Two Sum',
        problemUrl: 'https://leetcode.com/problems/two-sum/',
        difficulty: 'EASY',
        category: 'Arrays & Hashing',
        language: 'TypeScript',
      },
      {
        userId: studentIds[0],
        problemTitle: 'LRU Cache',
        problemUrl: 'https://leetcode.com/problems/lru-cache/',
        difficulty: 'MEDIUM',
        category: 'Linked List',
        language: 'TypeScript',
      },
    ]);
  }

  // 9. Audit log for seed
  await db.insert(auditLogs).values({
    actorId: adminId,
    action: 'DB_SEED',
    entity: 'system',
    meta: { students: studentSeeds.length, companies: companySeeds.length, drives: driveIds.length },
  });

  console.log('Seeded HireSphere database (1 admin, 2 coordinators, 10 students, 6 companies, 8 drives, applications, events).');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
