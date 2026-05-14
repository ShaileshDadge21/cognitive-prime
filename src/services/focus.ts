/**
 * Focus Service
 * Production-grade service for managing focus sessions and analytics
 */

import type { FocusSession, FocusInterruption, FocusAnalytics } from "@/components/focus/types";
import type { Tables } from "@/types/database";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";

type FocusSessionRow = Tables<"focus_sessions">;
type FocusInterruptionRow = Tables<"focus_interruptions">;
type FocusAnalyticsRow = Tables<"focus_analytics">;

function toSession(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    plannedDuration: row.planned_duration,
    actualDuration: row.actual_duration ?? undefined,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    status: row.status as FocusSession["status"],
    pauseCount: row.pause_count,
    totalPauseDuration: row.total_pause_duration,
    taskId: row.task_id ?? undefined,
    energyLevelStart: row.energy_level_start ?? undefined,
    energyLevelEnd: row.energy_level_end ?? undefined,
    focusQuality: row.focus_quality ?? undefined,
    moodBefore: row.mood_before ?? undefined,
    moodAfter: row.mood_after ?? undefined,
    notes: row.notes ?? undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toInterruption(row: FocusInterruptionRow): FocusInterruption {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    type: row.interruption_type as FocusInterruption["type"],
    durationPaused: row.duration_paused,
    description: row.description ?? undefined,
    severity: row.severity as FocusInterruption["severity"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toAnalytics(row: FocusAnalyticsRow): FocusAnalytics {
  return {
    id: row.id,
    userId: row.user_id,
    date: new Date(row.date),
    totalSessionDuration: row.total_session_duration,
    sessionCount: row.session_count,
    interruptionCount: row.interruption_count,
    averageFocusQuality: row.average_focus_quality ?? undefined,
    bestFocusWindow: row.best_focus_window ?? undefined,
    fatigueLevel: row.fatigue_level ?? undefined,
    recoveryRecommendation: row.recovery_recommendation ?? undefined,
    weeklyDeepWorkHours: row.weekly_deep_work_hours ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function sessionPayload(userId: string, session: Partial<FocusSession> & { title: string }) {
  return {
    user_id: userId,
    title: session.title,
    description: session.description ?? null,
    planned_duration: session.plannedDuration ?? 25,
    actual_duration: session.actualDuration ?? null,
    start_time: session.startTime?.toISOString() ?? new Date().toISOString(),
    end_time: session.endTime?.toISOString() ?? null,
    status: session.status ?? "active",
    pause_count: session.pauseCount ?? 0,
    total_pause_duration: session.totalPauseDuration ?? 0,
    task_id: session.taskId ?? null,
    energy_level_start: session.energyLevelStart ?? null,
    energy_level_end: session.energyLevelEnd ?? null,
    focus_quality: session.focusQuality ?? null,
    mood_before: session.moodBefore ?? null,
    mood_after: session.moodAfter ?? null,
    notes: session.notes ?? null,
    metadata: session.metadata ?? null,
  };
}

function interruptionPayload(
  userId: string,
  interruption: Partial<FocusInterruption> & { sessionId: string; type: string; severity: string },
) {
  return {
    user_id: userId,
    session_id: interruption.sessionId,
    interruption_type: interruption.type,
    duration_paused: interruption.durationPaused ?? 0,
    description: interruption.description ?? null,
    severity: interruption.severity,
  };
}

export const focusService = {
  /**
   * Create a new focus session
   */
  async createSession(session: Partial<FocusSession> & { title: string }): Promise<FocusSession> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert([sessionPayload(userId, session)])
      .select()
      .single();

    if (error) throw error;
    return toSession(data);
  },

  /**
   * Update a focus session
   */
  async updateSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession> {
    const supabase = getSupabaseClient();

    const payload = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.actualDuration && { actual_duration: updates.actualDuration }),
      ...(updates.endTime && { end_time: updates.endTime.toISOString() }),
      ...(updates.status && { status: updates.status }),
      ...(updates.pauseCount && { pause_count: updates.pauseCount }),
      ...(updates.totalPauseDuration && { total_pause_duration: updates.totalPauseDuration }),
      ...(updates.energyLevelEnd && { energy_level_end: updates.energyLevelEnd }),
      ...(updates.focusQuality && { focus_quality: updates.focusQuality }),
      ...(updates.moodAfter && { mood_after: updates.moodAfter }),
      ...(updates.notes && { notes: updates.notes }),
    };

    const { data, error } = await supabase
      .from("focus_sessions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toSession(data);
  },

  /**
   * Get the active focus session (one that's currently running or paused)
   */
  async getActiveSession(): Promise<FocusSession | null> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .select()
      .eq("user_id", userId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? toSession(data) : null;
  },

  /**
  async getSession(id: string): Promise<FocusSession | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .select()
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? toSession(data) : null;
  },

  /**
   * Get all sessions for the current user
   */
  async listSessions(limit = 50, offset = 0): Promise<FocusSession[]> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []).map(toSession);
  },

  /**
   * Get sessions by date range
   */
  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<FocusSession[]> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .select()
      .eq("user_id", userId)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: false });

    if (error) throw error;
    return (data || []).map(toSession);
  },

  /**
   * Get today's sessions
   */
  async getTodaySessions(): Promise<FocusSession[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getSessionsByDateRange(today, tomorrow);
  },

  /**
   * Add an interruption to a session
   */
  async recordInterruption(
    interruption: Partial<FocusInterruption> & {
      sessionId: string;
      type: string;
      severity: string;
    },
  ): Promise<FocusInterruption> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_interruptions")
      .insert([interruptionPayload(userId, interruption)])
      .select()
      .single();

    if (error) throw error;
    return toInterruption(data);
  },

  /**
   * Get interruptions for a session
   */
  async getSessionInterruptions(sessionId: string): Promise<FocusInterruption[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_interruptions")
      .select()
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map(toInterruption);
  },

  /**
   * Get today's analytics
   */
  async getTodayAnalytics(): Promise<FocusAnalytics | null> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("focus_analytics")
      .select()
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? toAnalytics(data) : null;
  },

  /**
   * Get analytics for a date range
   */
  async getAnalyticsByDateRange(startDate: Date, endDate: Date): Promise<FocusAnalytics[]> {
    const userId = await getCurrentUserId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("focus_analytics")
      .select()
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(toAnalytics);
  },

  /**
   * Get weekly analytics
   */
  async getWeeklyAnalytics(): Promise<FocusAnalytics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return this.getAnalyticsByDateRange(startDate, endDate);
  },
};
