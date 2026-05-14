/**
 * Focus/Deep Work System Types
 * Production-grade type definitions for deep work sessions and analytics
 */

export type FocusSessionStatus = "active" | "paused" | "completed" | "abandoned";
export type InterruptionType = "external" | "internal" | "notification" | "urgent_task";
export type InterruptionSeverity = "minor" | "moderate" | "major";

export interface FocusSession {
  id: string;
  userId: string;
  title: string;
  description?: string;
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes
  startTime: Date;
  endTime?: Date;
  status: FocusSessionStatus;
  pauseCount: number;
  totalPauseDuration: number; // seconds
  taskId?: string; // linked to planner task
  energyLevelStart?: number; // 1-10
  energyLevelEnd?: number; // 1-10
  focusQuality?: number; // 1-10
  moodBefore?: string;
  moodAfter?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusInterruption {
  id: string;
  userId: string;
  sessionId: string;
  type: InterruptionType;
  durationPaused: number; // seconds
  description?: string;
  severity: InterruptionSeverity;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusAnalytics {
  id: string;
  userId: string;
  date: Date;
  totalSessionDuration: number; // minutes
  sessionCount: number;
  interruptionCount: number;
  averageFocusQuality?: number; // 1-10
  bestFocusWindow?: number; // hour of day (0-23)
  fatigueLevel?: number; // 0-100
  recoveryRecommendation?: string;
  weeklyDeepWorkHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusStreak {
  currentStreak: number; // days
  longestStreak: number; // days
  totalSessionsThisWeek: number;
  totalDeepWorkMinutesThisWeek: number;
}

export interface CognitiveFatigueData {
  currentLevel: number; // 0-100
  trend: "increasing" | "stable" | "decreasing";
  accumulationDays: number;
  peakTime: string; // "14:30"
  recoveryTimeNeeded: number; // hours
  recommendations: string[];
}

export interface FocusTimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  totalSeconds: number; // planned duration
  pauseCount: number;
  pausedAtSecond?: number;
}

export interface SessionMetrics {
  completionRate: number; // 0-100
  averageInterruptions: number;
  focusStreak: FocusStreak;
  cognitiveLoad: "low" | "moderate" | "high";
  energyExpenditureTrend: "stable" | "declining" | "recovering";
}
