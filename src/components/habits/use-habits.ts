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
} from "./habit-storage";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loadedHabits = loadHabits();
      setHabits(loadedHabits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(
    (
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
      saveHabits(updatedHabits);
    },
    [habits],
  );

  const updateHabit = useCallback(
    (id: string, updates: Partial<Habit>) => {
      const updatedHabits = habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates, updatedAt: new Date().toISOString() } : habit,
      );
      setHabits(updatedHabits);
      saveHabits(updatedHabits);
    },
    [habits],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      const updatedHabits = habits.filter((habit) => habit.id !== id);
      setHabits(updatedHabits);
      deleteHabitFromStorage(id);
    },
    [habits],
  );

  const completeHabit = useCallback(
    (habitId: string, date: string, completed: boolean) => {
      const updatedHabits = habits.map((habit) => {
        if (habit.id === habitId) {
          return recordHabitCompletion(habit, date, completed);
        }
        return habit;
      });
      setHabits(updatedHabits);
      saveHabits(updatedHabits);
    },
    [habits],
  );

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
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
