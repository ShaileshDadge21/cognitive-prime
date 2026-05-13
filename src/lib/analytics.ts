import type { PlannerTask, PlannerMetrics } from "@/components/planner/types";
import {
  buildRecommendations,
  computeMetrics,
  createBlockFromTask,
  hydratePlannerTasks,
} from "@/components/planner/planner-utils";
import { computeHabitAnalytics } from "@/components/habits/habit-storage";
import type { Habit } from "@/components/habits/types";
import type { JournalEntry } from "@/components/journal/types";
import type { Tables } from "@/types/database";

export type HabitPerformanceSummary = {
  totalHabits: number;
  activeHabits: number;
  averageConsistency: number;
  totalCompletions: number;
  longestStreak: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
};

export type PlannerAnalyticsSummary = {
  hydratedTasks: PlannerTask[];
  blocks: ReturnType<typeof createBlockFromTask>[];
  metrics: PlannerMetrics;
  recommendations: ReturnType<typeof buildRecommendations>;
};

export type MoodTrend = {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  focus: number;
};

export type ProductivityScore = {
  score: number; // 0-100
  taskCompletion: number;
  focusQuality: number;
  deepWorkHours: number;
  efficiency: number;
};

export type FatigueMetrics = {
  currentLevel: number; // 0-100
  trend: "increasing" | "stable" | "decreasing";
  accumulation: number; // days of continuous high fatigue
  peakTime: string; // Hour of day with highest fatigue
};

export type BurnoutRiskAssessment = {
  risk: "low" | "moderate" | "high" | "critical";
  score: number; // 0-100
  factors: string[];
  recommendations: string[];
};

export type CognitiveAnalytics = {
  productivityScore: ProductivityScore;
  fatigueMetrics: FatigueMetrics;
  burnoutRisk: BurnoutRiskAssessment;
  moodTrend: MoodTrend[];
  focusTrend: number[]; // Last 7 days
  deepWorkCapacity: number; // Hours per week
  habitConsistency: number; // Percentage
};

/**
 * Compute productivity score from planner tasks
 */
export function computeProductivityScore(tasks: PlannerTask[]): ProductivityScore {
  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length || 1;
  const taskCompletion = Math.round((completed / total) * 100);

  const deepWorkTasks = tasks.filter((t) => t.deepWorkIntensity === "high");
  const deepWorkHours = deepWorkTasks.reduce((sum, t) => sum + t.durationMin / 60, 0);

  const avgFocusScore = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + (t.focusScore ?? 50), 0) / tasks.length)
    : 50;

  const efficiency = Math.min(100, taskCompletion + avgFocusScore) / 2;

  return {
    score: Math.round((taskCompletion + efficiency) / 2),
    taskCompletion,
    focusQuality: avgFocusScore,
    deepWorkHours: Math.round(deepWorkHours * 10) / 10,
    efficiency: Math.round(efficiency),
  };
}

/**
 * Compute fatigue metrics from mood logs
 */
export function computeFatigueMetrics(moodLogs: Tables<"mood_logs">[]): FatigueMetrics {
  if (moodLogs.length === 0) {
    return {
      currentLevel: 50,
      trend: "stable",
      accumulation: 0,
      peakTime: "14:00",
    };
  }

  // Sort by logged_at descending
  const sorted = [...moodLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );

  // Current fatigue (inverse of energy)
  const currentLog = sorted[0];
  const currentLevel = currentLog.energy_score ? 100 - currentLog.energy_score : 50;

  // Trend analysis (last 3 vs 3-6 logs)
  const recent = sorted.slice(0, 3);
  const older = sorted.slice(3, 6);

  const recentAvgFatigue =
    recent.reduce((sum, log) => sum + (log.energy_score ? 100 - log.energy_score : 50), 0) /
    Math.max(recent.length, 1);
  const olderAvgFatigue =
    older.reduce((sum, log) => sum + (log.energy_score ? 100 - log.energy_score : 50), 0) /
    Math.max(older.length, 1);

  const trend =
    recentAvgFatigue > olderAvgFatigue + 5
      ? "increasing"
      : recentAvgFatigue < olderAvgFatigue - 5
        ? "decreasing"
        : "stable";

  // Peak time (hour with most logs)
  const timeGroups: Record<string, number> = {};
  sorted.forEach((log) => {
    const hour = new Date(log.logged_at).getHours().toString().padStart(2, "0");
    timeGroups[hour] = (timeGroups[hour] ?? 0) + 1;
  });
  const peakTime = Object.entries(timeGroups).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "14";

  // Accumulation (days of continuous high fatigue)
  let accumulation = 0;
  for (const log of sorted) {
    if ((log.energy_score ?? 50) < 40) {
      accumulation++;
    } else {
      break;
    }
  }

  return {
    currentLevel: Math.round(currentLevel),
    trend,
    accumulation,
    peakTime: `${peakTime}:00`,
  };
}

/**
 * Assess burnout risk from multiple data sources
 */
export function assessBurnoutRisk(
  habits: Habit[],
  tasks: PlannerTask[],
  moodLogs: Tables<"mood_logs">[],
  journalEntries: JournalEntry[],
): BurnoutRiskAssessment {
  const factors: string[] = [];
  let riskScore = 0;

  // Factor 1: High task cognitive load
  const avgCognitiveLoad =
    tasks.length > 0
      ? Math.round(tasks.reduce((sum, t) => sum + (t.cognitiveLoad ?? 50), 0) / tasks.length)
      : 0;
  if (avgCognitiveLoad > 70) {
    factors.push("High cognitive load in tasks");
    riskScore += 20;
  }

  // Factor 2: Low habit consistency
  const avgConsistency =
    habits.length > 0
      ? Math.round(habits.reduce((sum, h) => sum + h.consistencyScore, 0) / habits.length)
      : 0;
  if (avgConsistency < 40) {
    factors.push("Low habit consistency");
    riskScore += 20;
  }

  // Factor 3: Persistent fatigue
  const fatigueMetrics = computeFatigueMetrics(moodLogs);
  if (fatigueMetrics.currentLevel > 70 && fatigueMetrics.accumulation > 3) {
    factors.push("Persistent fatigue accumulation");
    riskScore += 25;
  }

  // Factor 4: Negative mood trends
  const recentMood = moodLogs.slice(0, 5);
  const avgMoodScore =
    recentMood.length > 0
      ? Math.round(
          recentMood.reduce((sum, log) => sum + (log.mood_score ?? 50), 0) / recentMood.length,
        )
      : 50;
  if (avgMoodScore < 40) {
    factors.push("Low mood trends");
    riskScore += 15;
  }

  // Factor 5: High stress in journal
  const stressEntries = journalEntries.filter(
    (e) => e.stressLevel === "high" || e.stressLevel === "critical",
  );
  if (stressEntries.length > journalEntries.length * 0.3) {
    factors.push("Frequent high-stress journal entries");
    riskScore += 20;
  }

  // Determine risk level
  const risk: BurnoutRiskAssessment["risk"] =
    riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 40 ? "moderate" : "low";

  // Recommendations
  const recommendations: string[] = [];
  if (avgCognitiveLoad > 70) {
    recommendations.push("Reduce task complexity or delegate non-critical work");
  }
  if (avgConsistency < 40) {
    recommendations.push("Focus on building one keystone habit");
  }
  if (fatigueMetrics.currentLevel > 70) {
    recommendations.push("Schedule more recovery time and breaks");
  }
  if (avgMoodScore < 40) {
    recommendations.push("Consider stress management techniques or professional support");
  }

  return {
    risk,
    score: Math.min(100, riskScore),
    factors,
    recommendations,
  };
}

/**
 * Analyze mood trend over time period
 */
export function analyzeMoodTrend(moodLogs: Tables<"mood_logs">[]): MoodTrend[] {
  return moodLogs
    .slice()
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map((log) => ({
      date: new Date(log.logged_at).toLocaleDateString(),
      mood: log.mood_score ?? 50,
      energy: log.energy_score ?? 50,
      stress: 100 - (log.energy_score ?? 50), // Inverse relationship
      focus: log.focus_score ?? 50,
    }));
}

/**
 * Compute focus trend (last 7 days)
 */
export function computeFocusTrend(moodLogs: Tables<"mood_logs">[]): number[] {
  const today = new Date();
  const trend: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayLogs = moodLogs.filter((log) => log.logged_at.startsWith(dateStr));

    const avgFocus =
      dayLogs.length > 0
        ? Math.round(
            dayLogs.reduce((sum, log) => sum + (log.focus_score ?? 50), 0) / dayLogs.length,
          )
        : 50;

    trend.push(avgFocus);
  }

  return trend;
}

/**
 * Estimate deep work capacity in hours per week
 */
export function computeDeepWorkCapacity(
  tasks: PlannerTask[],
  habits: Habit[],
  moodLogs: Tables<"mood_logs">[],
): number {
  // Base capacity from high-focus tasks
  const highFocusTasks = tasks.filter((t) => t.deepWorkIntensity === "high");
  const baseCapacity = highFocusTasks.reduce((sum, t) => sum + t.durationMin / 60, 0);

  // Adjust for fatigue
  const fatigueMetrics = computeFatigueMetrics(moodLogs);
  const fatigueMultiplier = 1 - fatigueMetrics.currentLevel / 200; // 50% capacity at 100 fatigue

  // Adjust for habit discipline
  const disciplineScore = habits.filter((h) => h.status === "active").length > 0 ? 1.1 : 0.9;

  return Math.round(baseCapacity * fatigueMultiplier * disciplineScore * 10) / 10;
}

/**
 * Compute overall habit consistency percentage
 */
export function computeHabitConsistency(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  const activeHabits = habits.filter((h) => h.status === "active");
  if (activeHabits.length === 0) return 0;

  const avgConsistency = Math.round(
    activeHabits.reduce((sum, h) => sum + h.consistencyScore, 0) / activeHabits.length,
  );

  return avgConsistency;
}

export function summarizeHabitPerformance(habits: Habit[]): HabitPerformanceSummary {
  const totalHabits = habits.length;
  const activeHabits = habits.filter((habit) => habit.status === "active").length;
  const analytics = habits.map((habit) => computeHabitAnalytics(habit));
  const totalCompletions = analytics.reduce((sum, item) => sum + item.totalCompletions, 0);
  const averageConsistency = totalHabits
    ? Math.round(analytics.reduce((sum, item) => sum + item.consistencyScore, 0) / totalHabits)
    : 0;
  const longestStreak = analytics.reduce((max, item) => Math.max(max, item.longestStreak), 0);
  const riskDistribution = analytics.reduce(
    (state, item) => {
      state[item.burnoutRisk] += 1;
      return state;
    },
    { low: 0, medium: 0, high: 0 },
  );

  return {
    totalHabits,
    activeHabits,
    averageConsistency,
    totalCompletions,
    longestStreak,
    riskDistribution,
  };
}

export function derivePlannerAnalytics(
  tasks: PlannerTask[],
  fatigueSignal = 48,
): PlannerAnalyticsSummary {
  const hydratedTasks = hydratePlannerTasks(tasks);
  const blocks = hydratedTasks.map((task, index) =>
    createBlockFromTask(task, task.scheduledHour ?? 9 + index),
  );
  const metrics = computeMetrics(hydratedTasks, blocks, fatigueSignal);
  const recommendations = buildRecommendations(metrics, hydratedTasks);

  return {
    hydratedTasks,
    blocks,
    metrics,
    recommendations,
  };
}
