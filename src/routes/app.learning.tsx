import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { BookOpen, Brain, Sparkles, Clock, ArrowUpRight, Layers } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";

export const Route = createFileRoute("/app/learning")({
  head: () => ({ meta: [{ title: "Learning Hub · NeuroFlow AI" }] }),
  component: LearningPage,
});

const retention = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  retention: 100 - i * 4 + Math.sin(i) * 6,
  reviewed: 100 - i * 2 + Math.cos(i) * 4,
}));

const queue = [
  { t: "Neuroplasticity · principles", deck: "Neuroscience", due: "Now", retention: 42, urgency: "high" },
  { t: "Spanish · subjunctive mood", deck: "Languages", due: "Now", retention: 56, urgency: "high" },
  { t: "System design · sharding", deck: "Engineering", due: "In 2h", retention: 71, urgency: "med" },
  { t: "Stoic letters · Letter 7", deck: "Philosophy", due: "Tomorrow", retention: 84, urgency: "low" },
  { t: "React 19 · Suspense", deck: "Engineering", due: "Tomorrow", retention: 78, urgency: "low" },
];

const recommendations = [
  { t: "Deep work fundamentals", a: "Cal Newport", min: 28, tag: "Focus", color: "coral" },
  { t: "Spaced repetition explained", a: "NeuroFlow Lab", min: 12, tag: "Memory", color: "electric" },
  { t: "Cognitive load theory", a: "John Sweller", min: 18, tag: "Learning", color: "violet" },
];

function LearningPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Learning Hub"
        title="Learn the way your brain remembers."
        subtitle="Adaptive spaced repetition, retention forecasting, and AI-curated study paths personalized to your cognitive profile."
        actions={
          <>
            <button className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition">My decks</button>
            <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" /> Start review
            </button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <Stat icon={Layers} label="Active decks" value="12" sub="3 mastered" />
        <Stat icon={BookOpen} label="Cards reviewed" value="1,284" sub="+86 today" />
        <Stat icon={Brain} label="Retention" value="84%" sub="14-day avg" />
        <Stat icon={Clock} label="Streak" value="41d" sub="Personal best" />

        <GlassCard className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Forgetting curve"
            sub="Predicted retention vs scheduled reviews · next 14 days"
            action={<span className="text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1"><Sparkles className="h-3 w-3" /> Optimized</span>}
          />
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={retention}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="retention" stroke="var(--coral)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="reviewed" stroke="var(--electric)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4">
          <SectionHeader title="Daily reviews" sub="Last 7 days" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={[
                { d: "Mon", v: 84 }, { d: "Tue", v: 122 }, { d: "Wed", v: 98 },
                { d: "Thu", v: 140 }, { d: "Fri", v: 76 }, { d: "Sat", v: 52 }, { d: "Sun", v: 86 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--violet)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-7">
          <SectionHeader
            title="Review queue"
            sub="Cards ranked by predicted retention drop"
            action={<button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">All decks <ArrowUpRight className="h-3 w-3" /></button>}
          />
          <div className="space-y-2">
            {queue.map((q, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-white/5 hover:border-white/15 transition">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                  q.urgency === "high" ? "bg-coral/15 text-coral" : q.urgency === "med" ? "bg-electric/15 text-electric" : "bg-violet/15 text-violet"
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{q.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{q.deck} · due {q.due}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Retention</div>
                  <div className="text-sm font-medium">{q.retention}%</div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background">Review</button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-5">
          <SectionHeader
            title="Adaptive recommendations"
            sub="Curated by your cognitive profile"
            action={<span className="text-xs px-2 py-0.5 rounded-full bg-electric/15 text-electric flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI</span>}
          />
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-surface/40 border border-white/5 hover:border-white/15 transition group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${
                    r.color === "coral" ? "from-coral to-orange-400" : r.color === "electric" ? "from-electric to-cyan-400" : "from-violet to-purple-400"
                  } flex items-center justify-center shrink-0`}>
                    <BookOpen className="h-4 w-4 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{r.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.a} · {r.min} min</div>
                    <div className="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5">{r.tag}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub: string }) {
  return (
    <GlassCard className="col-span-6 lg:col-span-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-coral/20 to-electric/20 border border-white/10 flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-2xl">{value}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-3">{sub}</div>
    </GlassCard>
  );
}
