export type PlannerPriority = "high" | "med" | "low";
export type PlannerEnergy = "high" | "med" | "low";
export type PlannerCategory =
  | "work"
  | "personal"
  | "learning"
  | "creative"
  | "physical"
  | "meetings"
  | "research";
export type PlannerComplexity = "simple" | "moderate" | "complex";
export type PlannerDeepWorkIntensity = "low" | "medium" | "high";

export type PlannerTask = {
  id: string;
  title: string;
  priority: PlannerPriority;
  energy: PlannerEnergy;
  category?: PlannerCategory;
  duration: string;
  durationMin: number;
  energyLoad: number;
  complexity?: PlannerComplexity;
  deepWorkIntensity?: PlannerDeepWorkIntensity;
  done: boolean;
  scheduledHour?: number;
  cognitiveAnalysis?: {
    cognitiveLoad: number;
    fatigueScore: number;
    focusScore: number;
    burnoutRisk: "low" | "medium" | "high";
    recommendedTimeWindow: string;
    recommendationText: string;
  };
  cognitiveLoad?: number;
  fatigueScore?: number;
  focusScore?: number;
  burnoutRisk?: "low" | "medium" | "high";
  scheduleSuitability?: number;
  recommendedTimeWindow?: string;
  recommendationText?: string;
};

export type TimelineBlock = {
  id: string;
  taskId: string;
  title: string;
  hour: number;
  span: number;
  energyLoad: number;
  color: "coral" | "electric" | "violet";
  cognitiveLoad: number;
  burnoutRisk: "low" | "medium" | "high";
  focusScore: number;
  recommendedTimeWindow: string;
};

export type PlannerMetrics = {
  cognitiveScore: number;
  averageCognitiveLoad: number;
  averageFatigueScore: number;
  burnoutExposure: number;
  fatigueRisk: number;
  completionRate: number;
  scheduleCoverage: number;
  peakAlignment: number;
};
