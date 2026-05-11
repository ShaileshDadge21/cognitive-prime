import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitScoreCard } from "./HabitScoreCard";
import { AdaptiveRecommendationsPanel } from "./AdaptiveRecommendationsPanel";
import {
  useHabitScoring,
  useHabitInsights,
  useAdaptiveRecommendations,
  useHabitHealthReports,
} from "./use-habits";
import type { Habit } from "./types";

interface HabitAnalyticsDashboardProps {
  habits: Habit[];
  className?: string;
}

export function HabitAnalyticsDashboard({ habits, className = "" }: HabitAnalyticsDashboardProps) {
  const { scores, averageScore, topPerformingHabits, strugglingHabits } = useHabitScoring(habits);
  const { insights, performanceDistribution, trendDistribution, totalRiskFactors } =
    useHabitInsights(habits);
  const { criticalRecommendations, highPriorityRecommendations } =
    useAdaptiveRecommendations(habits);
  const { reports, getHabitsByPerformance } = useHabitHealthReports(habits);

  const [selectedTab, setSelectedTab] = useState("overview");

  const excellentHabits = getHabitsByPerformance("excellent");
  const criticalHabits = getHabitsByPerformance("critical");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habit Analytics</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights to optimize your habit performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            <Award className="w-4 h-4 mr-1" />
            {averageScore}/100 Avg Score
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-white/10 bg-surface/80 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-electric/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-electric" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{averageScore}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-surface/80 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Excellent Habits</p>
              <p className="text-2xl font-bold text-foreground">{excellentHabits.length}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-surface/80 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Habits</p>
              <p className="text-2xl font-bold text-foreground">{criticalHabits.length}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-surface/80 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Recommendations</p>
              <p className="text-2xl font-bold text-foreground">
                {criticalRecommendations.length + highPriorityRecommendations.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-foreground mb-4">Performance Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(performanceDistribution).map(([level, count]) => (
            <div key={level} className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{level}</div>
              <div className="w-full bg-background/60 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    level === "excellent"
                      ? "bg-green-500"
                      : level === "good"
                        ? "bg-blue-500"
                        : level === "fair"
                          ? "bg-yellow-500"
                          : level === "struggling"
                            ? "bg-orange-500"
                            : "bg-red-500"
                  }`}
                  style={{ width: `${habits.length > 0 ? (count / habits.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trend Analysis */}
      <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-foreground mb-4">Trend Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(trendDistribution).map(([trend, count]) => (
            <div
              key={trend}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/40 p-4"
            >
              <div className="shrink-0">
                {trend === "improving" ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : trend === "declining" ? (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                ) : (
                  <div className="w-6 h-6 bg-surface-2 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{trend}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scores">Habit Scores</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Deep Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Performers */}
          {topPerformingHabits.length > 0 && (
            <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performing Habits
              </h3>
              <div className="grid gap-4">
                {topPerformingHabits.slice(0, 3).map((score) => {
                  const habit = habits.find((h) => h.id === score.habitId);
                  return habit ? (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between rounded-2xl border border-green-500/20 bg-green-500/10 p-3"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{habit.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Score: {score.overallScore}/100
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-300 border-green-500/20">
                        Excellent
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          )}

          {/* Struggling Habits */}
          {strugglingHabits.length > 0 && (
            <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Habits Needing Attention
              </h3>
              <div className="grid gap-4">
                {strugglingHabits.slice(0, 3).map((score) => {
                  const habit = habits.find((h) => h.id === score.habitId);
                  return habit ? (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 p-3"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{habit.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Score: {score.overallScore}/100
                        </p>
                      </div>
                      <Badge className="bg-red-500/10 text-red-300 border-red-500/20">
                        Critical
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          )}

          {/* Risk Factors Summary */}
          {totalRiskFactors > 0 && (
            <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Risk Factors Summary</h3>
              <div className="text-sm text-muted-foreground">
                <p>
                  Total risk factors identified:{" "}
                  <span className="font-medium text-foreground">{totalRiskFactors}</span>
                </p>
                <p className="mt-2">
                  Focus on addressing these factors to improve your habit success rates.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <div className="grid gap-6">
            {habits.map((habit) => (
              <HabitScoreCard key={habit.id} habit={habit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Critical Recommendations */}
          {criticalRecommendations.length > 0 && (
            <Card className="rounded-3xl border-red-500/20 bg-red-500/10 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-red-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Recommendations ({criticalRecommendations.length})
              </h3>
              <div className="space-y-4">
                {criticalRecommendations.map((rec, index) => {
                  const habit = habits.find((h) => h.id === rec.habitId);
                  return habit ? (
                    <div
                      key={index}
                      className="rounded-2xl border border-red-500/20 bg-background/40 p-4"
                    >
                      <h4 className="font-medium text-foreground mb-1">{habit.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{rec.message}</p>
                      <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          )}

          {/* High Priority Recommendations */}
          {highPriorityRecommendations.length > 0 && (
            <Card className="rounded-3xl border-orange-500/20 bg-orange-500/10 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                High Priority Recommendations ({highPriorityRecommendations.length})
              </h3>
              <div className="space-y-4">
                {highPriorityRecommendations.map((rec, index) => {
                  const habit = habits.find((h) => h.id === rec.habitId);
                  return habit ? (
                    <div
                      key={index}
                      className="rounded-2xl border border-orange-500/20 bg-background/40 p-4"
                    >
                      <h4 className="font-medium text-foreground mb-1">{habit.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{rec.message}</p>
                      <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          )}

          {/* Individual Habit Recommendations */}
          <div className="grid gap-6">
            {habits.map((habit) => (
              <AdaptiveRecommendationsPanel key={habit.id} habit={habit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {reports.map((report) => {
              const habit = habits.find((h) => h.id === report.habitId);
              if (!habit) return null;

              return (
                <Card
                  key={report.habitId}
                  className="rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{habit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(report.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        report.insights.performance === "excellent"
                          ? "bg-green-500/10 text-green-300 border-green-500/20"
                          : report.insights.performance === "good"
                            ? "bg-electric/10 text-electric border-electric/20"
                            : report.insights.performance === "fair"
                              ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                              : report.insights.performance === "struggling"
                                ? "bg-orange-500/10 text-orange-300 border-orange-500/20"
                                : "bg-red-500/10 text-red-300 border-red-500/20"
                      }
                    >
                      {report.insights.performance}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Strength Factors</h4>
                      <ul className="space-y-2">
                        {report.insights.strengthFactors.map((factor, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-3">Risk Factors</h4>
                      <ul className="space-y-2">
                        {report.insights.riskFactors.map((factor, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <AlertTriangle className="w-4 h-4 text-orange-300 mt-0.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          {report.insights.estimatedCompletionRate30Days}%
                        </div>
                        <div className="text-xs text-muted-foreground">30-day estimate</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          {report.insights.estimatedCompletionRate90Days}%
                        </div>
                        <div className="text-xs text-muted-foreground">90-day estimate</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          {report.score.successProbability * 100}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success probability</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          {report.score.burnoutRiskScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Burnout risk</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
