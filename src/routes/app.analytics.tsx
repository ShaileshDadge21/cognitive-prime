import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Sparkles, TrendingUp, Activity, ShieldCheck } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { useHabits } from "@/components/habits/use-habits";
import { tasks as initialTasks, focusData } from "@/lib/mock-data";
import { derivePlannerAnalytics, summarizeHabitPerformance } from "@/lib/analytics";
import { toPlannerTasks } from "@/components/planner/planner-utils";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · NeuroFlow AI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { habits } = useHabits();
  const habitSummary = useMemo(() => summarizeHabitPerformance(habits), [habits]);

  const plannerTasks = useMemo(() => toPlannerTasks(initialTasks), []);
  const avgFatigueSignal = useMemo(
    () => Math.round(focusData.reduce((sum, day) => sum + day.fatigue, 0) / focusData.length),
    [],
  );
  const plannerAnalytics = useMemo(
    () => derivePlannerAnalytics(plannerTasks, avgFatigueSignal),
    [plannerTasks, avgFatigueSignal],
  );

  const taskTrendData = plannerAnalytics.hydratedTasks.map((task) => ({
    title: task.title,
    cognitiveLoad: task.cognitiveLoad ?? 0,
    fatigue: task.fatigueScore ?? 0,
    focus: task.focusScore ?? 0,
  }));

  const habitPerformanceData = habits
    .slice()
    .sort((a, b) => b.consistencyScore - a.consistencyScore)
    .slice(0, 6)
    .map((habit) => ({
      title: habit.title,
      consistency: habit.consistencyScore,
      completions: habit.completionHistory.filter((item) => item.completed).length,
    }));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Analytics"
        title="Cognitive signals, surfaced."
        subtitle="A unified view of your planning, habits, and mental energy so you can avoid burnout and keep your momentum aligned."
        actions={
          <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Recalibrate
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 xl:col-span-8">
          <SectionHeader
            title="Planner health"
            sub="Task-level cognitive load and schedule suitability from your current plan."
            action={
              <span className="text-xs px-2 py-1 rounded-full bg-cyan/10 text-cyan">
                Live preview
              </span>
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                label: "Cognitive score",
                value: `${plannerAnalytics.metrics.cognitiveScore}`,
                icon: Activity,
              },
              {
                label: "Average load",
                value: `${plannerAnalytics.metrics.averageCognitiveLoad}`,
                icon: ShieldCheck,
              },
              {
                label: "Burnout exposure",
                value: `${plannerAnalytics.metrics.burnoutExposure}%`,
                icon: TrendingUp,
              },
              {
                label: "Average fatigue",
                value: `${plannerAnalytics.metrics.averageFatigueScore}`,
                icon: Sparkles,
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-electric text-background">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer>
              <LineChart data={taskTrendData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="title" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cognitiveLoad"
                  stroke="var(--coral)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="var(--electric)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="var(--violet)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 xl:col-span-4">
          <SectionHeader
            title="Habit pulse"
            sub="A glance at how your habits are performing against consistency and completion."
          />
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Habits tracked
              </p>
              <p className="mt-2 text-3xl font-semibold">{habitSummary.totalHabits}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {habitSummary.activeHabits} active habits
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Avg consistency
              </p>
              <p className="mt-2 text-3xl font-semibold">{habitSummary.averageConsistency}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Longest streak {habitSummary.longestStreak} days
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Burnout risk
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {habitSummary.riskDistribution.high > 0
                  ? "High"
                  : habitSummary.riskDistribution.medium > 0
                    ? "Medium"
                    : "Low"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {habitSummary.riskDistribution.high} habits at high risk
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-7">
          <SectionHeader
            title="Top habit signals"
            sub="Consistency and completion counts for your strongest routines."
          />
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart
                data={habitPerformanceData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="title"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="consistency" fill="var(--electric)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-5">
          <SectionHeader
            title="Actionable recommendations"
            sub="AI-guided next steps from your current plan."
          />
          <div className="space-y-3">
            {plannerAnalytics.recommendations.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-surface/80 p-5">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.severity === "warning"
                    ? "Watch"
                    : item.severity === "good"
                      ? "Stable"
                      : "Info"}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="col-span-12">
          <SectionHeader
            title="Habit consistency overview"
            sub="Charted by your most stable routines."
          />
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart
                data={Object.entries(habitSummary.riskDistribution).map(([risk, value]) => ({
                  name: risk,
                  value,
                }))}
              >
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--coral)"
                  fill="var(--coral)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
