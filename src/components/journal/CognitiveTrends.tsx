import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ENERGY_LEVEL_MAP,
  STRESS_LEVEL_MAP,
  FOCUS_QUALITY_MAP,
  MOOD_CONFIG,
  MOOD_POSITIVITY_SCORE,
} from "./types";
import type { JournalEntry, MoodType } from "./types";

interface CognitiveTrendsProps {
  entries: JournalEntry[];
}

export function CognitiveTrends({ entries }: CognitiveTrendsProps) {
  const metrics = useMemo(() => {
    if (entries.length === 0) {
      return null;
    }

    let totalEnergy = 0;
    let totalStress = 0;
    let totalFocus = 0;
    let totalMoodScore = 0;
    const moodCounts: Partial<Record<MoodType, number>> = {};

    entries.forEach((entry) => {
      totalEnergy += ENERGY_LEVEL_MAP[entry.energyLevel];
      totalStress += STRESS_LEVEL_MAP[entry.stressLevel];
      totalFocus += FOCUS_QUALITY_MAP[entry.focusQuality];
      totalMoodScore += MOOD_POSITIVITY_SCORE[entry.mood];

      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const avgEnergy = Math.round(totalEnergy / entries.length);
    const avgStress = Math.round(totalStress / entries.length);
    const avgFocus = Math.round(totalFocus / entries.length);
    const avgMoodScore = Math.round(totalMoodScore / entries.length);

    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, midpoint);
    const secondHalf = entries.slice(midpoint);

    const getAvgScore = (arr: JournalEntry[]) => {
      if (arr.length === 0) return 0;
      return arr.reduce((sum, e) => sum + MOOD_POSITIVITY_SCORE[e.mood], 0) / arr.length;
    };

    const firstHalfScore = getAvgScore(firstHalf);
    const secondHalfScore = getAvgScore(secondHalf);

    const moodTrend =
      secondHalfScore > firstHalfScore
        ? "improving"
        : secondHalfScore < firstHalfScore
          ? "declining"
          : "stable";

    // Most common moods
    const topMoods = Object.entries(moodCounts as Record<MoodType, number>)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood as MoodType);

    // Burnout risk calculation
    let burnoutRisk: "low" | "moderate" | "high" = "low";
    if (avgStress > 70 && avgEnergy < 40) {
      burnoutRisk = "high";
    } else if (avgStress > 60 && avgEnergy < 50) {
      burnoutRisk = "moderate";
    }

    return {
      avgEnergy,
      avgStress,
      avgFocus,
      avgMoodScore,
      moodTrend,
      topMoods,
      burnoutRisk,
      entriesCount: entries.length,
    };
  }, [entries]);

  if (!metrics) {
    return null;
  }

  const stressLevel = Math.min(100, metrics.avgStress);
  const burnoutColors = {
    low: "text-green-600",
    moderate: "text-yellow-600",
    high: "text-red-600",
  };

  const burnoutBgColors = {
    low: "bg-green-50 border-green-200",
    moderate: "bg-yellow-50 border-yellow-200",
    high: "bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Energy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-4 bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-2xl font-bold text-green-600">{metrics.avgEnergy}%</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Average Energy</p>
            <Progress value={metrics.avgEnergy} className="mt-2 h-1" />
          </Card>
        </motion.div>

        {/* Stress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-4 bg-linear-to-br from-red-50 to-pink-50 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl font-bold text-red-600">{metrics.avgStress}%</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Average Stress</p>
            <Progress value={stressLevel} className="mt-2 h-1" />
          </Card>
        </motion.div>

        {/* Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-2xl font-bold text-blue-600">{metrics.avgFocus}%</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Average Focus</p>
            <Progress value={metrics.avgFocus} className="mt-2 h-1" />
          </Card>
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 bg-linear-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">😊</span>
              <span className="text-2xl font-bold text-purple-600">{metrics.avgMoodScore}%</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">Overall Mood</p>
            <Progress value={metrics.avgMoodScore} className="mt-2 h-1" />
          </Card>
        </motion.div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Mood Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mood Trajectory</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {metrics.moodTrend === "improving"
                  ? "📈"
                  : metrics.moodTrend === "declining"
                    ? "📉"
                    : "➡️"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{metrics.moodTrend}</p>
                <p className="text-xs text-gray-600">Based on {metrics.entriesCount} entries</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Burnout Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className={`p-4 border-2 ${burnoutBgColors[metrics.burnoutRisk]}`}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Burnout Risk</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {metrics.burnoutRisk === "high"
                  ? "🚨"
                  : metrics.burnoutRisk === "moderate"
                    ? "⚠️"
                    : "✅"}
              </span>
              <p className={`text-sm font-medium capitalize ${burnoutColors[metrics.burnoutRisk]}`}>
                {metrics.burnoutRisk}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Moods */}
      {metrics.topMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Most Frequent Moods</h3>
            <div className="flex gap-3">
              {metrics.topMoods.map((mood, index) => {
                const config = MOOD_CONFIG[mood];
                return (
                  <div key={mood} className={`flex-1 p-3 rounded-lg text-center ${config.bgColor}`}>
                    <div className="text-2xl mb-1">{config.emoji}</div>
                    <p className="text-xs font-medium text-gray-700">
                      {index === 0 ? "Most" : index === 1 ? "2nd" : "3rd"}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Integration Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-sm font-semibold text-blue-900">AI Insights Coming Soon</p>
              <p className="text-xs text-blue-700 mt-1">
                Unlock detailed sentiment analysis, burnout prediction, and personalized
                recommendations with AI-powered insights.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
