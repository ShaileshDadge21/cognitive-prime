import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Sparkles, Plus, Flame, Zap, Clock, GripVertical, Brain, CalendarRange } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { tasks as initialTasks, focusData } from "@/lib/mock-data";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Adaptive Planner · NeuroFlow AI" }] }),
  component: PlannerPage,
});

const hours = Array.from({ length: 12 }, (_, i) => 7 + i);
const blocks = [
  { hour: 9, span: 2, title: "Deep work · Research", energy: 92, color: "coral" },
  { hour: 11, span: 1, title: "PR reviews", energy: 64, color: "electric" },
  { hour: 13, span: 1, title: "Lunch · recovery", energy: 30, color: "violet" },
  { hour: 14, span: 2, title: "Strategy planning", energy: 80, color: "coral" },
  { hour: 16, span: 1, title: "Spanish · spaced rep", energy: 50, color: "electric" },
  { hour: 17, span: 1, title: "Wind-down + journal", energy: 25, color: "violet" },
];

function PlannerPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const buckets = {
    high: tasks.filter((t) => t.priority === "high"),
    med: tasks.filter((t) => t.priority === "med"),
    low: tasks.filter((t) => t.priority === "low"),
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Adaptive Planner"
        title="Your day, reshaped by your brain."
        subtitle="NeuroFlow rebalances tasks against your live cognitive curve, energy levels, and historical focus windows."
        actions={
          <>
            <button className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition">Today</button>
            <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Re-optimize
            </button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Adaptive timeline"
            sub="Blocks scheduled against your peak cognitive window"
            action={<span className="text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1"><Brain className="h-3 w-3" /> Peak 9–11 AM</span>}
          />
          <div className="relative">
            <div className="grid grid-cols-12 text-[10px] text-muted-foreground mb-2">
              {hours.map((h) => (
                <div key={h} className="text-center">{h}:00</div>
              ))}
            </div>
            <div className="relative h-44 rounded-2xl bg-surface/40 border border-white/5 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-12">
                {hours.map((h) => (
                  <div key={h} className="border-r border-white/5 last:border-0" />
                ))}
              </div>
              {blocks.map((b, i) => {
                const left = ((b.hour - 7) / 12) * 100;
                const width = (b.span / 12) * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`absolute top-3 bottom-3 rounded-xl px-3 py-2 border backdrop-blur-md text-xs ${
                      b.color === "coral"
                        ? "bg-coral/15 border-coral/30 text-coral"
                        : b.color === "electric"
                        ? "bg-electric/15 border-electric/30 text-electric"
                        : "bg-violet/15 border-violet/30 text-violet"
                    }`}
                    style={{ left: `${left}%`, width: `calc(${width}% - 6px)` }}
                  >
                    <div className="font-medium text-foreground truncate">{b.title}</div>
                    <div className="opacity-70 mt-1 flex items-center gap-1"><Zap className="h-3 w-3" /> {b.energy}% load</div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 h-24 -mx-2">
              <ResponsiveContainer>
                <AreaChart data={focusData}>
                  <defs>
                    <linearGradient id="energyG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="energy" stroke="var(--coral)" strokeWidth={2} fill="url(#energyG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4">
          <SectionHeader title="Cognitive load" sub="Live balance vs your capacity" />
          <div className="space-y-4">
            <Load label="Workload" value={62} color="coral" />
            <Load label="Mental complexity" value={78} color="electric" />
            <Load label="Decision fatigue" value={34} color="violet" />
            <Load label="Context switches" value={48} color="coral" />
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-coral/10 to-electric/10 border border-white/10">
            <div className="text-xs text-muted-foreground">AI suggestion</div>
            <div className="text-sm mt-1">
              Defer <span className="text-coral">2 low-energy tasks</span> to tomorrow morning to protect your peak window.
            </div>
            <button className="mt-3 text-xs px-3 py-1.5 rounded-full bg-foreground text-background">Apply</button>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12">
          <SectionHeader
            title="Priority queue"
            sub="Tasks bucketed by AI-evaluated urgency × energy match"
            action={
              <button className="text-xs px-3 py-1.5 rounded-full glass flex items-center gap-1">
                <Plus className="h-3 w-3" /> New task
              </button>
            }
          />
          <div className="grid md:grid-cols-3 gap-4">
            {(["high", "med", "low"] as const).map((bucket) => (
              <div key={bucket} className="p-4 rounded-2xl bg-surface/40 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${bucket === "high" ? "bg-coral" : bucket === "med" ? "bg-electric" : "bg-violet"}`} />
                    <span className="capitalize">{bucket} priority</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{buckets[bucket].length}</span>
                </div>
                <div className="space-y-2">
                  {buckets[bucket].map((t) => (
                    <motion.div layout key={t.id} className="p-3 rounded-xl bg-background/40 border border-white/5 group">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                          className="h-3.5 w-3.5 accent-coral"
                        />
                        <div className={`text-sm flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {t.energy}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.duration}</span>
                        <span className="flex items-center gap-1"><CalendarRange className="h-3 w-3" /> Today</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}

function Load({ label, value, color }: { label: string; value: number; color: "coral" | "electric" | "violet" }) {
  const c = color === "coral" ? "from-coral to-orange-400" : color === "electric" ? "from-electric to-cyan-400" : "from-violet to-purple-400";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${c}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
