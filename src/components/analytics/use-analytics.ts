import { useEffect, useState, useCallback, useMemo } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { plannerService } from "@/services/planner";
import { journalService } from "@/services/journal";
import { moodService } from "@/services/mood";
import { loadPlannerState } from "@/lib/planner-storage";
import { loadJournalEntries } from "@/components/journal/journal-storage";
import { loadHabits } from "@/components/habits/habit-storage";
import {
  computeProductivityScore,
  computeFatigueMetrics,
  assessBurnoutRisk,
  analyzeMoodTrend,
  computeFocusTrend,
  computeDeepWorkCapacity,
  computeHabitConsistency,
  type CognitiveAnalytics,
  type ProductivityScore,
  type FatigueMetrics,
  type BurnoutRiskAssessment,
  type MoodTrend,
} from "@/lib/analytics";
import type { PlannerTask } from "@/components/planner/types";
import type { Habit } from "@/components/habits/types";
import type { JournalEntry } from "@/components/journal/types";
import type { Tables } from "@/types/database";

export type AnalyticsState = {
  loading: boolean;
  error: string | null;
  data: CognitiveAnalytics | null;
  lastUpdated: Date | null;
};

/**
 * Comprehensive analytics hook that loads and computes all metrics from real data
 */
export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>({
    loading: true,
    error: null,
    data: null,
    lastUpdated: null,
  });

  const cloudEnabled = isSupabaseConfigured();

  const loadAnalytics = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Load all data in parallel
      let plannerTasks: PlannerTask[] = [];
      let habits: Habit[] = [];
      let journalEntries: JournalEntry[] = [];
      let moodLogs: Tables<"mood_logs">[] = [];

      if (cloudEnabled) {
        // Load from Supabase
        const [plannerData, habitsData, journalData, moodData] = await Promise.allSettled([
          (async () => {
            const state = await plannerService.load();
            return state?.tasks ?? [];
          })(),
          (async () => {
            // Habits come from context, but we'll load them fresh
            // This would need a habitService.list() implementation
            return [];
          })(),
          (async () => {
            return await journalService.list();
          })(),
          (async () => {
            return await moodService.list();
          })(),
        ]);

        if (plannerData.status === "fulfilled") {
          plannerTasks = plannerData.value;
        }
        if (journalData.status === "fulfilled") {
          journalEntries = journalData.value;
        }
        if (moodData.status === "fulfilled") {
          moodLogs = moodData.value;
        }
      } else {
        // Load from localStorage
        const plannerState = loadPlannerState();
        if (plannerState) {
          plannerTasks = plannerState.tasks;
        }
        journalEntries = loadJournalEntries();
        habits = loadHabits();
      }

      // Compute all analytics
      const productivityScore = computeProductivityScore(plannerTasks);
      const fatigueMetrics = computeFatigueMetrics(moodLogs);
      const burnoutRisk = assessBurnoutRisk(habits, plannerTasks, moodLogs, journalEntries);
      const moodTrend = analyzeMoodTrend(moodLogs);
      const focusTrend = computeFocusTrend(moodLogs);
      const deepWorkCapacity = computeDeepWorkCapacity(plannerTasks, habits, moodLogs);
      const habitConsistency = computeHabitConsistency(habits);

      const analytics: CognitiveAnalytics = {
        productivityScore,
        fatigueMetrics,
        burnoutRisk,
        moodTrend,
        focusTrend,
        deepWorkCapacity,
        habitConsistency,
      };

      setState({
        loading: false,
        error: null,
        data: analytics,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load analytics",
        data: null,
        lastUpdated: null,
      });
    }
  }, [cloudEnabled]);

  // Load analytics on mount and when cloud status changes
  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  // Refresh analytics every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        void loadAnalytics();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [loadAnalytics, cloudEnabled]);

  return {
    ...state,
    refetch: loadAnalytics,
  };
}

/**
 * Memoized selectors for specific analytics
 */
export function useProductivityScore(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.productivityScore ?? null, [analytics?.productivityScore]);
}

export function useFatigueMetrics(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.fatigueMetrics ?? null, [analytics?.fatigueMetrics]);
}

export function useBurnoutRisk(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.burnoutRisk ?? null, [analytics?.burnoutRisk]);
}

export function useMoodTrend(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.moodTrend ?? [], [analytics?.moodTrend]);
}

export function useFocusTrend(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.focusTrend ?? [], [analytics?.focusTrend]);
}

export function useDeepWorkCapacity(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.deepWorkCapacity ?? 0, [analytics?.deepWorkCapacity]);
}

export function useHabitConsistency(analytics: CognitiveAnalytics | null) {
  return useMemo(() => analytics?.habitConsistency ?? 0, [analytics?.habitConsistency]);
}
