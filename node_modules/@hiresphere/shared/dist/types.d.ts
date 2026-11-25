import type { z } from 'zod';
import type { userRoleSchema, driveStatusSchema, applicationStatusSchema, eventTypeSchema, profileUpdateSchema, createDriveSchema, createEventSchema } from './schemas.js';
export type UserRole = z.infer<typeof userRoleSchema>;
export type DriveStatus = z.infer<typeof driveStatusSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreateDriveInput = z.infer<typeof createDriveSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export interface AtsBreakdown {
    sections: {
        score: number;
        max: number;
        found: string[];
        missing: string[];
    };
    contactInfo: {
        score: number;
        max: number;
        hasEmail: boolean;
        hasPhone: boolean;
        hasLinks: boolean;
    };
    length: {
        score: number;
        max: number;
        wordCount: number;
    };
    actionVerbs: {
        score: number;
        max: number;
        count: number;
        matched: string[];
    };
    quantifiedAchievements: {
        score: number;
        max: number;
        count: number;
    };
    formatting: {
        score: number;
        max: number;
        redFlags: string[];
    };
    keywordMatch?: {
        score: number;
        max: number;
        matched: string[];
        missing: string[];
    };
}
export interface AtsScanResult {
    id: string;
    fileName: string;
    score: number;
    breakdown: AtsBreakdown;
    suggestions: string[];
    jobDescription?: string | null;
    createdAt: string;
}
export interface StudentDashboardStats {
    applicationsByStatus: Record<ApplicationStatus, number>;
    totalApplications: number;
    upcomingEventsCount: number;
    upcomingEvents: Array<{
        id: string;
        title: string;
        type: EventType;
        startsAt: string;
        endsAt: string;
    }>;
    avgAtsScore: number | null;
    dsaStreak: number;
    dsaCounts: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };
}
export interface CoordinatorDashboardStats {
    openDrives: number;
    totalDrives: number;
    totalApplicants: number;
    funnel: Record<ApplicationStatus, number>;
}
export interface AdminDashboardStats {
    usersByRole: Record<UserRole, number>;
    totalDrives: number;
    openDrives: number;
    totalPlacements: number;
    placementRateByDepartment: Array<{
        department: string;
        totalStudents: number;
        placedStudents: number;
        rate: number;
    }>;
}
