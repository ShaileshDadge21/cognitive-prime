import type { PlannerTask, TimelineBlock } from "@/components/planner/types";
import { hydratePlannerTasks } from "@/components/planner/planner-utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Tables } from "@/types/database";

type PlannerTaskRow = Tables<"planner_tasks">;
type ScheduledBlockRow = Tables<"scheduled_blocks">;

function toTask(row: PlannerTaskRow): PlannerTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority as PlannerTask["priority"],
    energy: row.energy as PlannerTask["energy"],
    category: (row.category ?? undefined) as PlannerTask["category"],
    duration: row.duration,
    durationMin: row.duration_min,
    energyLoad: row.energy_load,
    complexity: (row.complexity ?? undefined) as PlannerTask["complexity"],
    deepWorkIntensity: (row.deep_work_intensity ?? undefined) as PlannerTask["deepWorkIntensity"],
    done: row.done,
    scheduledHour: row.scheduled_hour ?? undefined,
    cognitiveAnalysis: row.cognitive_analysis as PlannerTask["cognitiveAnalysis"],
    cognitiveLoad: row.cognitive_load ?? undefined,
    fatigueScore: row.fatigue_score ?? undefined,
    focusScore: row.focus_score ?? undefined,
    burnoutRisk: (row.burnout_risk ?? undefined) as PlannerTask["burnoutRisk"],
    scheduleSuitability: row.schedule_suitability ?? undefined,
    recommendedTimeWindow: row.recommended_time_window ?? undefined,
    recommendationText: row.recommendation_text ?? undefined,
  };
}

function toBlock(row: ScheduledBlockRow): TimelineBlock {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    hour: row.hour,
    span: row.span,
    energyLoad: row.energy_load,
    color: row.color as TimelineBlock["color"],
    cognitiveLoad: row.cognitive_load,
    burnoutRisk: row.burnout_risk as TimelineBlock["burnoutRisk"],
    focusScore: row.focus_score,
    recommendedTimeWindow: row.recommended_time_window,
  };
}

function taskPayload(userId: string, task: PlannerTask) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    priority: task.priority,
    energy: task.energy,
    category: task.category ?? null,
    duration: task.duration,
    duration_min: task.durationMin,
    energy_load: task.energyLoad,
    complexity: task.complexity ?? null,
    deep_work_intensity: task.deepWorkIntensity ?? null,
    done: task.done,
    scheduled_hour: task.scheduledHour ?? null,
    cognitive_analysis: task.cognitiveAnalysis ?? null,
    cognitive_load: task.cognitiveLoad ?? null,
    fatigue_score: task.fatigueScore ?? null,
    focus_score: task.focusScore ?? null,
    burnout_risk: task.burnoutRisk ?? null,
    schedule_suitability: task.scheduleSuitability ?? null,
    recommended_time_window: task.recommendedTimeWindow ?? null,
    recommendation_text: task.recommendationText ?? null,
  };
}

function blockPayload(userId: string, block: TimelineBlock) {
  return {
    id: block.id,
    user_id: userId,
    task_id: block.taskId,
    title: block.title,
    hour: block.hour,
    span: block.span,
    energy_load: block.energyLoad,
    color: block.color,
    cognitive_load: block.cognitiveLoad,
    burnout_risk: block.burnoutRisk,
    focus_score: block.focusScore,
    recommended_time_window: block.recommendedTimeWindow,
  };
}

export type PlannerCloudState = {
  tasks: PlannerTask[];
  blocks: TimelineBlock[];
};

export const plannerService = {
  async load(): Promise<PlannerCloudState | undefined> {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const [{ data: tasks, error: tasksError }, { data: blocks, error: blocksError }] =
      await Promise.all([
        supabase.from("planner_tasks").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("scheduled_blocks").select("*").eq("user_id", userId).order("hour"),
      ]);

    if (tasksError) throw tasksError;
    if (blocksError) throw blocksError;

    if (!tasks?.length && !blocks?.length) {
      return undefined;
    }

    return {
      tasks: hydratePlannerTasks(tasks?.map(toTask) ?? []),
      blocks: blocks?.map(toBlock) ?? [],
    };
  },

  async save(state: PlannerCloudState) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const taskRows = state.tasks.map((task) => taskPayload(userId, task));
    const blockRows = state.blocks.map((block) => blockPayload(userId, block));

    const [{ error: tasksError }, { error: blocksDeleteError }] = await Promise.all([
      taskRows.length
        ? supabase.from("planner_tasks").upsert(taskRows)
        : Promise.resolve({ error: null }),
      supabase.from("scheduled_blocks").delete().eq("user_id", userId),
    ]);

    if (tasksError) throw tasksError;
    if (blocksDeleteError) throw blocksDeleteError;

    if (blockRows.length) {
      const { error } = await supabase.from("scheduled_blocks").insert(blockRows);
      if (error) throw error;
    }
  },

  async clear() {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const [{ error: blocksError }, { error: tasksError }] = await Promise.all([
      supabase.from("scheduled_blocks").delete().eq("user_id", userId),
      supabase.from("planner_tasks").delete().eq("user_id", userId),
    ]);

    if (blocksError) throw blocksError;
    if (tasksError) throw tasksError;
  },
};
