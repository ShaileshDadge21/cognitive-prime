import type { Habit, HabitCompletionRecord } from "@/components/habits/types";
import { computeConsistencyScore, computeStreakCount } from "@/components/habits/habit-storage";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Tables } from "@/types/database";

type HabitRow = Tables<"habits">;
type HabitCompletionRow = Tables<"habit_completions">;

function toHabit(row: HabitRow, completions: HabitCompletionRow[] = []): Habit {
  const completionHistory: HabitCompletionRecord[] = completions
    .filter((completion) => completion.habit_id === row.id)
    .map((completion) => ({
      date: completion.completion_date,
      completed: completion.completed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    id: row.id,
    title: row.title,
    category: row.category as Habit["category"],
    frequency: row.frequency as Habit["frequency"],
    streakCount: row.streak_count,
    consistencyScore: row.consistency_score,
    cognitiveDifficulty: row.cognitive_difficulty as Habit["cognitiveDifficulty"],
    burnoutImpact: row.burnout_impact as Habit["burnoutImpact"],
    preferredWindow: row.preferred_window as Habit["preferredWindow"],
    startDate: row.start_date,
    lastCompletedAt: row.last_completed_at ?? undefined,
    completionHistory,
    status: row.status as Habit["status"],
    notes: row.notes ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    adaptiveRecommendation: row.adaptive_recommendation as Habit["adaptiveRecommendation"],
    predictiveAdherence: row.predictive_adherence as Habit["predictiveAdherence"],
  };
}

function toHabitPayload(userId: string, habit: Habit) {
  return {
    id: habit.id,
    user_id: userId,
    title: habit.title,
    category: habit.category,
    frequency: habit.frequency,
    streak_count: habit.streakCount,
    consistency_score: habit.consistencyScore,
    cognitive_difficulty: habit.cognitiveDifficulty,
    burnout_impact: habit.burnoutImpact,
    preferred_window: habit.preferredWindow,
    start_date: habit.startDate,
    last_completed_at: habit.lastCompletedAt ?? null,
    status: habit.status,
    notes: habit.notes ?? null,
    tags: habit.tags,
    adaptive_recommendation: habit.adaptiveRecommendation ?? null,
    predictive_adherence: habit.predictiveAdherence ?? null,
  };
}

export const habitService = {
  async list() {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const [{ data: habits, error: habitsError }, { data: completions, error: completionsError }] =
      await Promise.all([
        supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
        supabase
          .from("habit_completions")
          .select("*")
          .eq("user_id", userId)
          .order("completion_date"),
      ]);

    if (habitsError) throw habitsError;
    if (completionsError) throw completionsError;

    return (habits ?? []).map((habit) => toHabit(habit, completions ?? []));
  },

  async listRecent(days = 30) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [{ data: habits, error: habitsError }, { data: completions, error: completionsError }] =
      await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId)
          .gte("updated_at", startDate.toISOString())
          .order("created_at"),
        supabase
          .from("habit_completions")
          .select("*")
          .eq("user_id", userId)
          .gte("completion_date", startDate.toISOString().split("T")[0])
          .order("completion_date"),
      ]);

    if (habitsError) throw habitsError;
    if (completionsError) throw completionsError;

    return (habits ?? []).map((habit) => toHabit(habit, completions ?? []));
  },

  async upsert(habit: Habit) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("habits")
      .upsert(toHabitPayload(userId, habit))
      .select("*")
      .single();

    if (error) throw error;

    return toHabit(
      data,
      habit.completionHistory.map((completion) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        habit_id: habit.id,
        completion_date: completion.date,
        completed: completion.completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    );
  },

  async remove(habitId: string) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("user_id", userId)
      .eq("id", habitId);

    if (error) throw error;
  },

  async recordCompletion(habit: Habit, date: string, completed: boolean) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const completionHistory = [...habit.completionHistory];
    const existing = completionHistory.findIndex((record) => record.date === date);

    if (existing >= 0) {
      completionHistory[existing] = { date, completed };
    } else {
      completionHistory.push({ date, completed });
    }

    const updatedHabit: Habit = {
      ...habit,
      completionHistory: completionHistory.sort((a, b) => a.date.localeCompare(b.date)),
      lastCompletedAt: completed ? new Date().toISOString() : habit.lastCompletedAt,
      updatedAt: new Date().toISOString(),
    };
    updatedHabit.streakCount = computeStreakCount(updatedHabit);
    updatedHabit.consistencyScore = computeConsistencyScore(updatedHabit);

    const { error: completionError } = await supabase.from("habit_completions").upsert(
      {
        user_id: userId,
        habit_id: habit.id,
        completion_date: date,
        completed,
      },
      { onConflict: "habit_id,completion_date" },
    );

    if (completionError) throw completionError;

    await habitService.upsert(updatedHabit);
    return updatedHabit;
  },
};
