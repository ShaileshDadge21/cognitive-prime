/**
 * Focus Analytics Cards
 * Display deep work metrics and insights
 */

import React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Zap, Target, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { CognitiveFatigueData, FocusStreak, SessionMetrics } from "@/components/focus/types";

interface FocusStreakCardProps {
  streak: FocusStreak;
}

export function FocusStreakCard({ streak }: FocusStreakCardProps) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Focus Streak</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">{streak.currentStreak}</p>
          <p className="mt-1 text-xs text-muted-foreground">days in a row</p>
        </div>
        <Flame className="h-6 w-6 text-violet-400 opacity-60" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
          <p className="mt-1 text-lg font-semibold">{streak.longestStreak} days</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">This Week</p>
          <p className="mt-1 text-lg font-semibold">{streak.totalSessionsThisWeek} sessions</p>
        </div>
      </div>
    </motion.div>
  );
}

interface FatigueCardProps {
  fatigue: CognitiveFatigueData;
}

export function FatigueCard({ fatigue }: FatigueCardProps) {
  const getTrendIcon = () => {
    switch (fatigue.trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-red-400" />;
      case "decreasing":
        return <TrendingUp className="h-5 w-5 text-green-400 rotate-180" />;
      default:
        return <TrendingUp className="h-5 w-5 text-amber-400 rotate-90" />;
    }
  };

  const getFatigueColor = () => {
    if (fatigue.currentLevel > 70) return "from-red-500/20 to-red-600/10";
    if (fatigue.currentLevel > 40) return "from-amber-500/20 to-amber-600/10";
    return "from-green-500/20 to-green-600/10";
  };

  const getFatigueTextColor = () => {
    if (fatigue.currentLevel > 70) return "text-red-400";
    if (fatigue.currentLevel > 40) return "text-amber-400";
    return "text-green-400";
  };

  return (
    <motion.div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${getFatigueColor()} p-6 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Cognitive Fatigue
          </p>
          <p className={`mt-3 text-3xl font-bold ${getFatigueTextColor()}`}>
            {fatigue.currentLevel}%
          </p>
        </div>
        {getTrendIcon()}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Trend:</span>
          <span className="font-semibold capitalize">{fatigue.trend}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Peak Focus:</span>
          <span className="font-semibold">{fatigue.peakTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Recovery Needed:</span>
          <span className="font-semibold">{fatigue.recoveryTimeNeeded}h</span>
        </div>
      </div>

      {fatigue.recommendations.length > 0 && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Recommendations
          </p>
          <ul className="space-y-1">
            {fatigue.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

interface SessionMetricsCardProps {
  metrics: SessionMetrics;
}

export function SessionMetricsCard({ metrics }: SessionMetricsCardProps) {
  const getCognitiveLoadColor = () => {
    switch (metrics.cognitiveLoad) {
      case "high":
        return "text-red-400";
      case "moderate":
        return "text-amber-400";
      default:
        return "text-green-400";
    }
  };

  const getEnergyTrendIcon = () => {
    switch (metrics.energyExpenditureTrend) {
      case "declining":
        return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      case "recovering":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      default:
        return <TrendingUp className="h-4 w-4 text-amber-400 rotate-90" />;
    }
  };

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Session Quality</p>
          <p className="mt-3 text-3xl font-bold text-cyan-400">{metrics.completionRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">completion rate</p>
        </div>
        <CheckCircle2 className="h-6 w-6 text-cyan-400 opacity-60" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Avg Interruptions</p>
          <p className={`mt-2 text-lg font-semibold`}>{metrics.averageInterruptions}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cognitive Load</p>
          <p className={`mt-2 text-lg font-semibold capitalize ${getCognitiveLoadColor()}`}>
            {metrics.cognitiveLoad}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            {getEnergyTrendIcon()}
            Energy Trend
          </p>
          <p className="mt-2 text-sm font-semibold capitalize">{metrics.energyExpenditureTrend}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface WeeklyStatsProps {
  totalMinutes: number;
  sessionCount: number;
}

export function WeeklyStatsCard({ totalMinutes, sessionCount }: WeeklyStatsProps) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">This Week</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {hours}h {minutes}m
          </p>
          <p className="mt-1 text-xs text-muted-foreground">deep work time</p>
        </div>
        <Clock className="h-6 w-6 text-emerald-400 opacity-60" />
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <p className="text-sm text-muted-foreground">Sessions completed</p>
        <p className="mt-2 text-2xl font-semibold">{sessionCount}</p>
      </div>
    </motion.div>
  );
}

interface BestTimeCardProps {
  bestHour: number;
  bestQuality: number;
}

export function BestTimeCard({ bestHour, bestQuality }: BestTimeCardProps) {
  const timeString = `${String(bestHour).padStart(2, "0")}:00`;

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Best Focus Window
          </p>
          <p className="mt-3 text-3xl font-bold text-orange-400">{timeString}</p>
        </div>
        <Target className="h-6 w-6 text-orange-400 opacity-60" />
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <p className="text-sm text-muted-foreground">Average focus quality</p>
        <p className="mt-2 text-2xl font-semibold">{bestQuality}/10</p>
      </div>
    </motion.div>
  );
}
