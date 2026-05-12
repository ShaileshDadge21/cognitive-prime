import { useState, useEffect, useMemo, useCallback } from "react";
import { Habit, HabitAnalytics } from "./types";
import {
  loadHabits,
  saveHabits,
  recordHabitCompletion,
  searchHabits,
  computeHabitAnalytics,
  generateHabitRecommendation,
  deleteHabit as deleteHabitFromStorage,
  createHabitBackup,
  restoreHabitBackup,
  getHabitStorageStats,
  cleanupOldCompletions,
  migrateHabitStorage,
} from "./habit-storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { habitService } from "@/services/habits";
import {
  calculateHabitScore,
  generateHabitInsights,
  generateAdaptiveRecommendations,
  generateHabitHealthReport,
  type HabitScore,
  type HabitInsights,
  type AdaptiveRecommendation,
  type HabitHealthReport,
} from "@/lib/habit-scoring-engine";
import { isStorageAvailable } from "@/lib/storage";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const cloudEnabled = isSupabaseConfigured();

  useEffect(() => {
    const checkStorage = async () => {
      const available = isStorageAvailable();
      setStorageAvailable(available);

      if (!available && !cloudEnabled) {
        setError("Local storage is not available. Habit data will not persist.");
        setLoading(false);
        return;
      }

      try {
        if (cloudEnabled) {
          const loadedHabits = await habitService.list();
          setHabits(loadedHabits);
          setLoading(false);
          return;
        }

        // Attempt migration if needed
        const migrated = migrateHabitStorage();

        const loadedHabits = loadHabits();
        if (migrated) {
          saveHabits(loadedHabits);
        }
        setHabits(loadedHabits);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load habits");
        // Try to load from local storage as fallback
        try {
          const loadedHabits = loadHabits();
          setHabits(loadedHabits);
        } catch (fallbackErr) {
          console.error("Habit loading failed completely:", fallbackErr);
          setHabits([]);
        }
        setLoading(false);
      }
    };

    checkStorage();
  }, [cloudEnabled]);

  const addHabit = useCallback(
    async (
      habit: Omit<
        Habit,
        "id" | "createdAt" | "updatedAt" | "completionHistory" | "streakCount" | "consistencyScore"
      >,
    ) => {
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionHistory: [],
        streakCount: 0,
        consistencyScore: 0,
      };

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);

      try {
        if (cloudEnabled) {
          await habitService.upsert(newHabit);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save habit");
        setHabits(habits);
        return;
      }

      if (storageAvailable) {
        saveHabits(updatedHabits);
      }
    },
    [cloudEnabled, habits, storageAvailable],
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      const updatedHabits = habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates, updatedAt: new Date().toISOString() } : habit,
      );
      setHabits(updatedHabits);

      try {
        if (cloudEnabled) {
          const updatedHabit = updatedHabits.find((habit) => habit.id === id);
          if (updatedHabit) {
            await habitService.upsert(updatedHabit);
          }
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update habit");
        setHabits(habits);
        return;
      }

      if (storageAvailable) {
        saveHabits(updatedHabits);
      }
    },
    [cloudEnabled, habits, storageAvailable],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const updatedHabits = habits.filter((habit) => habit.id !== id);
      setHabits(updatedHabits);

      try {
        if (cloudEnabled) {
          await habitService.remove(id);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete habit");
        setHabits(habits);
        return;
      }

      if (storageAvailable) {
        deleteHabitFromStorage(id);
      }
    },
    [cloudEnabled, habits, storageAvailable],
  );

  const completeHabit = useCallback(
    async (habitId: string, date: string, completed: boolean) => {
      const currentHabit = habits.find((habit) => habit.id === habitId);
      if (!currentHabit) {
        return;
      }

      const updatedHabits = habits.map((habit) => {
        if (habit.id === habitId) {
          return recordHabitCompletion(habit, date, completed);
        }
        return habit;
      });
      setHabits(updatedHabits);

      try {
        if (cloudEnabled) {
          await habitService.recordCompletion(currentHabit, date, completed);
          const loadedHabits = await habitService.list();
          setHabits(loadedHabits);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete habit");
        setHabits(habits);
        return;
      }

      saveHabits(updatedHabits);
    },
    [cloudEnabled, habits],
  );

  // Advanced persistence features
  const backupHabits = useCallback(() => {
    if (storageAvailable) {
      createHabitBackup();
    }
  }, [storageAvailable]);

  const restoreHabits = useCallback(
    async (file: File): Promise<boolean> => {
      if (!storageAvailable) return false;

      const success = await restoreHabitBackup(file);
      if (success) {
        const loadedHabits = loadHabits();
        setHabits(loadedHabits);
      }
      return success;
    },
    [storageAvailable],
  );

  const cleanupOldData = useCallback(
    (monthsToKeep = 12): number => {
      if (!storageAvailable) return 0;
      return cleanupOldCompletions(monthsToKeep);
    },
    [storageAvailable],
  );

  const storageStats = useMemo(() => {
    if (!storageAvailable) return null;
    return getHabitStorageStats();
  }, [storageAvailable]);

  return {
    habits,
    loading,
    error,
    storageAvailable,
    cloudEnabled,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    backupHabits,
    restoreHabits,
    cleanupOldData,
    storageStats,
  };
}

export function useHabitSearch(habits: Habit[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "streak" | "consistency" | "created">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedHabits = useMemo(() => {
    let filtered = searchHabits(habits, searchQuery);

    if (categoryFilter !== "all") {
      filtered = filtered.filter((habit) => habit.category === categoryFilter);
    }

    if (frequencyFilter !== "all") {
      filtered = filtered.filter((habit) => habit.frequency === frequencyFilter);
    }

    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "streak":
          aValue = a.streakCount;
          bValue = b.streakCount;
          break;
        case "consistency":
          aValue = a.consistencyScore;
          bValue = b.consistencyScore;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [habits, searchQuery, categoryFilter, frequencyFilter, sortBy, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    frequencyFilter,
    setFrequencyFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredHabits: filteredAndSortedHabits,
  };
}

export function useHabitStreak(habit: Habit) {
  const streak = useMemo(() => habit.streakCount, [habit.streakCount]);

  const isOnStreak = useMemo(() => {
    if (streak === 0) return false;

    const today = new Date().toISOString().slice(0, 10);
    const lastCompletion = habit.completionHistory
      .filter((c) => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return lastCompletion?.date === today;
  }, [habit.completionHistory, streak]);

  const streakLevel = useMemo(() => {
    if (streak >= 100) return "legendary";
    if (streak >= 50) return "epic";
    if (streak >= 25) return "rare";
    if (streak >= 7) return "uncommon";
    return "common";
  }, [streak]);

  return { streak, isOnStreak, streakLevel };
}

export function useHabitCompletion(habit: Habit) {
  const today = new Date().toISOString().slice(0, 10);

  const isCompletedToday = useMemo(() => {
    return habit.completionHistory.some(
      (completion) => completion.date === today && completion.completed,
    );
  }, [habit.completionHistory, today]);

  const canCompleteToday = useMemo(() => {
    // For daily habits, can complete once per day
    if (habit.frequency === "daily") {
      return !isCompletedToday;
    }

    // For weekly habits, can complete once per week
    if (habit.frequency === "weekly") {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().slice(0, 10);

      return !habit.completionHistory.some(
        (completion) => completion.date >= weekStartStr && completion.completed,
      );
    }

    // For monthly habits, can complete once per month
    if (habit.frequency === "monthly") {
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().slice(0, 10);

      return !habit.completionHistory.some(
        (completion) => completion.date >= monthStartStr && completion.completed,
      );
    }

    return false;
  }, [habit.frequency, habit.completionHistory, isCompletedToday]);

  return { isCompletedToday, canCompleteToday };
}

export function useHabitAnalytics(habits: Habit[]) {
  const analytics = useMemo(() => {
    const allAnalytics: HabitAnalytics[] = habits.map(computeHabitAnalytics);

    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => h.completionHistory.length > 0).length;
    const completedToday = habits.filter((h) => {
      const today = new Date().toISOString().slice(0, 10);
      return h.completionHistory.some((c) => c.date === today && c.completed);
    }).length;

    const averageConsistency =
      allAnalytics.reduce((sum, a) => sum + a.consistencyScore, 0) / totalHabits || 0;
    const totalCompletions = allAnalytics.reduce((sum, a) => sum + a.totalCompletions, 0);
    const longestStreak = Math.max(...allAnalytics.map((a) => a.longestStreak), 0);

    return {
      totalHabits,
      activeHabits,
      completedToday,
      averageConsistency: Math.round(averageConsistency),
      totalCompletions,
      longestStreak,
      habitAnalytics: allAnalytics,
    };
  }, [habits]);

  return analytics;
}

export function useHabitRecommendations(habits: Habit[]) {
  const recommendations = useMemo(() => {
    return habits.map((habit) => ({
      habit,
      recommendations: generateHabitRecommendation(habit),
    }));
  }, [habits]);

  return recommendations;
}

export function useHabitScoring(habits: Habit[]) {
  const scores = useMemo(() => {
    return habits.map((habit) => calculateHabitScore(habit));
  }, [habits]);

  const averageScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score.overallScore, 0) / scores.length);
  }, [scores]);

  const topPerformingHabits = useMemo(() => {
    return scores
      .filter((score) => score.overallScore >= 80)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);
  }, [scores]);

  const strugglingHabits = useMemo(() => {
    return scores
      .filter((score) => score.overallScore < 50)
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 5);
  }, [scores]);

  return {
    scores,
    averageScore,
    topPerformingHabits,
    strugglingHabits,
  };
}

export function useHabitInsights(habits: Habit[]) {
  const insights = useMemo(() => {
    return habits.map((habit) => generateHabitInsights(habit));
  }, [habits]);

  const performanceDistribution = useMemo(() => {
    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      struggling: 0,
      critical: 0,
    };

    insights.forEach((insight) => {
      distribution[insight.performance]++;
    });

    return distribution;
  }, [insights]);

  const trendDistribution = useMemo(() => {
    const distribution = {
      improving: 0,
      stable: 0,
      declining: 0,
    };

    insights.forEach((insight) => {
      distribution[insight.trend]++;
    });

    return distribution;
  }, [insights]);

  const totalRiskFactors = useMemo(() => {
    return insights.reduce((sum, insight) => sum + insight.riskFactors.length, 0);
  }, [insights]);

  return {
    insights,
    performanceDistribution,
    trendDistribution,
    totalRiskFactors,
  };
}

export function useAdaptiveRecommendations(habits: Habit[]) {
  const recommendations = useMemo(() => {
    return habits.map((habit) => ({
      habit,
      recommendations: generateAdaptiveRecommendations(habit),
    }));
  }, [habits]);

  const criticalRecommendations = useMemo(() => {
    return recommendations
      .flatMap((rec) => rec.recommendations)
      .filter((rec) => rec.priority === "critical");
  }, [recommendations]);

  const highPriorityRecommendations = useMemo(() => {
    return recommendations
      .flatMap((rec) => rec.recommendations)
      .filter((rec) => rec.priority === "high");
  }, [recommendations]);

  const groupedByType = useMemo(() => {
    const groups: Record<string, AdaptiveRecommendation[]> = {};

    recommendations.forEach((rec) => {
      rec.recommendations.forEach((recommendation) => {
        if (!groups[recommendation.type]) {
          groups[recommendation.type] = [];
        }
        groups[recommendation.type].push(recommendation);
      });
    });

    return groups;
  }, [recommendations]);

  return {
    recommendations,
    criticalRecommendations,
    highPriorityRecommendations,
    groupedByType,
  };
}

export function useHabitHealthReports(habits: Habit[]) {
  const reports = useMemo(() => {
    return habits.map((habit) => generateHabitHealthReport(habit));
  }, [habits]);

  const getReportForHabit = useCallback(
    (habitId: string): HabitHealthReport | undefined => {
      return reports.find((report) => report.habitId === habitId);
    },
    [reports],
  );

  const getHabitsByPerformance = useCallback(
    (performance: "excellent" | "good" | "fair" | "struggling" | "critical") => {
      return reports
        .filter((report) => report.insights.performance === performance)
        .map((report) => habits.find((h) => h.id === report.habitId))
        .filter(Boolean) as Habit[];
    },
    [reports, habits],
  );

  return {
    reports,
    getReportForHabit,
    getHabitsByPerformance,
  };
}
