import type {
  PlannerEnergy,
  PlannerMetrics,
  PlannerPriority,
  PlannerTask,
  TimelineBlock,
} from "@/components/planner/types";

const PRIORITY_SCORE: Record<PlannerPriority, number> = {
  high: 1,
  med: 0.7,
  low: 0.4,
};

const ENERGY_SCORE: Record<PlannerEnergy, number> = {
  high: 90,
  med: 65,
  low: 40,
};

const COLOR_BY_ENERGY: Record<PlannerEnergy, "coral" | "electric" | "violet"> = {
  high: "coral",
  med: "electric",
  low: "violet",
};

export const TIMELINE_START = 7;
export const TIMELINE_END = 19;

export const timelineHours = Array.from(
  { length: TIMELINE_END - TIMELINE_START },
  (_, index) => TIMELINE_START + index,
);

export const peakHours = [9, 10, 11];

export const parseDurationMinutes = (value: string) => {
  const minutes = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(minutes) ? minutes : 30;
};

export function toPlannerTasks(
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    energy: string;
    duration: string;
    done: boolean;
  }>,
): PlannerTask[] {
  return tasks.map((task) => {
    const energy = (
      task.energy === "high" || task.energy === "med" || task.energy === "low" ? task.energy : "med"
    ) as PlannerEnergy;
    const priority = (
      task.priority === "high" || task.priority === "med" || task.priority === "low"
        ? task.priority
        : "med"
    ) as PlannerPriority;

    return {
      ...task,
      energy,
      priority,
      durationMin: parseDurationMinutes(task.duration),
      energyLoad: ENERGY_SCORE[energy],
    };
  });
}

export function createBlockFromTask(task: PlannerTask, hour: number): TimelineBlock {
  return {
    id: `block-${task.id}`,
    taskId: task.id,
    title: task.title,
    hour,
    span: Math.max(1, Math.min(3, Math.round(task.durationMin / 30))),
    energyLoad: task.energyLoad,
    color: COLOR_BY_ENERGY[task.energy],
  };
}

export function computeMetrics(
  tasks: PlannerTask[],
  blocks: TimelineBlock[],
  fatigueSignal: number,
): PlannerMetrics {
  if (tasks.length === 0) {
    return {
      cognitiveScore: 0,
      fatigueRisk: 0,
      completionRate: 0,
      scheduleCoverage: 0,
      peakAlignment: 0,
    };
  }

  const completedTasks = tasks.filter((task) => task.done).length;
  const scheduledTasks = tasks.filter((task) => task.scheduledHour !== undefined).length;
  const highPriority = tasks.filter((task) => task.priority === "high");
  const highPriorityDone = highPriority.filter((task) => task.done).length;
  const peakScheduled = blocks.filter((block) => peakHours.includes(block.hour)).length;

  const completionRate = Math.round((completedTasks / tasks.length) * 100);
  const scheduleCoverage = Math.round((scheduledTasks / tasks.length) * 100);
  const peakAlignment = Math.round(
    ((peakScheduled + highPriorityDone * 0.8) / Math.max(1, highPriority.length + 3)) * 100,
  );

  const weightedPriorityCompletion =
    tasks.reduce((sum, task) => sum + (task.done ? PRIORITY_SCORE[task.priority] : 0), 0) /
    tasks.length;

  const overloadPenalty = Math.max(0, blocks.filter((block) => block.energyLoad > 80).length * 3);
  const fatigueRisk = Math.min(100, Math.round(fatigueSignal * 0.65 + overloadPenalty));

  const cognitiveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        completionRate * 0.35 +
          scheduleCoverage * 0.2 +
          peakAlignment * 0.2 +
          weightedPriorityCompletion * 100 * 0.25 -
          fatigueRisk * 0.25,
      ),
    ),
  );

  return {
    cognitiveScore,
    fatigueRisk,
    completionRate,
    scheduleCoverage,
    peakAlignment,
  };
}

export function buildRecommendations(metrics: PlannerMetrics, tasks: PlannerTask[]) {
  const pendingHigh = tasks.filter((task) => task.priority === "high" && !task.done).length;

  return [
    {
      id: "energy-window",
      title: "Protect peak cognition window",
      text:
        metrics.fatigueRisk > 60
          ? "Fatigue risk is elevated. Shift one medium task out of 2-4 PM and add a recovery break."
          : "Cognitive rhythm is stable. Keep high-load work between 9-11 AM for best throughput.",
      severity: metrics.fatigueRisk > 60 ? "warning" : "good",
    },
    {
      id: "priority-flow",
      title: "Sequence high-value tasks",
      text:
        pendingHigh > 1
          ? `You still have ${pendingHigh} high-priority tasks. Schedule one in the next peak slot.`
          : "High-priority queue is healthy. Use remaining slots for low-energy execution.",
      severity: pendingHigh > 1 ? "warning" : "good",
    },
    {
      id: "momentum",
      title: "Maintain completion momentum",
      text:
        metrics.completionRate < 45
          ? "Completion rate is below target. Break one large task into two 30-minute blocks."
          : "Completion momentum is strong. Continue with short focused sprints to avoid drift.",
      severity: metrics.completionRate < 45 ? "warning" : "good",
    },
  ] as const;
}
