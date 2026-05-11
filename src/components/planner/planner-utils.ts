import type {
  PlannerCategory,
  PlannerComplexity,
  PlannerDeepWorkIntensity,
  PlannerEnergy,
  PlannerMetrics,
  PlannerPriority,
  PlannerTask,
  TimelineBlock,
} from "@/components/planner/types";
import { analyzeCognitiveImpact, normalizeScore } from "@/lib/cognitive-engine";

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

const CATEGORY_LABEL_MAP: Record<string, PlannerCategory> = {
  "deep work": "work",
  research: "research",
  learning: "learning",
  meetings: "meetings",
  fitness: "physical",
  creative: "creative",
  work: "work",
  personal: "personal",
};

const DEFAULT_COMPLEXITY: Record<PlannerCategory, PlannerComplexity> = {
  work: "complex",
  research: "complex",
  learning: "complex",
  meetings: "moderate",
  physical: "simple",
  creative: "moderate",
  personal: "simple",
};

const DEFAULT_DEEP_WORK_INTENSITY: Record<PlannerCategory, PlannerDeepWorkIntensity> = {
  work: "high",
  research: "high",
  learning: "high",
  meetings: "medium",
  physical: "low",
  creative: "medium",
  personal: "low",
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

function normalizeCategory(category?: string): PlannerCategory {
  const normalized = String(category ?? "")
    .trim()
    .toLowerCase();
  return CATEGORY_LABEL_MAP[normalized] ?? "work";
}

function normalizeComplexity(value?: string, category?: PlannerCategory): PlannerComplexity {
  if (value === "simple" || value === "moderate" || value === "complex") {
    return value;
  }

  return category ? DEFAULT_COMPLEXITY[category] : "moderate";
}

function normalizeDeepWorkIntensity(
  value?: string,
  category?: PlannerCategory,
): PlannerDeepWorkIntensity {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return category ? DEFAULT_DEEP_WORK_INTENSITY[category] : "medium";
}

function deriveScheduleSuitability(
  analysis: ReturnType<typeof analyzeCognitiveImpact>,
  scheduledHour?: number,
): number {
  const base = 90;
  const loadPenalty = analysis.cognitiveLoad * 0.15;
  const fatiguePenalty = analysis.fatigueScore * 0.12;
  const burnoutPenalty =
    analysis.burnoutRisk === "high" ? 22 : analysis.burnoutRisk === "medium" ? 12 : 0;
  const peakBonus =
    scheduledHour && [9, 10, 11].includes(scheduledHour) && analysis.focusScore > 60 ? 10 : 0;

  return normalizeScore(base - loadPenalty - fatiguePenalty - burnoutPenalty + peakBonus, 0, 100);
}

export function hydratePlannerTasks(tasks: PlannerTask[]): PlannerTask[] {
  return tasks.map(hydratePlannerTask);
}

export function hydratePlannerTask(task: PlannerTask): PlannerTask {
  const category = normalizeCategory(task.category);
  const complexity = normalizeComplexity(task.complexity, category);
  const deepWorkIntensity = normalizeDeepWorkIntensity(task.deepWorkIntensity, category);
  const durationMin = task.durationMin ?? parseDurationMinutes(task.duration);

  const cognitiveTask = {
    id: task.id,
    title: task.title,
    duration: durationMin,
    priority: task.priority,
    energy: task.energy,
    category,
    complexity,
    deepWorkIntensity,
    scheduledHour: task.scheduledHour,
  };

  const cognitiveAnalysis = analyzeCognitiveImpact(cognitiveTask);

  return {
    ...task,
    category,
    complexity,
    deepWorkIntensity,
    cognitiveAnalysis,
    cognitiveLoad: cognitiveAnalysis.cognitiveLoad,
    fatigueScore: cognitiveAnalysis.fatigueScore,
    focusScore: cognitiveAnalysis.focusScore,
    burnoutRisk: cognitiveAnalysis.burnoutRisk,
    scheduleSuitability: deriveScheduleSuitability(cognitiveAnalysis, task.scheduledHour),
    recommendedTimeWindow: cognitiveAnalysis.recommendedTimeWindow,
    recommendationText: cognitiveAnalysis.recommendationText,
  };
}

export function toPlannerTasks(
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    energy: string;
    duration: string;
    done: boolean;
    category?: string;
    complexity?: string;
    deepWorkIntensity?: string;
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
    const category = normalizeCategory(task.category);
    const complexity = normalizeComplexity(task.complexity, category);
    const deepWorkIntensity = normalizeDeepWorkIntensity(task.deepWorkIntensity, category);

    return hydratePlannerTask({
      ...task,
      energy,
      priority,
      durationMin: parseDurationMinutes(task.duration),
      energyLoad: ENERGY_SCORE[energy],
      category,
      complexity,
      deepWorkIntensity,
    });
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
    cognitiveLoad: task.cognitiveLoad ?? 0,
    burnoutRisk: task.burnoutRisk ?? "low",
    focusScore: task.focusScore ?? 0,
    recommendedTimeWindow: task.recommendedTimeWindow ?? "Any available slot",
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
      averageCognitiveLoad: 0,
      averageFatigueScore: 0,
      burnoutExposure: 0,
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

  const averageCognitiveLoad = Math.round(
    tasks.reduce((sum, task) => sum + (task.cognitiveLoad ?? 0), 0) / tasks.length,
  );

  const averageFatigueScore = Math.round(
    tasks.reduce((sum, task) => sum + (task.fatigueScore ?? 0), 0) / tasks.length,
  );

  const burnoutExposure = Math.min(
    100,
    Math.round(
      tasks.reduce((sum, task) => {
        const riskValue = task.burnoutRisk === "high" ? 40 : task.burnoutRisk === "medium" ? 20 : 6;
        return sum + riskValue;
      }, 0) / tasks.length,
    ),
  );

  const overloadPenalty = Math.max(0, blocks.filter((block) => block.energyLoad > 80).length * 3);
  const fatigueRisk = Math.min(
    100,
    Math.round(fatigueSignal * 0.55 + averageFatigueScore * 0.25 + overloadPenalty * 0.2),
  );

  const cognitiveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        completionRate * 0.25 +
          scheduleCoverage * 0.15 +
          peakAlignment * 0.15 +
          averageCognitiveLoad * 0.2 +
          weightedPriorityCompletion * 100 * 0.25 -
          fatigueRisk * 0.2,
      ),
    ),
  );

  return {
    cognitiveScore,
    averageCognitiveLoad,
    averageFatigueScore,
    burnoutExposure,
    fatigueRisk,
    completionRate,
    scheduleCoverage,
    peakAlignment,
  };
}

export function buildRecommendations(metrics: PlannerMetrics, tasks: PlannerTask[]) {
  const pendingHigh = tasks.filter((task) => task.priority === "high" && !task.done).length;
  const highLoadCount = tasks.filter((task) => (task.cognitiveLoad ?? 0) >= 70).length;

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
          ? `You still have ${pendingHigh} high-priority tasks. Prioritize one during your top focus window.`
          : "High-priority queue is healthy. Use remaining slots for low-energy execution.",
      severity: pendingHigh > 1 ? "warning" : "good",
    },
    {
      id: "load-balance",
      title: "Balance cognitive load",
      text:
        highLoadCount > tasks.length * 0.3
          ? "Multiple tasks are generating high cognitive load. Spread them across separate windows."
          : "Cognitive load is distributed well. Maintain momentum with short focused bursts.",
      severity: highLoadCount > tasks.length * 0.3 ? "warning" : "good",
    },
  ] as const;
}
