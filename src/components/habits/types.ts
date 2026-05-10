export type HabitCategory =
  | "productivity"
  | "wellness"
  | "learning"
  | "creative"
  | "mindfulness"
  | "movement"
  | "social"
  | "rest";

export type HabitFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type HabitDifficulty = "easy" | "moderate" | "challenging" | "strenuous";
export type HabitBurnoutImpact = "low" | "moderate" | "high" | "critical";

export type ScheduleWindow = "morning" | "midday" | "afternoon" | "evening" | "night";

export type HabitStatus = "active" | "paused" | "completed" | "archived";

export type HabitCompletionRecord = {
  date: string; // ISO date
  completed: boolean;
};

export type Habit = {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  streakCount: number;
  consistencyScore: number; // 0 to 100
  cognitiveDifficulty: HabitDifficulty;
  burnoutImpact: HabitBurnoutImpact;
  preferredWindow: ScheduleWindow;
  startDate: string; // ISO date
  lastCompletedAt?: string; // ISO timestamp
  completionHistory: HabitCompletionRecord[];
  status: HabitStatus;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;

  adaptiveRecommendation?: {
    suggestedFrequency: HabitFrequency;
    suggestedWindow: ScheduleWindow;
    difficultyAdjustment: HabitDifficulty;
    confidence: number; // 0 to 1
    rationale: string;
  };

  predictiveAdherence?: {
    score: number; // 0 to 1
    riskLevel: "low" | "moderate" | "high";
    recommendedBufferDays: number;
  };
};

export type HabitSearchFilter = {
  text?: string;
  categories?: HabitCategory[];
  frequencies?: HabitFrequency[];
  windows?: ScheduleWindow[];
  difficulty?: HabitDifficulty[];
  burnoutImpact?: HabitBurnoutImpact[];
  status?: HabitStatus[];
};

export type HabitAnalytics = {
  habitId: string;
  totalCompletions: number;
  longestStreak: number;
  consistencyScore: number;
  recentCompletionRate: number;
  burnoutRisk: "low" | "medium" | "high";
};

export const HABIT_CATEGORIES: Record<
  HabitCategory,
  { label: string; color: string; emoji: string }
> = {
  productivity: { label: "Productivity", color: "bg-sky-100 text-sky-700", emoji: "💼" },
  wellness: { label: "Wellness", color: "bg-emerald-100 text-emerald-700", emoji: "🌱" },
  learning: { label: "Learning", color: "bg-violet-100 text-violet-700", emoji: "📚" },
  creative: { label: "Creative", color: "bg-pink-100 text-pink-700", emoji: "🎨" },
  mindfulness: { label: "Mindfulness", color: "bg-cyan-100 text-cyan-700", emoji: "🧘" },
  movement: { label: "Movement", color: "bg-orange-100 text-orange-700", emoji: "🏃" },
  social: { label: "Social", color: "bg-amber-100 text-amber-700", emoji: "👥" },
  rest: { label: "Rest", color: "bg-neutral-100 text-neutral-700", emoji: "😴" },
};

export const HABIT_FREQUENCIES: HabitFrequency[] = ["daily", "weekly", "biweekly", "monthly"];

export const HABIT_DIFFICULTY_ORDER: HabitDifficulty[] = [
  "easy",
  "moderate",
  "challenging",
  "strenuous",
];

export const HABIT_BURNOUT_ORDER: HabitBurnoutImpact[] = ["low", "moderate", "high", "critical"];

export const HABIT_WINDOWS: ScheduleWindow[] = [
  "morning",
  "midday",
  "afternoon",
  "evening",
  "night",
];

export const HABIT_DIFFICULTY_SCORE: Record<HabitDifficulty, number> = {
  easy: 25,
  moderate: 50,
  challenging: 75,
  strenuous: 95,
};

export const HABIT_BURNOUT_SCORE: Record<HabitBurnoutImpact, number> = {
  low: 10,
  moderate: 40,
  high: 70,
  critical: 95,
};

export const HABIT_FREQUENCY_VALUE: Record<HabitFrequency, number> = {
  daily: 7,
  weekly: 4,
  biweekly: 2,
  monthly: 1,
};
