import { z } from 'zod';

export const userRoleSchema = z.enum(['STUDENT', 'COORDINATOR', 'ADMIN']);
export const driveStatusSchema = z.enum(['OPEN', 'CLOSED', 'COMPLETED']);
export const applicationStatusSchema = z.enum([
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
]);
export const eventTypeSchema = z.enum(['INTERVIEW', 'TEST', 'PPT', 'OTHER']);

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateRoleSchema = z.object({
  role: userRoleSchema,
});

export const updateActiveSchema = z.object({
  isActive: z.boolean(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  phone: z.string().trim().max(30).default(''),
  bio: z.string().trim().max(1000).default(''),
  linkedin: z
    .string()
    .trim()
    .refine((v) => !v || /^https?:\/\//i.test(v), 'LinkedIn must be a valid URL')
    .default(''),
  github: z
    .string()
    .trim()
    .refine((v) => !v || /^https?:\/\//i.test(v), 'GitHub must be a valid URL')
    .default(''),
  department: z.string().trim().min(1, 'Department is required').max(30),
  cgpa: z.coerce.number().min(0, 'CGPA must be >= 0').max(10, 'CGPA must be <= 10'),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
  skills: z.array(z.string().trim().min(1)).max(30).default([]),
  resumeUrl: z
    .string()
    .trim()
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Resume URL must be a valid URL')
    .default(''),
});

export const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(120),
  website: z
    .string()
    .trim()
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Website must be a valid URL')
    .default(''),
  description: z.string().trim().max(1000).default(''),
});

export const createDriveSchema = z.object({
  companyId: z.string().uuid().optional(),
  companyName: z.string().trim().min(2).max(120).optional(),
  roleTitle: z.string().trim().min(2, 'Role title is required').max(120),
  description: z.string().trim().max(2000).default(''),
  packageLpa: z.coerce.number().positive('Package must be greater than 0').max(200),
  location: z.string().trim().min(1).max(120).default('Remote'),
  minCgpa: z.coerce.number().min(0).max(10).default(0),
  allowedDepartments: z.array(z.string().trim().min(1)).default([]),
  deadline: z.string().min(1, 'Deadline is required'),
  status: driveStatusSchema.default('OPEN'),
});

export const updateDriveSchema = createDriveSchema.partial();

export const updateApplicationStatusSchema = z.object({
  status: applicationStatusSchema,
});

export const createEventSchema = z.object({
  title: z.string().trim().min(2, 'Event title is required').max(160),
  type: eventTypeSchema.default('OTHER'),
  startsAt: z.string().min(1, 'Start time is required'),
  endsAt: z.string().min(1, 'End time is required'),
  driveId: z.string().uuid().nullable().optional(),
});

export const updateEventSchema = createEventSchema.partial();
