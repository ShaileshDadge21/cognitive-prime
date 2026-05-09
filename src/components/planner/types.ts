export type PlannerPriority = "high" | "med" | "low";
export type PlannerEnergy = "high" | "med" | "low";

export type PlannerTask = {
  id: string;
  title: string;
  priority: PlannerPriority;
  energy: PlannerEnergy;
  duration: string;
  durationMin: number;
  energyLoad: number;
  done: boolean;
  scheduledHour?: number;
};

export type TimelineBlock = {
  id: string;
  taskId: string;
  title: string;
  hour: number;
  span: number;
  energyLoad: number;
  color: "coral" | "electric" | "violet";
};

export type PlannerMetrics = {
  cognitiveScore: number;
  fatigueRisk: number;
  completionRate: number;
  scheduleCoverage: number;
  peakAlignment: number;
};
