/**
 * Advanced Habit Scoring and Analytics Engine
 * Provides sophisticated scoring, analytics, and adaptive recommendations
 */

import type {
  Habit,
  HabitDifficulty,
  HabitBurnoutImpact,
  HabitFrequency,
  ScheduleWindow,
} from "@/components/habits/types";
import {
  HABIT_DIFFICULTY_SCORE,
  HABIT_BURNOUT_SCORE,
  HABIT_FREQUENCY_VALUE,
} from "@/components/habits/types";

// ============================================================================
// HABIT SCORING TYPES
// ============================================================================

export type HabitScore = {
  habitId: string;
  overallScore: number; // 0-100
  consistencyScore: number; // 0-100
  momentumScore: number; // 0-100
  adherenceScore: number; // 0-100
  burnoutRiskScore: number; // 0-100 (higher = more risk)
  successProbability: number; // 0-1
  scoreBreakdown: {
    streakBonus: number;
    consistencyBonus: number;
    frequencyMultiplier: number;
    difficultyAdjustment: number;
    burnoutPenalty: number;
  };
};

export type HabitInsights = {
  habitId: string;
  performance: "excellent" | "good" | "fair" | "struggling" | "critical";
  trend: "improving" | "stable" | "declining";
  trendScore: number; // -100 to 100
  predictedAdherence: number; // 0-100
  riskFactors: string[];
  strengthFactors: string[];
  estimatedCompletionRate30Days: number; // 0-100
  estimatedCompletionRate90Days: number; // 0-100
};

export type AdaptiveRecommendation = {
  habitId: string;
  type:
    | "frequency_increase"
    | "frequency_decrease"
    | "difficulty_increase"
    | "difficulty_decrease"
    | "schedule_optimization"
    | "rest_recommended"
    | "maintain_current"
    | "intensive_support";
  priority: "critical" | "high" | "medium" | "low";
  message: string;
  rationale: string;
  expectedImpact: "positive" | "stabilizing" | "preventive";
  implementationSteps: string[];
  successMetric: string;
};

export type HabitHealthReport = {
  habitId: string;
  score: HabitScore;
  insights: HabitInsights;
  recommendations: AdaptiveRecommendation[];
  lastUpdated: string;
};

// ============================================================================
// SCORING ENGINE
// ============================================================================

/**
 * Calculate comprehensive habit score
 */
export function calculateHabitScore(habit: Habit): HabitScore {
  const streakBonus = Math.min(habit.streakCount * 0.5, 30); // Max 30 points from streak
  const consistencyBonus = habit.consistencyScore * 0.4; // 0-40 points from consistency

  // Frequency multiplier: daily habits worth more
  const frequencyMultiplier = (HABIT_FREQUENCY_VALUE[habit.frequency] / 7) * 20; // 0-20 points

  // Difficulty adjustment: harder habits weighted higher
  const difficultyAdjustment = (HABIT_DIFFICULTY_SCORE[habit.cognitiveDifficulty] / 100) * 10; // 0-10 points

  // Burnout penalty: high-impact habits penalized if consistency drops
  const burnoutPenalty =
    habit.burnoutImpact === "critical" && habit.consistencyScore < 60
      ? 15
      : habit.burnoutImpact === "high" && habit.consistencyScore < 70
        ? 10
        : 0;

  const rawScore =
    streakBonus + consistencyBonus + frequencyMultiplier + difficultyAdjustment - burnoutPenalty;
  const overallScore = Math.max(0, Math.min(100, rawScore));

  // Calculate additional metrics
  const momentumScore = calculateMomentumScore(habit);
  const adherenceScore = calculateAdherenceScore(habit);
  const burnoutRiskScore = calculateBurnoutRiskScore(habit);
  const successProbability = calculateSuccessProbability(
    habit,
    overallScore,
    adherenceScore,
    burnoutRiskScore,
  );

  return {
    habitId: habit.id,
    overallScore: Math.round(overallScore),
    consistencyScore: habit.consistencyScore,
    momentumScore: Math.round(momentumScore),
    adherenceScore: Math.round(adherenceScore),
    burnoutRiskScore: Math.round(burnoutRiskScore),
    successProbability: Math.round(successProbability * 100) / 100,
    scoreBreakdown: {
      streakBonus: Math.round(streakBonus),
      consistencyBonus: Math.round(consistencyBonus),
      frequencyMultiplier: Math.round(frequencyMultiplier),
      difficultyAdjustment: Math.round(difficultyAdjustment),
      burnoutPenalty: Math.round(burnoutPenalty),
    },
  };
}

/**
 * Calculate momentum score (recent performance trend)
 */
function calculateMomentumScore(habit: Habit): number {
  if (habit.completionHistory.length < 7) return 50; // Neutral if insufficient data

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentHistory = habit.completionHistory.filter(
    (c) => new Date(c.date) >= thirtyDaysAgo && c.completed,
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weekHistory = habit.completionHistory.filter(
    (c) => new Date(c.date) >= sevenDaysAgo && c.completed,
  );

  // Trend: compare recent week to month
  const recentRate = recentHistory.length / 30;
  const weekRate = weekHistory.length / 7;

  // Calculate momentum
  const momentum = ((weekRate - recentRate) / Math.max(recentRate, 0.1)) * 25 + 50;
  return Math.max(0, Math.min(100, momentum));
}

/**
 * Calculate adherence score (ability to stick with schedule)
 */
function calculateAdherenceScore(habit: Habit): number {
  if (habit.completionHistory.length === 0) return 0;

  // Consider completion consistency relative to frequency
  const expectedCompletions = Math.ceil(habit.completionHistory.length / 4); // Rough estimate based on frequency
  const actualCompletions = habit.completionHistory.filter((c) => c.completed).length;

  const adherenceRate = (actualCompletions / Math.max(expectedCompletions, 1)) * 100;
  return Math.min(100, adherenceRate);
}

/**
 * Calculate burnout risk score
 */
function calculateBurnoutRiskScore(habit: Habit): number {
  const baseBurnoutScore = HABIT_BURNOUT_SCORE[habit.burnoutImpact] || 0;
  const difficultyScore = HABIT_DIFFICULTY_SCORE[habit.cognitiveDifficulty] || 0;

  // If low consistency despite high difficulty/burnout impact, increase risk
  const consistencyFactor = habit.consistencyScore < 50 ? 20 : habit.consistencyScore < 70 ? 10 : 0;

  // If streak is declining, increase risk
  const recentCompletionRate = getRecentCompletionRate(habit, 14);
  const trendPenalty = recentCompletionRate < habit.consistencyScore / 100 ? 15 : 0;

  return Math.min(100, (baseBurnoutScore + difficultyScore) / 2 + consistencyFactor + trendPenalty);
}

/**
 * Calculate success probability for next 30 days
 */
function calculateSuccessProbability(
  habit: Habit,
  overallScore: number,
  adherenceScore: number,
  burnoutRiskScore: number,
): number {
  // Base probability from overall score
  let probability = overallScore / 100;

  // Adjust based on adherence
  probability *= 0.3 + (adherenceScore / 100) * 0.5;

  // Reduce based on burnout risk
  probability *= 1 - burnoutRiskScore / 200;

  // Historical success rate adjustment
  const historicalRate = habit.consistencyScore / 100;
  probability = (probability + historicalRate) / 2;

  return Math.max(0, Math.min(1, probability));
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Generate comprehensive habit insights
 */
export function generateHabitInsights(habit: Habit): HabitInsights {
  const score = calculateHabitScore(habit);
  const trend = calculatePerformanceTrend(habit);
  const trendScore = calculateTrendScore(habit);
  const riskFactors = identifyRiskFactors(habit);
  const strengthFactors = identifyStrengthFactors(habit);

  // Estimate completion rates
  const estimatedCompletionRate30Days = estimateCompletionRate(habit, 30);
  const estimatedCompletionRate90Days = estimateCompletionRate(habit, 90);

  // Determine performance level
  const performance = determinePerformanceLevel(score.overallScore, riskFactors);

  return {
    habitId: habit.id,
    performance,
    trend,
    trendScore,
    predictedAdherence: score.adherenceScore,
    riskFactors,
    strengthFactors,
    estimatedCompletionRate30Days,
    estimatedCompletionRate90Days,
  };
}

/**
 * Calculate performance trend
 */
function calculatePerformanceTrend(habit: Habit): "improving" | "stable" | "declining" {
  if (habit.completionHistory.length < 14) return "stable";

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const oldRate = getRecentCompletionRate(habit, 14, 7); // 14-7 days ago
  const newRate = getRecentCompletionRate(habit, 7); // Last 7 days

  if (newRate > oldRate + 10) return "improving";
  if (newRate < oldRate - 10) return "declining";
  return "stable";
}

/**
 * Calculate trend score (-100 to 100)
 */
function calculateTrendScore(habit: Habit): number {
  if (habit.completionHistory.length < 14) return 0;

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const oldRate = getRecentCompletionRate(habit, 14, 7);
  const newRate = getRecentCompletionRate(habit, 7);

  // Scale to -100 to 100
  return Math.max(-100, Math.min(100, (newRate - oldRate) * 5));
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(habit: Habit): string[] {
  const factors: string[] = [];

  if (habit.consistencyScore < 50) {
    factors.push("Low consistency - consider reviewing schedule or difficulty");
  }

  if (habit.streakCount === 0) {
    factors.push("No active streak - need a fresh start");
  }

  if (getRecentCompletionRate(habit, 7) < 0.5) {
    factors.push("Recent completion rate declining");
  }

  if (habit.burnoutImpact === "critical" && habit.consistencyScore < 70) {
    factors.push("High burnout risk detected");
  }

  if (habit.completionHistory.length === 0) {
    factors.push("No completion history - just started");
  }

  const lastCompletion = habit.completionHistory
    .filter((c) => c.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (lastCompletion) {
    const daysSinceCompletion =
      (new Date().getTime() - new Date(lastCompletion.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCompletion > 14 && habit.frequency === "daily") {
      factors.push("Long gap since last completion");
    }
  }

  return factors;
}

/**
 * Identify strength factors
 */
function identifyStrengthFactors(habit: Habit): string[] {
  const factors: string[] = [];

  if (habit.streakCount >= 30) {
    factors.push(`Impressive ${habit.streakCount}-day streak!`);
  } else if (habit.streakCount >= 7) {
    factors.push(`Building momentum with ${habit.streakCount}-day streak`);
  }

  if (habit.consistencyScore >= 80) {
    factors.push("Excellent consistency - highly reliable");
  } else if (habit.consistencyScore >= 60) {
    factors.push("Good consistency - on track");
  }

  if (calculateMomentumScore(habit) > 60) {
    factors.push("Positive momentum - improving performance");
  }

  if (habit.burnoutImpact === "low") {
    factors.push("Low burnout risk - sustainable");
  }

  return factors;
}

/**
 * Estimate completion rate for next N days
 */
function estimateCompletionRate(habit: Habit, days: number): number {
  if (habit.completionHistory.length === 0) return 50; // Default estimate

  const baseRate = habit.consistencyScore / 100;
  const trend = (calculateTrendScore(habit) + 100) / 200; // Normalize to 0-1
  const burnoutFactor = Math.max(0.5, 1 - calculateBurnoutRiskScore(habit) / 200);

  const estimated = (baseRate * 0.6 + trend * 0.3) * burnoutFactor;
  return Math.round(Math.max(0, Math.min(100, estimated * 100)));
}

/**
 * Determine performance level
 */
function determinePerformanceLevel(
  score: number,
  riskFactors: string[],
): "excellent" | "good" | "fair" | "struggling" | "critical" {
  if (score >= 85 && riskFactors.length === 0) return "excellent";
  if (score >= 70 && riskFactors.length <= 1) return "good";
  if (score >= 50 && riskFactors.length <= 2) return "fair";
  if (score >= 30) return "struggling";
  return "critical";
}

// ============================================================================
// ADAPTIVE RECOMMENDATIONS ENGINE
// ============================================================================

/**
 * Generate adaptive recommendations
 */
export function generateAdaptiveRecommendations(habit: Habit): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];
  const insights = generateHabitInsights(habit);
  const score = calculateHabitScore(habit);

  // CRITICAL CONDITION: Habit at severe risk
  if (insights.performance === "critical") {
    recommendations.push({
      habitId: habit.id,
      type: "intensive_support",
      priority: "critical",
      message: "This habit needs immediate attention",
      rationale: `Your habit is struggling with a ${score.overallScore}/100 score and ${riskFactors.join(", ")}`,
      expectedImpact: "preventive",
      implementationSteps: [
        "Review the habit's purpose and why it matters to you",
        "Consider reducing frequency or difficulty temporarily",
        "Set a daily reminder at your preferred time",
        "Start with micro-commitments (1-2 minutes daily)",
      ],
      successMetric: "3 consecutive completions within the next week",
    });
    return recommendations; // Return critical recommendation only
  }

  // Analyze specific conditions and add targeted recommendations
  const riskFactors = insights.riskFactors;

  // FREQUENCY ADJUSTMENT
  if (insights.predictedAdherence > 80 && habit.streakCount > 14) {
    recommendations.push({
      habitId: habit.id,
      type: "frequency_increase",
      priority: "medium",
      message: "You're ready to increase the challenge",
      rationale: `With ${insights.predictedAdherence}% adherence and a ${habit.streakCount}-day streak, you can handle more frequency`,
      expectedImpact: "positive",
      implementationSteps: [
        `Consider changing from ${habit.frequency} to ${increaseFrequency(habit.frequency)}`,
        "Start the new frequency gradually (1-2 weeks transition)",
        "Monitor your consistency during the transition",
      ],
      successMetric: `Maintain >${insights.predictedAdherence - 10}% consistency at new frequency`,
    });
  } else if (insights.predictedAdherence < 60 && habit.frequency !== "monthly") {
    recommendations.push({
      habitId: habit.id,
      type: "frequency_decrease",
      priority: "high",
      message: "Reduce frequency to rebuild consistency",
      rationale: `Your adherence is ${insights.predictedAdherence}%, suggesting the current pace is unsustainable`,
      expectedImpact: "stabilizing",
      implementationSteps: [
        `Reduce to ${decreaseFrequency(habit.frequency)} temporarily`,
        "Rebuild your success foundation",
        "Increase frequency again once you reach 80% consistency",
      ],
      successMetric: `Achieve 80%+ consistency at new frequency for 2 weeks`,
    });
  }

  // DIFFICULTY ADJUSTMENT
  if (
    score.overallScore > 75 &&
    habit.streakCount > 20 &&
    habit.cognitiveDifficulty !== "strenuous"
  ) {
    recommendations.push({
      habitId: habit.id,
      type: "difficulty_increase",
      priority: "low",
      message: "Time to level up",
      rationale: "You've mastered this habit - increase the challenge",
      expectedImpact: "positive",
      implementationSteps: [
        `Increase difficulty from ${habit.cognitiveDifficulty}`,
        "Add quality or intensity to your completions",
        "Track improvements in the difficulty",
      ],
      successMetric: "Maintain current consistency with increased difficulty",
    });
  } else if (score.burnoutRiskScore > 60 && score.consistencyScore < 70) {
    recommendations.push({
      habitId: habit.id,
      type: "difficulty_decrease",
      priority: "high",
      message: "Reduce complexity to prevent burnout",
      rationale: "High burnout risk detected with inconsistent performance",
      expectedImpact: "preventive",
      implementationSteps: [
        `Simplify from ${habit.cognitiveDifficulty} to a less demanding level`,
        "Focus on consistency over quality",
        "Rebuild your confidence",
      ],
      successMetric: "Achieve 75%+ consistency for 3 weeks",
    });
  }

  // SCHEDULE OPTIMIZATION
  if (!habit.preferredWindow) {
    recommendations.push({
      habitId: habit.id,
      type: "schedule_optimization",
      priority: "medium",
      message: "Set a preferred time for your habit",
      rationale: "Habits are more reliable with consistent timing",
      expectedImpact: "stabilizing",
      implementationSteps: [
        "Pick your most productive time window",
        "Set a daily reminder at that time",
        "Do the habit at the same time for 2 weeks",
      ],
      successMetric: "Complete 100% of scheduled attempts within your preferred window",
    });
  }

  // REST RECOMMENDATION
  if (insights.trend === "declining" && score.burnoutRiskScore > 70) {
    recommendations.push({
      habitId: habit.id,
      type: "rest_recommended",
      priority: "high",
      message: "Take a strategic break",
      rationale: `Your performance is declining and burnout risk is high (${score.burnoutRiskScore}/100)`,
      expectedImpact: "preventive",
      implementationSteps: [
        "Pause this habit for 3-5 days",
        "Reflect on what's making it challenging",
        "Resume with adjusted frequency or difficulty",
        "Consider combining it with an enjoyable activity",
      ],
      successMetric: "Return stronger with renewed motivation",
    });
  }

  // MAINTAIN CURRENT
  if (recommendations.length === 0) {
    recommendations.push({
      habitId: habit.id,
      type: "maintain_current",
      priority: "low",
      message: "You're on track!",
      rationale: `Your habit is performing well with a ${score.overallScore}/100 score`,
      expectedImpact: "stabilizing",
      implementationSteps: [
        "Continue your current routine",
        "Celebrate your progress regularly",
        "Share your achievements with someone",
      ],
      successMetric: "Maintain current consistency and streak",
    });
  }

  return recommendations;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRecentCompletionRate(habit: Habit, days: number, offsetDays: number = 0): number {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - offsetDays);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const recentRecords = habit.completionHistory.filter(
    (record) =>
      new Date(record.date) >= startDate && new Date(record.date) <= endDate && record.completed,
  );

  return recentRecords.length / days;
}

function increaseFrequency(current: HabitFrequency): HabitFrequency {
  const frequencyMap: Record<HabitFrequency, HabitFrequency> = {
    monthly: "biweekly",
    biweekly: "weekly",
    weekly: "daily",
    daily: "daily",
  };
  return frequencyMap[current];
}

function decreaseFrequency(current: HabitFrequency): HabitFrequency {
  const frequencyMap: Record<HabitFrequency, HabitFrequency> = {
    daily: "weekly",
    weekly: "biweekly",
    biweekly: "monthly",
    monthly: "monthly",
  };
  return frequencyMap[current];
}

/**
 * Generate comprehensive health report for a habit
 */
export function generateHabitHealthReport(habit: Habit): HabitHealthReport {
  return {
    habitId: habit.id,
    score: calculateHabitScore(habit),
    insights: generateHabitInsights(habit),
    recommendations: generateAdaptiveRecommendations(habit),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate habit score percentile (compared to all habits)
 */
export function calculateHabitPercentile(targetScore: number, allScores: number[]): number {
  const belowCount = allScores.filter((s) => s < targetScore).length;
  return Math.round((belowCount / allScores.length) * 100);
}
