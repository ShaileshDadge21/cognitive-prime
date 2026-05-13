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
  AreaChart,
  Area,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import {
  useAnalytics,
  useProductivityScore,
  useFatigueMetrics,
  useBurnoutRisk,
  useMoodTrend,
  useFocusTrend,
  useDeepWorkCapacity,
  useHabitConsistency,
} from "@/components/analytics/use-analytics";
import {
  ProductivityScoreCard,
  FatigueMetricsCard,
  BurnoutRiskCard,
  DeepWorkCapacityCard,
  HabitConsistencyCard,
} from "@/components/analytics/AnalyticsCards";
import { useHabits } from "@/components/habits/use-habits";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · NeuroFlow AI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { loading, error, data: analytics, refetch } = useAnalytics();
  const { habits } = useHabits();

  const productivityScore = useProductivityScore(analytics);
  const fatigueMetrics = useFatigueMetrics(analytics);
  const burnoutRisk = useBurnoutRisk(analytics);
  const moodTrend = useMoodTrend(analytics);
  const focusTrend = useFocusTrend(analytics);
  const deepWorkCapacity = useDeepWorkCapacity(analytics);
  const habitConsistency = useHabitConsistency(analytics);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 font-semibold">Error loading analytics</p>
            <p className="text-muted-foreground text-sm mt-2">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 rounded-lg bg-coral text-background text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Analytics"
        title="Cognitive signals, surfaced."
        subtitle="A unified view of your planning, habits, and mental energy so you can avoid burnout and keep your momentum aligned."
        actions={
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Key Metrics Row */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProductivityScoreCard score={productivityScore} />
          <FatigueMetricsCard metrics={fatigueMetrics} />
          <DeepWorkCapacityCard capacity={deepWorkCapacity} />
          <HabitConsistencyCard consistency={habitConsistency} />
        </div>

        {/* Burnout Risk - Full Width */}
        <GlassCard className="col-span-12">
          <BurnoutRiskCard risk={burnoutRisk} />
        </GlassCard>

        {/* Mood Trend Chart */}
        <GlassCard className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Mood and energy trend"
            sub="Your emotional state and energy levels over the last 7 days."
            action={
              <span className="text-xs px-2 py-1 rounded-full bg-cyan/10 text-cyan">Real-time</span>
            }
          />
          <div className="mt-6 h-80">
            {moodTrend && moodTrend.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={moodTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--electric)"
                    fill="var(--electric)"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="var(--cyan)"
                    fill="var(--cyan)"
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    stroke="var(--coral)"
                    fill="var(--coral)"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No mood data available yet
              </div>
            )}
          </div>
        </GlassCard>

        {/* Focus Trend */}
        <GlassCard className="col-span-12 lg:col-span-4">
          <SectionHeader
            title="7-day focus trend"
            sub="Your focus score progression over the week."
          />
          <div className="mt-6 h-80">
            {focusTrend && focusTrend.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={focusTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                    domain={[0, 10]}
                  />
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
                    dataKey="focus"
                    stroke="var(--violet)"
                    strokeWidth={2}
                    dot={{ fill: "var(--violet)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No focus data available yet
              </div>
            )}
          </div>
        </GlassCard>

        {/* Habit Performance */}
        {habits && habits.length > 0 && (
          <GlassCard className="col-span-12">
            <SectionHeader
              title="Habit performance"
              sub="Your top habits by consistency and completion."
            />
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <BarChart
                  data={habits
                    .slice()
                    .sort((a, b) => b.consistencyScore - a.consistencyScore)
                    .slice(0, 8)
                    .map((habit) => ({
                      name: habit.title,
                      consistency: habit.consistencyScore,
                      completions:
                        habit.completionHistory?.filter((item) => item.completed).length ?? 0,
                    }))}
                  margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
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
        )}
      </div>
    </PageShell>
  );
}
