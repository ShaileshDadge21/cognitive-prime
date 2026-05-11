import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  calculateHabitScore,
  generateHabitInsights,
  type HabitScore,
  type HabitInsights,
} from "@/lib/habit-scoring-engine";
import type { Habit } from "./types";

interface HabitScoreCardProps {
  habit: Habit;
  className?: string;
}

export function HabitScoreCard({ habit, className = "" }: HabitScoreCardProps) {
  const score = calculateHabitScore(habit);
  const insights = generateHabitInsights(habit);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "text-green-300 bg-green-500/10 border-green-500/20";
      case "good":
        return "text-electric bg-electric/10 border-electric/20";
      case "fair":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
      case "struggling":
        return "text-orange-300 bg-orange-500/10 border-orange-500/20";
      case "critical":
        return "text-red-300 bg-red-500/10 border-red-500/20";
      default:
        return "text-muted-foreground bg-surface/60 border-white/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-300";
    if (score >= 60) return "text-electric";
    if (score >= 40) return "text-yellow-300";
    if (score >= 20) return "text-orange-300";
    return "text-red-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{habit.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getPerformanceColor(insights.performance)}>
                {insights.performance.charAt(0).toUpperCase() + insights.performance.slice(1)}
              </Badge>
              <div className="flex items-center gap-1">
                {getTrendIcon(insights.trend)}
                <span className="text-sm text-muted-foreground capitalize">{insights.trend}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
              {score.overallScore}
            </div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Consistency</span>
            <div className="flex items-center gap-2">
              <Progress value={score.consistencyScore} className="w-16 h-2" />
              <span className="text-sm font-medium">{score.consistencyScore}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Momentum</span>
            <div className="flex items-center gap-2">
              <Progress value={score.momentumScore} className="w-16 h-2" />
              <span className="text-sm font-medium">{score.momentumScore}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Adherence</span>
            <div className="flex items-center gap-2">
              <Progress value={score.adherenceScore} className="w-16 h-2" />
              <span className="text-sm font-medium">{score.adherenceScore}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Burnout Risk</span>
            <div className="flex items-center gap-2">
              <Progress value={score.burnoutRiskScore} className="w-16 h-2" />
              <span className="text-sm font-medium">{score.burnoutRiskScore}%</span>
            </div>
          </div>
        </div>

        {/* Success Probability */}
        <div className="rounded-2xl border border-white/10 bg-background/40 p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Success Probability</span>
            <span className="text-sm font-bold text-foreground">
              {(score.successProbability * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={score.successProbability * 100} className="h-2" />
        </div>

        {/* Key Insights */}
        <div className="space-y-2">
          {insights.strengthFactors.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{insights.strengthFactors[0]}</span>
            </div>
          )}

          {insights.riskFactors.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{insights.riskFactors[0]}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>30-day estimate: {insights.estimatedCompletionRate30Days}% completion rate</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
