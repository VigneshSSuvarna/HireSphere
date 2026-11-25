import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<{
    STUDENT: "STUDENT";
    COORDINATOR: "COORDINATOR";
    ADMIN: "ADMIN";
}>;
export declare const driveStatusSchema: z.ZodEnum<{
    OPEN: "OPEN";
    CLOSED: "CLOSED";
    COMPLETED: "COMPLETED";
}>;
export declare const applicationStatusSchema: z.ZodEnum<{
    APPLIED: "APPLIED";
    SHORTLISTED: "SHORTLISTED";
    INTERVIEW: "INTERVIEW";
    OFFERED: "OFFERED";
    REJECTED: "REJECTED";
}>;
export declare const eventTypeSchema: z.ZodEnum<{
    INTERVIEW: "INTERVIEW";
    TEST: "TEST";
    PPT: "PPT";
    OTHER: "OTHER";
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        STUDENT: "STUDENT";
        COORDINATOR: "COORDINATOR";
        ADMIN: "ADMIN";
    }>;
}, z.core.$strip>;
export declare const updateActiveSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
export declare const profileUpdateSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodDefault<z.ZodString>;
    bio: z.ZodDefault<z.ZodString>;
    linkedin: z.ZodDefault<z.ZodString>;
    github: z.ZodDefault<z.ZodString>;
    department: z.ZodString;
    cgpa: z.ZodCoercedNumber<unknown>;
    graduationYear: z.ZodCoercedNumber<unknown>;
    skills: z.ZodDefault<z.ZodArray<z.ZodString>>;
    resumeUrl: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const createCompanySchema: z.ZodObject<{
    name: z.ZodString;
    website: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const createDriveSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    roleTitle: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    packageLpa: z.ZodCoercedNumber<unknown>;
    location: z.ZodDefault<z.ZodString>;
    minCgpa: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    allowedDepartments: z.ZodDefault<z.ZodArray<z.ZodString>>;
    deadline: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        OPEN: "OPEN";
        CLOSED: "CLOSED";
        COMPLETED: "COMPLETED";
    }>>;
}, z.core.$strip>;
export declare const updateDriveSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roleTitle: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    packageLpa: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    location: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    minCgpa: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    allowedDepartments: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    deadline: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        OPEN: "OPEN";
        CLOSED: "CLOSED";
        COMPLETED: "COMPLETED";
    }>>>;
}, z.core.$strip>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPLIED: "APPLIED";
        SHORTLISTED: "SHORTLISTED";
        INTERVIEW: "INTERVIEW";
        OFFERED: "OFFERED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
export declare const createEventSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<{
        INTERVIEW: "INTERVIEW";
        TEST: "TEST";
        PPT: "PPT";
        OTHER: "OTHER";
    }>>;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    driveId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateEventSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        INTERVIEW: "INTERVIEW";
        TEST: "TEST";
        PPT: "PPT";
        OTHER: "OTHER";
    }>>>;
    startsAt: z.ZodOptional<z.ZodString>;
    endsAt: z.ZodOptional<z.ZodString>;
    driveId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
