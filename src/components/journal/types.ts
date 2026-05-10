// Mood types with emotional intensity
export type MoodType =
  | "elated"
  | "optimistic"
  | "calm"
  | "neutral"
  | "anxious"
  | "frustrated"
  | "overwhelmed"
  | "exhausted";

export type EnergyLevel = "very-low" | "low" | "moderate" | "high" | "very-high";
export type StressLevel = "minimal" | "low" | "moderate" | "high" | "critical";
export type FocusQuality = "poor" | "fair" | "good" | "excellent" | "exceptional";

export type JournalCategory =
  | "personal"
  | "work"
  | "health"
  | "learning"
  | "relationships"
  | "creative"
  | "reflection"
  | "breakthrough";

// Core Journal Entry type
export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
  focusQuality: FocusQuality;
  tags: string[];
  categories: JournalCategory[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // AI-ready fields for future analysis
  sentiment?: {
    score: number; // -1 to 1
    label: "negative" | "neutral" | "positive";
  };

  // Burnout prediction (AI feature)
  burnoutIndicators?: {
    score: number; // 0 to 1
    risk: "low" | "moderate" | "high" | "critical";
    factors: string[];
  };

  // Cognitive patterns (AI feature)
  cognitivePatterns?: {
    dominantTheme: string;
    emotionalTone: string;
    reflectionDepth: number; // 0 to 1
  };

  // Emotional arc (AI feature)
  emotionalArc?: {
    startMood: MoodType;
    endMood: MoodType;
    trajectory: "declining" | "stable" | "improving";
  };
};

// Weekly Journal Summary (AI-generated)
export type JournalWeeklySummary = {
  week: string; // ISO week format YYYY-Www
  entries: JournalEntry[];

  // Computed summaries
  averageMood: string;
  averageEnergy: number;
  averageStress: number;
  averageFocus: number;

  // Trends
  moodTrend: "declining" | "stable" | "improving";
  energyTrend: "declining" | "stable" | "improving";
  stressTrend: "declining" | "stable" | "improving";

  // AI insights
  topThemes: string[];
  burnoutRisk: "low" | "moderate" | "high";
  recommendations: string[];
};

// Emotions over time for graphs
export type EmotionalDataPoint = {
  date: string; // ISO date
  mood: number; // 0 (worst) to 100 (best)
  energy: number; // 0 to 100
  stress: number; // 0 to 100
  focus: number; // 0 to 100
  entryId: string;
};

// Search/filter options
export type JournalSearchQuery = {
  text?: string;
  moods?: MoodType[];
  categories?: JournalCategory[];
  tags?: string[];
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
  minStressLevel?: StressLevel;
  burnoutRiskFilter?: "low" | "moderate" | "high" | "critical";
};

// Storage schema version
export type JournalStorageSchema = {
  version: number;
  persistedAt: string; // ISO timestamp
  entries: JournalEntry[];
  lastSyncedAt?: string;
};

// Mood configuration with colors and emojis
export type MoodConfig = {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  description: string;
};

export const MOOD_CONFIG: Record<MoodType, MoodConfig> = {
  elated: {
    type: "elated",
    label: "Elated",
    emoji: "🤩",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    hoverColor: "hover:bg-yellow-100",
    description: "Feeling joyful and inspired",
  },
  optimistic: {
    type: "optimistic",
    label: "Optimistic",
    emoji: "😊",
    color: "text-green-500",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
    description: "Positive and hopeful",
  },
  calm: {
    type: "calm",
    label: "Calm",
    emoji: "😌",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    description: "Peaceful and grounded",
  },
  neutral: {
    type: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    hoverColor: "hover:bg-gray-100",
    description: "Neither positive nor negative",
  },
  anxious: {
    type: "anxious",
    label: "Anxious",
    emoji: "😰",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
    description: "Worried or uneasy",
  },
  frustrated: {
    type: "frustrated",
    label: "Frustrated",
    emoji: "😤",
    color: "text-red-500",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
    description: "Annoyed or irritated",
  },
  overwhelmed: {
    type: "overwhelmed",
    label: "Overwhelmed",
    emoji: "😵",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    description: "Too much to handle",
  },
  exhausted: {
    type: "exhausted",
    label: "Exhausted",
    emoji: "😴",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
    description: "Tired and drained",
  },
};

// Numeric mappings for analysis
export const ENERGY_LEVEL_MAP: Record<EnergyLevel, number> = {
  "very-low": 10,
  low: 30,
  moderate: 50,
  high: 70,
  "very-high": 90,
};

export const STRESS_LEVEL_MAP: Record<StressLevel, number> = {
  minimal: 10,
  low: 30,
  moderate: 50,
  high: 70,
  critical: 90,
};

export const FOCUS_QUALITY_MAP: Record<FocusQuality, number> = {
  poor: 10,
  fair: 30,
  good: 60,
  excellent: 80,
  exceptional: 100,
};

export const MOOD_POSITIVITY_SCORE: Record<MoodType, number> = {
  elated: 95,
  optimistic: 75,
  calm: 65,
  neutral: 50,
  anxious: 35,
  frustrated: 25,
  overwhelmed: 15,
  exhausted: 20,
};
