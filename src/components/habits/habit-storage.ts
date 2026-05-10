import { getStoredValue, setStoredValue, removeStoredValue } from "@/lib/storage";
import { mockHabits } from "./mock-data";
import type { Habit, HabitAnalytics, HabitCompletionRecord } from "./types";

const HABIT_STORAGE_KEY = "neuroflow:habits:data";
export const HABIT_STORAGE_VERSION = 1;

export type HabitStorageSchema = {
  version: number;
  persistedAt: string;
  habits: Habit[];
  lastSyncedAt?: string;
};

export function loadHabits(): Habit[] {
  const stored = getStoredValue<HabitStorageSchema>(HABIT_STORAGE_KEY);
  if (!stored || stored.version !== HABIT_STORAGE_VERSION) {
    // Initialize with mock data if no data exists
    if (!stored) {
      saveHabits(mockHabits);
      return mockHabits;
    }
    return [];
  }
  return stored.habits || [];
}

export function saveHabits(habits: Habit[]): void {
  const payload: HabitStorageSchema = {
    version: HABIT_STORAGE_VERSION,
    persistedAt: new Date().toISOString(),
    habits,
    lastSyncedAt: new Date().toISOString(),
  };
  setStoredValue(HABIT_STORAGE_KEY, payload);
}

export function saveHabit(habit: Habit): Habit {
  const habits = loadHabits();
  const index = habits.findIndex((item) => item.id === habit.id);
  const updatedHabit: Habit = {
    ...habit,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    habits[index] = updatedHabit;
  } else {
    habits.push(updatedHabit);
  }

  saveHabits(habits);
  return updatedHabit;
}

export function deleteHabit(habitId: string): void {
  const habits = loadHabits();
  const filtered = habits.filter((item) => item.id !== habitId);
  saveHabits(filtered);
}

export function getHabit(habitId: string): Habit | undefined {
  return loadHabits().find((item) => item.id === habitId);
}

export function recordHabitCompletion(habit: Habit, date: string, completed: boolean): Habit {
  const history = [...habit.completionHistory];
  const existingIndex = history.findIndex((record) => record.date === date);

  if (existingIndex >= 0) {
    history[existingIndex] = { date, completed };
  } else {
    history.push({ date, completed });
  }

  const updatedHabit: Habit = {
    ...habit,
    completionHistory: history.sort((a, b) => a.date.localeCompare(b.date)),
    updatedAt: new Date().toISOString(),
  };

  updatedHabit.streakCount = computeStreakCount(updatedHabit);
  updatedHabit.consistencyScore = computeConsistencyScore(updatedHabit);

  // Update the habit in storage
  const habits = loadHabits();
  const index = habits.findIndex((h) => h.id === habit.id);
  if (index >= 0) {
    habits[index] = updatedHabit;
    saveHabits(habits);
  }

  return updatedHabit;
}

export function clearHabits(): void {
  removeStoredValue(HABIT_STORAGE_KEY);
}

export function searchHabits(habits: Habit[], query: string): Habit[] {
  if (!query.trim()) return habits;

  const searchTerm = query.toLowerCase();
  return habits.filter(
    (habit) =>
      habit.title.toLowerCase().includes(searchTerm) ||
      habit.notes?.toLowerCase().includes(searchTerm) ||
      habit.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  );
}

export function computeStreakCount(habit: Habit): number {
  if (habit.completionHistory.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  const current = new Date(today);

  const normalized = habit.completionHistory.reduce<Record<string, boolean>>((acc, record) => {
    acc[record.date] = record.completed;
    return acc;
  }, {});

  const step = habit.frequency === "weekly" ? 7 : habit.frequency === "monthly" ? 30 : 1;

  while (true) {
    const dateKey = current.toISOString().slice(0, 10);
    const completed = normalized[dateKey];
    if (completed) {
      streak += 1;
    } else {
      break;
    }
    current.setDate(current.getDate() - step);
  }

  return streak;
}

export function computeConsistencyScore(habit: Habit): number {
  if (habit.completionHistory.length === 0) return 0;
  const completedCount = habit.completionHistory.filter((record) => record.completed).length;
  return Math.round((completedCount / habit.completionHistory.length) * 100);
}

export function computeHabitAnalytics(habit: Habit): HabitAnalytics {
  const totalCompletions = habit.completionHistory.filter((c) => c.completed).length;
  const longestStreak = computeStreakCount(habit);
  const consistencyScore = computeConsistencyScore(habit);

  // Calculate completion rate over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentHistory = habit.completionHistory.filter((c) => new Date(c.date) >= thirtyDaysAgo);
  const recentCompletions = recentHistory.filter((c) => c.completed).length;
  const recentCompletionRate =
    recentHistory.length > 0 ? Math.round((recentCompletions / recentHistory.length) * 100) : 0;

  return {
    habitId: habit.id,
    totalCompletions,
    longestStreak,
    consistencyScore,
    recentCompletionRate,
    burnoutRisk:
      habit.burnoutImpact === "high" || habit.burnoutImpact === "critical"
        ? consistencyScore < 70
          ? "high"
          : "medium"
        : "low",
  };
}

export function generateHabitRecommendation(habit: Habit): Array<{
  type:
    | "increase_frequency"
    | "decrease_difficulty"
    | "adjust_schedule"
    | "take_break"
    | "maintain";
  message: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    type:
      | "increase_frequency"
      | "decrease_difficulty"
      | "adjust_schedule"
      | "take_break"
      | "maintain";
    message: string;
    priority: "high" | "medium" | "low";
  }> = [];
  const analytics = computeHabitAnalytics(habit);

  // High consistency and streak - suggest increasing challenge
  if (analytics.consistencyScore >= 85 && habit.streakCount >= 7) {
    if (habit.frequency === "weekly" && habit.cognitiveDifficulty !== "strenuous") {
      recommendations.push({
        type: "increase_frequency",
        message: "Consider making this a daily habit - your consistency suggests you're ready!",
        priority: "medium",
      });
    }
    if (habit.cognitiveDifficulty === "easy") {
      recommendations.push({
        type: "adjust_schedule",
        message: "Try increasing the difficulty slightly to accelerate your growth.",
        priority: "low",
      });
    }
  }

  // Low consistency or high burnout risk
  if (analytics.consistencyScore < 70 || analytics.burnoutRisk === "high") {
    if (habit.frequency === "daily") {
      recommendations.push({
        type: "decrease_difficulty",
        message: "Consider reducing to weekly frequency to prevent burnout.",
        priority: "high",
      });
    }
    if (habit.burnoutImpact === "high" || habit.burnoutImpact === "critical") {
      recommendations.push({
        type: "take_break",
        message:
          "High burnout impact detected. Consider taking a short break or reducing intensity.",
        priority: "high",
      });
    }
  }

  // Schedule optimization
  if (!habit.preferredWindow && analytics.consistencyScore < 80) {
    recommendations.push({
      type: "adjust_schedule",
      message: "Set a specific time window for this habit to improve consistency.",
      priority: "medium",
    });
  }

  // Default maintenance recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      type: "maintain",
      message: "Keep up the great work! Your habit is performing well.",
      priority: "low",
    });
  }

  return recommendations;
}

export function exportHabitData(): string {
  return JSON.stringify(
    {
      version: HABIT_STORAGE_VERSION,
      persistedAt: new Date().toISOString(),
      habits: loadHabits(),
    },
    null,
    2,
  );
}

export function importHabitData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as HabitStorageSchema;
    if (!data.habits) return false;
    saveHabits(data.habits);
    return true;
  } catch {
    return false;
  }
}
