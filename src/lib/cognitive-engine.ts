/**
 * Cognitive Analysis Engine for NeuroFlow AI
 *
 * This engine analyzes tasks for cognitive impact, providing scores and recommendations
 * to optimize productivity based on cognitive science principles.
 *
 * Architecture: Pure functions, strongly typed, extensible scoring system.
 * Designed for future AI integration (OpenAI API), real-time telemetry, and adaptive scheduling.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a task with cognitive attributes for analysis
 */
export type CognitiveTask = {
  id: string;
  title: string;
  duration: number; // in minutes
  priority: "high" | "med" | "low";
  energy: "high" | "med" | "low"; // required energy level
  category: "work" | "personal" | "learning" | "creative" | "physical" | "meetings" | "research";
  complexity: "simple" | "moderate" | "complex";
  deepWorkIntensity: "low" | "medium" | "high"; // deep work requirement
  scheduledHour?: number; // optional scheduled hour (0-23)
};

/**
 * Analysis result containing cognitive scores and metrics
 */
export type BurnoutRisk = "low" | "medium" | "high";

export type CognitiveAnalysis = {
  cognitiveLoad: number; // 0-100: overall cognitive demand
  fatigueScore: number; // 0-100: fatigue impact
  focusScore: number; // 0-100: focus requirement
  burnoutRisk: BurnoutRisk;
  recommendedTimeWindow: string; // e.g., "9-11 AM" or "Unscheduled"
  recommendationText: string; // human-readable recommendation
};

export type CognitiveRecommendation = {
  timeWindow: string;
  reasoning: string;
  alternatives: string[];
};

// ============================================================================
// SCORING CONSTANTS
// ============================================================================

/**
 * Scoring weights and thresholds for cognitive analysis
 * Extensible: can be adjusted based on user data or AI learning
 */
const SCORING_WEIGHTS = {
  duration: {
    base: 10, // base load per hour
  },
  priority: {
    high: 1.5,
    med: 1.0,
    low: 0.7,
  },
  energy: {
    high: 1.3,
    med: 1.0,
    low: 0.8,
  },
  category: {
    work: 1.2,
    personal: 0.8,
    learning: 1.1,
    creative: 1.0,
    physical: 0.6,
    meetings: 0.9,
    research: 1.15,
  },
  complexity: {
    simple: 0.7,
    moderate: 1.0,
    complex: 1.4,
  },
  deepWorkIntensity: {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  },
} as const;

const THRESHOLDS = {
  burnoutRisk: {
    low: 40,
    medium: 70,
  },
  fatigueRecovery: {
    high: 80,
    medium: 60,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalizes a score to 0-100 range
 * @param score - Raw score value
 * @param min - Minimum possible value
 * @param max - Maximum possible value
 * @returns Normalized score between 0-100
 */
export function normalizeScore(score: number, min: number, max: number): number {
  if (max <= min) {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  const normalized = ((score - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

/**
 * Calculates fatigue impact based on task attributes
 * Fatigue considers energy requirements, duration, and recovery needs
 * @param task - The cognitive task to analyze
 * @returns Fatigue score (0-100)
 */
export function calculateFatigue(task: CognitiveTask): number {
  const energyMultiplier = SCORING_WEIGHTS.energy[task.energy];
  const durationHours = task.duration / 60;
  const complexityMultiplier = SCORING_WEIGHTS.complexity[task.complexity];

  // Base fatigue from duration and energy
  const baseFatigue = durationHours * 20 * energyMultiplier;

  // Additional fatigue from complexity and deep work
  const complexityFatigue = complexityMultiplier * SCORING_WEIGHTS.deepWorkIntensity[task.deepWorkIntensity] * 15;

  const totalFatigue = baseFatigue + complexityFatigue;

  return normalizeScore(totalFatigue, 0, 150); // Max possible ~150
}

/**
 * Calculates focus requirement score
 * Focus considers priority, complexity, and deep work needs
 * @param task - The cognitive task to analyze
 * @returns Focus score (0-100)
 */
export function calculateFocusScore(task: CognitiveTask): number {
  const priorityMultiplier = SCORING_WEIGHTS.priority[task.priority];
  const complexityMultiplier = SCORING_WEIGHTS.complexity[task.complexity];
  const deepWorkMultiplier = SCORING_WEIGHTS.deepWorkIntensity[task.deepWorkIntensity];
  const categoryMultiplier = SCORING_WEIGHTS.category[task.category];

  // Focus score combines multiple cognitive demands
  const focusDemand = priorityMultiplier * complexityMultiplier * deepWorkMultiplier * categoryMultiplier * 25;

  return normalizeScore(focusDemand, 0, 100); // Scale to 0-100
}

/**
 * Generates a recommendation based on analysis scores
 * @param analysis - The cognitive analysis result
 * @returns Recommendation object with time window and reasoning
 */
export type RecommendationInput = Pick<
  CognitiveAnalysis,
  "cognitiveLoad" | "fatigueScore" | "focusScore" | "burnoutRisk"
>;

export function generateRecommendation(analysis: RecommendationInput): CognitiveRecommendation {
  const { cognitiveLoad, fatigueScore, focusScore, burnoutRisk } = analysis;

  let timeWindow = "Flexible scheduling";
  let reasoning = "";
  const alternatives: string[] = [];

  // Time window recommendations based on cognitive peaks (9-11 AM typical)
  if (focusScore > 70 && cognitiveLoad > 60) {
    timeWindow = "9-11 AM (cognitive peak)";
    reasoning = "High focus and load tasks benefit from peak cognitive hours.";
    alternatives.push("2-4 PM (secondary peak)", "Avoid 12-2 PM (post-lunch dip)");
  } else if (fatigueScore > THRESHOLDS.fatigueRecovery.high) {
    timeWindow = "Early morning or after rest";
    reasoning = "High fatigue tasks need recovery time. Schedule during fresh energy periods.";
    alternatives.push("Schedule with breaks", "Pair with low-energy tasks");
  } else if (burnoutRisk === "high") {
    timeWindow = "Post-recovery period";
    reasoning = "High burnout risk. Allow recovery before scheduling.";
    alternatives.push("Break into smaller tasks", "Reschedule to tomorrow");
  } else {
    timeWindow = "Any available slot";
    reasoning = "Task fits well in current schedule.";
    alternatives.push("Morning for consistency", "Evening for winding down");
  }

  return {
    timeWindow,
    reasoning,
    alternatives,
  };
}

// ============================================================================
// MAIN ANALYSIS ENGINE
// ============================================================================

/**
 * Analyzes a cognitive task and returns comprehensive analysis
 * Pure function: no side effects, deterministic output
 * @param task - The task to analyze
 * @returns Complete cognitive analysis
 */
export function analyzeCognitiveImpact(task: CognitiveTask): CognitiveAnalysis {
  // Calculate individual scores
  const fatigueScore = calculateFatigue(task);
  const focusScore = calculateFocusScore(task);

  // Cognitive load: weighted combination of duration, complexity, and focus
  const durationLoad = (task.duration / 60) * SCORING_WEIGHTS.duration.base;
  const complexityLoad = SCORING_WEIGHTS.complexity[task.complexity] * 20;
  const focusLoad = focusScore * 0.3; // 30% weight on focus demand

  const cognitiveLoad = normalizeScore(
    durationLoad + complexityLoad + focusLoad,
    0,
    120 // Max possible load
  );

  // Burnout risk based on fatigue and load combination
  const burnoutScore = (fatigueScore + cognitiveLoad) / 2;
  const burnoutRisk = getBurnoutRisk(burnoutScore);

  // Generate recommendation
  const recommendation = generateRecommendation({
    cognitiveLoad,
    fatigueScore,
    focusScore,
    burnoutRisk,
  });

  // Build recommendation text
  const recommendationText = buildRecommendationText(recommendation);

  return {
    cognitiveLoad,
    fatigueScore,
    focusScore,
    burnoutRisk,
    recommendedTimeWindow: recommendation.timeWindow,
    recommendationText,
  };
}

/**
 * Converts a blended burnout score into a risk bucket
 */
function getBurnoutRisk(burnoutScore: number): BurnoutRisk {
  if (burnoutScore < THRESHOLDS.burnoutRisk.low) {
    return "low";
  }

  if (burnoutScore < THRESHOLDS.burnoutRisk.medium) {
    return "medium";
  }

  return "high";
}

/**
 * Builds a human-readable recommendation string
 */
function buildRecommendationText(recommendation: CognitiveRecommendation): string {
  return `${recommendation.reasoning} Recommended: ${recommendation.timeWindow}. ${
    recommendation.alternatives.length > 0
      ? `Alternatives: ${recommendation.alternatives.join(", ")}.`
      : ""
  }`;
}

/**
 * Batch analysis for multiple tasks
 * Useful for schedule optimization
 * @param tasks - Array of tasks to analyze
 * @returns Array of analysis results
 */
export function analyzeMultipleTasks(tasks: CognitiveTask[]): CognitiveAnalysis[] {
  return tasks.map(analyzeCognitiveImpact);
}

/**
 * Calculates schedule suitability score
 * Considers task compatibility and cognitive flow
 * @param tasks - Array of tasks in proposed schedule
 * @returns Suitability score (0-100) and issues
 */
export function calculateScheduleSuitability(tasks: CognitiveTask[]): {
  score: number;
  issues: string[];
} {
  if (tasks.length === 0) return { score: 100, issues: [] };

  const analyses = analyzeMultipleTasks(tasks);
  const issues: string[] = [];

  let cumulativeFatigue = 0;
  let highBurnoutCount = 0;

  analyses.forEach((analysis) => {
    cumulativeFatigue += analysis.fatigueScore;
    if (analysis.burnoutRisk === "high") {
      highBurnoutCount += 1;
    }
  });

  if (highBurnoutCount > tasks.length * 0.3) {
    issues.push("Too many high-burnout tasks clustered together");
  }

  if (cumulativeFatigue > 200) {
    issues.push("Cumulative fatigue exceeds safe threshold");
  }

  const avgBurnoutRisk = analyses.reduce((sum, a) => {
    const riskValue = a.burnoutRisk === "high" ? 3 : a.burnoutRisk === "medium" ? 2 : 1;
    return sum + riskValue;
  }, 0) / analyses.length;

  const suitabilityScore = normalizeScore(4 - avgBurnoutRisk, 1, 3);

  return {
    score: suitabilityScore,
    issues,
  };
}