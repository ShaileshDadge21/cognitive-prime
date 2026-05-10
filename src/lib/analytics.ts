import type { PlannerTask, PlannerMetrics } from "@/components/planner/types";
import {
  buildRecommendations,
  computeMetrics,
  createBlockFromTask,
  hydratePlannerTasks,
} from "@/components/planner/planner-utils";
import { computeHabitAnalytics } from "@/components/habits/habit-storage";
import type { Habit } from "@/components/habits/types";

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
