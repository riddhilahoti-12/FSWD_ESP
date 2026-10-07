import { z } from 'zod';

// ==========================================
// 1. Roles & Core Enums
// ==========================================
export type UserRole = 'STUDENT' | 'ADMIN';

export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

// ==========================================
// 2. User Interfaces
// ==========================================
export interface UserStats {
  xp: number;
  missionsCompleted: number;
  missionsStarted: number;
  averageScore: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

// ==========================================
// 3. Mission Interfaces
// ==========================================
export interface Mission {
  _id: string;
  title: string;
  slug: string;
  domain: string;
  difficulty: MissionDifficulty;
  description: string;
  briefing: string;
  learningObjectives: string[];
  estimatedDuration: string;
  thumbnail?: string;
  published: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Progress Interfaces
// ==========================================
export interface Progress {
  _id: string;
  studentId: string;
  missionId: string | Mission;
  currentStage: number;
  completedStages: number[];
  score: number;
  attempts: number;
  hintsUsed: number;
  elapsedTime: number; // in seconds
  status: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

// ==========================================
// 5. Standard API Response Structure
// ==========================================
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// 6. Zod Validation Schemas
// ==========================================
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
