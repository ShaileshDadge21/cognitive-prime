/**
 * Focus Hooks
 * Production-grade React hooks for deep work session management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  type FocusSession,
  type FocusTimerState,
  type CognitiveFatigueData,
  type FocusStreak,
  type SessionMetrics,
} from "@/components/focus/types";
import { focusService } from "@/services/focus";

/**
 * Hook for managing current focus session
 */
export function useFocusSession() {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (title: string, plannedDuration: number, taskId?: string) => {
      try {
        setLoading(true);
        setError(null);
        const session = await focusService.createSession({
          title,
          plannedDuration,
          taskId,
        });
        setCurrentSession(session);
        return session;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create session";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateSession = useCallback(
    async (updates: Partial<FocusSession>) => {
      if (!currentSession) return;

      try {
        setLoading(true);
        setError(null);
        const updated = await focusService.updateSession(currentSession.id, updates);
        setCurrentSession(updated);
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update session";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentSession],
  );

  const completeSession = useCallback(
    async (focusQuality: number, moodAfter: string, notes?: string) => {
      return updateSession({
        status: "completed",
        endTime: new Date(),
        focusQuality,
        moodAfter,
        notes,
      });
    },
    [updateSession],
  );

  const loadActiveSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await focusService.getActiveSession();
      setCurrentSession(session);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load active session";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveSession();
  }, [loadActiveSession]);

  const abandonSession = useCallback(async () => {
    return updateSession({
      status: "abandoned",
      endTime: new Date(),
    });
  }, [updateSession]);

  return {
    currentSession,
    loading,
    error,
    createSession,
    updateSession,
    completeSession,
    abandonSession,
    loadActiveSession,
  };
}

/**
 * Hook for managing focus timer state with persistence
 */
export function useFocusTimer(plannedDurationMinutes: number = 25, sessionId?: string) {
  const [timerState, setTimerState] = useState<FocusTimerState>({
    isRunning: false,
    isPaused: false,
    elapsedSeconds: 0,
    totalSeconds: plannedDurationMinutes * 60,
    pauseCount: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPauseDurationRef = useRef<number>(0);

  const start = useCallback(() => {
    if (timerState.isRunning) return;

    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const newElapsed = prev.elapsedSeconds + 1;
        if (newElapsed >= prev.totalSeconds) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return { ...prev, isRunning: false, elapsedSeconds: newElapsed };
        }
        return { ...prev, elapsedSeconds: newElapsed };
      });
    }, 1000);
  }, [timerState.isRunning]);

  const pause = useCallback(() => {
    if (!timerState.isRunning) return;

    pauseStartRef.current = Date.now();

    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
      pauseCount: prev.pauseCount + 1,
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [timerState.isRunning]);

  const resume = useCallback(() => {
    if (!timerState.isPaused || timerState.isRunning) return;

    if (pauseStartRef.current) {
      const pausedDuration = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      totalPauseDurationRef.current += pausedDuration;
      pauseStartRef.current = null;
    }

    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const newElapsed = prev.elapsedSeconds + 1;
        if (newElapsed >= prev.totalSeconds) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return { ...prev, isRunning: false, elapsedSeconds: newElapsed };
        }
        return { ...prev, elapsedSeconds: newElapsed };
      });
    }, 1000);
  }, [timerState.isPaused, timerState.isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pauseStartRef.current = null;
    totalPauseDurationRef.current = 0;

    setTimerState({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      totalSeconds: plannedDurationMinutes * 60,
      pauseCount: 0,
    });
  }, [plannedDurationMinutes]);

  // Persist pause duration to session if session ID exists
  useEffect(() => {
    if (sessionId && (timerState.isPaused || !timerState.isRunning)) {
      const pausedDuration = pauseStartRef.current
        ? Math.floor((Date.now() - pauseStartRef.current) / 1000) + totalPauseDurationRef.current
        : totalPauseDurationRef.current;

      if (pausedDuration > 0) {
        void focusService.updateSession(sessionId, {
          totalPauseDuration: pausedDuration,
          pauseCount: timerState.pauseCount,
        } as Partial<FocusSession>);
      }
    }
  }, [sessionId, timerState.isPaused, timerState.isRunning, timerState.pauseCount]);

  const remainingSeconds = timerState.totalSeconds - timerState.elapsedSeconds;
  const progress = (timerState.elapsedSeconds / timerState.totalSeconds) * 100;

  return {
    ...timerState,
    remainingSeconds,
    progress,
    totalPauseDuration: totalPauseDurationRef.current,
    start,
    pause,
    resume,
    reset,
  };
}

/**
 * Hook for loading focus sessions
 */
export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allSessions, todayList] = await Promise.all([
        focusService.listSessions(100),
        focusService.getTodaySessions(),
      ]);
      setSessions(allSessions);
      setTodaySessions(todayList);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load sessions";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    todaySessions,
    loading,
    error,
    refetch: loadSessions,
  };
}

/**
 * Hook for calculating cognitive fatigue
 */
export function useCognitiveFatigue(sessions: FocusSession[]): CognitiveFatigueData {
  return useMemo(() => {
    if (sessions.length === 0) {
      return {
        currentLevel: 0,
        trend: "stable",
        accumulationDays: 0,
        peakTime: "14:00",
        recoveryTimeNeeded: 0,
        recommendations: ["Start your first deep work session"],
      };
    }

    // Calculate average focus quality from recent sessions
    const recentSessions = sessions.slice(0, 7);
    const avgFocusQuality =
      recentSessions.reduce((sum, s) => sum + (s.focusQuality ?? 5), 0) /
      Math.max(recentSessions.length, 1);

    // Estimate fatigue based on total deep work time
    const weeklyMinutes = recentSessions.reduce((sum, s) => sum + (s.actualDuration ?? 0), 0);
    const dailyAvg = weeklyMinutes / 7;
    let fatigueLevel = Math.min(100, (dailyAvg / 120) * 100); // 120 min = moderate fatigue

    // Adjust based on focus quality
    fatigueLevel = fatigueLevel * (1 - (avgFocusQuality - 5) / 10);

    // Determine trend
    const oldWeek = sessions.slice(7, 14);
    const oldAvg = oldWeek.length > 0 ? oldWeek.length / 7 : dailyAvg;
    let trend: "increasing" | "stable" | "decreasing" = "stable";
    if (dailyAvg > oldAvg + 30) trend = "increasing";
    if (dailyAvg < oldAvg - 30) trend = "decreasing";

    // Find best focus window (most sessions)
    const sessionsByHour: Record<number, number> = {};
    recentSessions.forEach((s) => {
      const hour = s.startTime.getHours();
      sessionsByHour[hour] = (sessionsByHour[hour] ?? 0) + 1;
    });
    const bestHour = Object.entries(sessionsByHour).reduce(
      (best, [hour, count]) => (count > (best[1] ?? 0) ? [parseInt(hour), count] : best),
      [14, 0],
    )[0];

    // Count consecutive days with sessions
    const daysWithSessions = new Set(recentSessions.map((s) => s.startTime.toDateString())).size;

    // Recovery recommendations
    const recommendations: string[] = [];
    if (fatigueLevel > 70) {
      recommendations.push("Consider shorter sessions or taking a break");
      recommendations.push("Schedule recovery time before deep work");
    }
    if (trend === "increasing") {
      recommendations.push("Your fatigue is accumulating - monitor stress levels");
    }
    if (daysWithSessions < 3) {
      recommendations.push("Establish consistent deep work habits");
    }

    return {
      currentLevel: Math.round(fatigueLevel),
      trend,
      accumulationDays: daysWithSessions,
      peakTime: `${String(bestHour).padStart(2, "0")}:00`,
      recoveryTimeNeeded: fatigueLevel > 50 ? 2 : 1,
      recommendations,
    };
  }, [sessions]);
}

/**
 * Hook for tracking focus streak
 */
export function useFocusStreak(sessions: FocusSession[]): FocusStreak {
  return useMemo(() => {
    if (sessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalSessionsThisWeek: 0,
        totalDeepWorkMinutesThisWeek: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get this week's sessions
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekSessions = sessions.filter((s) => s.startTime >= weekStart);
    const totalMinutesThisWeek = weekSessions.reduce((sum, s) => sum + (s.actualDuration ?? 0), 0);

    // Calculate streaks
    const datesWithSessions = new Set(sessions.map((s) => s.startTime.toDateString()));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();

      if (datesWithSessions.has(dateStr)) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    return {
      currentStreak,
      longestStreak,
      totalSessionsThisWeek: weekSessions.length,
      totalDeepWorkMinutesThisWeek: totalMinutesThisWeek,
    };
  }, [sessions]);
}

/**
 * Hook for computing session metrics
 */
export function useSessionMetrics(sessions: FocusSession[]): SessionMetrics {
  return useMemo(() => {
    if (sessions.length === 0) {
      return {
        completionRate: 0,
        averageInterruptions: 0,
        focusStreak: {
          currentStreak: 0,
          longestStreak: 0,
          totalSessionsThisWeek: 0,
          totalDeepWorkMinutesThisWeek: 0,
        },
        cognitiveLoad: "low",
        energyExpenditureTrend: "stable",
      };
    }

    const completed = sessions.filter((s) => s.status === "completed").length;
    const completionRate = Math.round((completed / sessions.length) * 100);

    const avgInterruptions =
      sessions.reduce((sum, s) => sum + s.pauseCount, 0) / Math.max(sessions.length, 1);

    const focusStreak = {
      currentStreak: 0,
      longestStreak: 0,
      totalSessionsThisWeek: 0,
      totalDeepWorkMinutesThisWeek: 0,
    };

    // Estimate cognitive load from quality scores
    const avgQuality =
      sessions.reduce((sum, s) => sum + (s.focusQuality ?? 5), 0) / Math.max(sessions.length, 1);
    let cognitiveLoad: "low" | "moderate" | "high" = "moderate";
    if (avgQuality >= 7) cognitiveLoad = "low";
    if (avgQuality < 4) cognitiveLoad = "high";

    // Energy trend
    const recent = sessions.slice(0, 7);
    const older = sessions.slice(7, 14);
    const recentEnergy =
      recent.reduce((sum, s) => sum + (s.energyLevelEnd ?? 5), 0) / Math.max(recent.length, 1);
    const olderEnergy =
      older.reduce((sum, s) => sum + (s.energyLevelEnd ?? 5), 0) / Math.max(older.length, 1);

    let energyExpenditureTrend: "stable" | "declining" | "recovering" = "stable";
    if (recentEnergy < olderEnergy - 1) energyExpenditureTrend = "declining";
    if (recentEnergy > olderEnergy + 1) energyExpenditureTrend = "recovering";

    return {
      completionRate,
      averageInterruptions: Math.round(avgInterruptions * 10) / 10,
      focusStreak,
      cognitiveLoad,
      energyExpenditureTrend,
    };
  }, [sessions]);
}
