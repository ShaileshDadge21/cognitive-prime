import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Heart, Sparkles, TrendingUp, Smile } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { moodOptions, focusData } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { moodService } from "@/services/mood";

export const Route = createFileRoute("/app/mood")({
  head: () => ({ meta: [{ title: "Mood Tracking · NeuroFlow AI" }] }),
  component: MoodPage,
});

const moodHistory = Array.from({ length: 30 }, (_, i) => ({
  d: i + 1,
  mood: 50 + Math.sin(i / 3) * 20 + Math.random() * 10,
  energy: 55 + Math.cos(i / 4) * 18 + Math.random() * 8,
}));

const emotions = [
  { trait: "Calm", value: 78 },
  { trait: "Focus", value: 86 },
  { trait: "Energy", value: 64 },
  { trait: "Joy", value: 72 },
  { trait: "Stress", value: 30 },
  { trait: "Drive", value: 80 },
];

function MoodPage() {
  const [mood, setMood] = useState("focused");
  const [intensity, setIntensity] = useState(70);
  const [note, setNote] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const cloudEnabled = isSupabaseConfigured();

  const handleLogMood = async () => {
    if (!cloudEnabled) {
      setLogError("Cloud storage not configured. Mood logging requires Supabase setup.");
      return;
    }

    setIsLogging(true);
    setLogError(null);

    try {
      await moodService.create({
        logged_at: new Date().toISOString(),
        mood,
        mood_score: intensity,
        note: note.trim() || null,
      });

      // Reset form
      setNote("");
      setMood("focused");
      setIntensity(70);
    } catch (error) {
      setLogError(error instanceof Error ? error.message : "Failed to log mood");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Mood Tracking"
        title="Emotional state, decoded."
        subtitle="Daily emotional check-ins train NeuroFlow to adapt your workload, breaks, and AI tone to how you actually feel."
        actions={
          <button
            onClick={handleLogMood}
            disabled={isLogging}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Heart className="h-4 w-4" /> {isLogging ? "Logging..." : "Log mood"}
          </button>
        }
      />

      {logError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-200 mb-6">
          {logError}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-5">
          <SectionHeader title="How are you right now?" sub="Tap a mood and dial in intensity" />
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((m) => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`relative aspect-square rounded-2xl border transition flex flex-col items-center justify-center gap-1 ${
                    active
                      ? "border-coral/60 bg-coral/10"
                      : "border-white/5 bg-surface/40 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full bg-gradient-to-br ${
                      m.id === "energetic"
                        ? "from-coral to-orange-400"
                        : m.id === "focused"
                          ? "from-electric to-cyan-400"
                          : m.id === "calm"
                            ? "from-violet to-purple-400"
                            : m.id === "tired"
                              ? "from-muted to-slate-500"
                              : "from-destructive to-red-400"
                    } ${active ? "animate-pulse-glow" : ""}`}
                  />
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Intensity</span>
              <span className="text-foreground">{intensity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={intensity}
              onChange={(e) => setIntensity(+e.target.value)}
              className="w-full mt-2 accent-coral"
            />
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="mt-4 w-full px-4 py-3 rounded-2xl bg-surface/60 border border-white/10 focus:border-coral/40 focus:outline-none text-sm resize-none h-24"
          />
          <button
            onClick={handleLogMood}
            disabled={isLogging}
            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-coral to-electric text-background text-sm font-medium disabled:opacity-50"
          >
            {isLogging ? "Saving..." : "Save check-in"}
          </button>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-7">
          <SectionHeader
            title="Emotional radar"
            sub="Synthesized from 30 days of check-ins, biometrics, and language signals"
            action={
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet/15 text-violet">
                Stable
              </span>
            }
          />
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={emotions}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="trait"
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

        <GlassCard className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Mood × energy · 30 days"
            sub="Mental energy correlates 0.74 with reported mood"
            action={
              <span className="text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% this week
              </span>
            }
          />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={moodHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="d"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
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
                  dataKey="mood"
                  stroke="var(--coral)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="var(--electric)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4">
          <SectionHeader title="Mental energy" sub="This week" />
          <div className="h-32 -mx-2">
            <ResponsiveContainer>
              <AreaChart data={focusData}>
                <defs>
                  <linearGradient id="me" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--electric)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--electric)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="var(--electric)"
                  strokeWidth={2}
                  fill="url(#me)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-surface/50 border border-white/5">
              <div className="text-xs text-muted-foreground">Avg mood</div>
              <div className="font-display text-2xl mt-0.5">7.4</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/50 border border-white/5">
              <div className="text-xs text-muted-foreground">Best day</div>
              <div className="font-display text-2xl mt-0.5">Thu</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12">
          <SectionHeader
            title="Recent check-ins"
            sub="Your emotional history with AI-detected triggers"
            action={
              <span className="text-xs px-2 py-0.5 rounded-full bg-electric/15 text-electric flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI insight
              </span>
            }
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                day: "Today",
                mood: "Focused",
                note: "Peak window after morning walk",
                color: "electric",
              },
              {
                day: "Yesterday",
                mood: "Calm",
                note: "Light workload, deep reading",
                color: "violet",
              },
              { day: "Thu", mood: "Energetic", note: "Workout + creative sprint", color: "coral" },
              { day: "Wed", mood: "Tired", note: "Late night, low recovery", color: "muted" },
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-surface/40 border border-white/5">
                <div className="flex items-center gap-2">
                  <Smile
                    className={`h-4 w-4 ${c.color === "coral" ? "text-coral" : c.color === "electric" ? "text-electric" : c.color === "violet" ? "text-violet" : "text-muted-foreground"}`}
                  />
                  <div className="text-sm font-medium">{c.mood}</div>
                  <div className="ml-auto text-xs text-muted-foreground">{c.day}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{c.note}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
