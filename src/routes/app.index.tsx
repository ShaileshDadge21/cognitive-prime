import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar, BarChart, Bar, LineChart, Line, CartesianGrid
} from "recharts";
import {
  Sparkles, Send, Play, Pause, Plus, GripVertical, Flame, Zap,
  TrendingUp, Brain, ArrowUpRight, Coffee, Waves
} from "lucide-react";
import { useState } from "react";
import { focusData, tasks as initialTasks, habits, moodOptions, aiMessages } from "@/lib/mock-data";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <Greeting />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <CognitiveScoreCard />
          <div className="grid md:grid-cols-2 gap-6">
            <FocusTimer />
            <MoodTracker />
          </div>
          <AdaptivePlanner />
          <ProductivityAnalytics />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <AIAssistant />
          <DeepWorkCard />
          <HabitPanel />
          <CognitiveLoadCard />
          <LearningPanel />
        </div>
      </div>
    </div>
  );
}

function Greeting() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-sm text-muted-foreground">Saturday · May 9</div>
        <h1 className="font-display text-4xl mt-1 tracking-tight">Good morning, Abdo.</h1>
        <p className="text-muted-foreground mt-1">Your peak cognitive window starts in <span className="text-coral">42 minutes</span>.</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition">View report</button>
        <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium">Plan my day</button>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-6 shadow-soft ${className}`}>{children}</div>;
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-display text-lg tracking-tight">{title}</h3>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function CognitiveScoreCard() {
  const metrics = [
    { label: "Cognitive Efficiency", value: 86, color: "var(--coral)", icon: Brain },
    { label: "Mental Energy", value: 72, color: "var(--electric)", icon: Zap },
    { label: "Focus Capacity", value: 91, color: "var(--violet)", icon: TrendingUp },
    { label: "Fatigue Level", value: 28, color: "oklch(0.7 0.15 60)", icon: Waves },
  ];
  return (
    <Card>
      <CardHeader title="Cognitive overview" sub="Live signals from the last 24 hours"
        action={<span className="text-xs px-2 py-1 rounded-full bg-coral/15 text-coral">Optimal</span>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="relative">
            <div className="aspect-square">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ value: m.value, fill: m.color }]} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: "var(--surface-2)" } as object} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <m.icon className="h-4 w-4 text-muted-foreground mb-1" />
                <div className="font-display text-2xl">{m.value}</div>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">{m.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FocusTimer() {
  const [running, setRunning] = useState(false);
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-coral/15 blur-3xl" />
      <CardHeader title="Focus timer" sub="Deep work · session 2 of 4" />
      <div className="relative flex flex-col items-center py-4">
        <div className="relative h-48 w-48">
          <div className={`absolute inset-0 rounded-full border-2 border-dashed border-coral/30 ${running ? "animate-spin" : ""}`} style={{ animationDuration: "20s" }} />
          <div className={`absolute inset-3 rounded-full bg-gradient-to-br from-coral/20 to-electric/20 ${running ? "animate-breathe" : ""}`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Breathe</div>
            <div className="font-display text-5xl mt-1">25:00</div>
            <div className="text-xs text-muted-foreground mt-1">until break</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => setRunning(!running)} className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button className="h-12 px-5 rounded-full glass text-sm flex items-center gap-2"><Coffee className="h-4 w-4" /> Take break</button>
        </div>
      </div>
    </Card>
  );
}

function MoodTracker() {
  const [mood, setMood] = useState("focused");
  return (
    <Card>
      <CardHeader title="How do you feel?" sub="The system adapts to your state" />
      <div className="grid grid-cols-5 gap-2">
        {moodOptions.map((m) => {
          const active = mood === m.id;
          return (
            <button key={m.id} onClick={() => setMood(m.id)}
              className={`relative aspect-square rounded-2xl border transition flex items-center justify-center ${
                active ? "border-coral/60 bg-coral/10" : "border-white/5 bg-surface/40 hover:bg-white/5"
              }`}>
              <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${
                m.id === "energetic" ? "from-coral to-orange-400" :
                m.id === "focused" ? "from-electric to-cyan-400" :
                m.id === "calm" ? "from-violet to-purple-400" :
                m.id === "tired" ? "from-muted to-slate-500" :
                "from-destructive to-red-400"
              } ${active ? "animate-pulse-glow" : ""}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-muted-foreground text-center capitalize">Currently feeling: <span className="text-foreground">{mood}</span></div>
      <div className="mt-4 h-20">
        <ResponsiveContainer>
          <AreaChart data={focusData}>
            <defs>
              <linearGradient id="moodG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="energy" stroke="var(--violet)" strokeWidth={2} fill="url(#moodG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function AdaptivePlanner() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <Card>
      <CardHeader title="Adaptive planner" sub="Reordered by energy curve · updated 2m ago"
        action={<button className="text-xs px-3 py-1.5 rounded-full bg-coral/15 text-coral flex items-center gap-1"><Sparkles className="h-3 w-3" /> Re-optimize</button>} />
      <div className="space-y-2">
        {tasks.map((t) => (
          <motion.div key={t.id} layout
            className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-white/5 hover:border-white/15 transition group">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition cursor-grab" />
            <input type="checkbox" checked={t.done} onChange={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-coral" />
            <div className="flex-1">
              <div className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Flame className={`h-3 w-3 ${t.priority === "high" ? "text-coral" : t.priority === "med" ? "text-electric" : ""}`} /> {t.priority}</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {t.energy} energy</span>
                <span>{t.duration}</span>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded-md bg-white/5">Defer</button>
          </motion.div>
        ))}
      </div>
      <button className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground hover:bg-white/5 transition flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" /> Add task
      </button>
    </Card>
  );
}

function ProductivityAnalytics() {
  const heatmap = Array.from({ length: 7 * 12 }, (_, i) => ({ i, v: Math.random() }));
  return (
    <Card>
      <CardHeader title="Productivity analytics" sub="Patterns across the week"
        action={<button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></button>} />
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2">Focus vs fatigue</div>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="focus" stroke="var(--coral)" strokeWidth={2} dot={{ r: 3, fill: "var(--coral)" }} />
                <Line type="monotone" dataKey="fatigue" stroke="var(--electric)" strokeWidth={2} dot={{ r: 3, fill: "var(--electric)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Cognitive heatmap · 12 weeks</div>
          <div className="grid grid-cols-12 gap-1">
            {heatmap.map((c) => (
              <div key={c.i} className="aspect-square rounded-sm"
                style={{ background: `color-mix(in oklab, var(--coral) ${Math.round(c.v * 100)}%, var(--surface-2))` }} />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
            <span>Less</span>
            <div className="flex gap-1">
              {[10, 30, 60, 90].map(v => <div key={v} className="h-3 w-3 rounded-sm" style={{ background: `color-mix(in oklab, var(--coral) ${v}%, var(--surface-2))` }} />)}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AIAssistant() {
  const [input, setInput] = useState("");
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-electric/15 blur-3xl" />
      <CardHeader title="AI assistant" sub="Cognitive coach · always on"
        action={<span className="text-xs px-2 py-0.5 rounded-full bg-electric/15 text-electric flex items-center gap-1"><Sparkles className="h-3 w-3" /> Live</span>} />
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {aiMessages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              m.from === "user" ? "bg-foreground text-background rounded-br-md" : "bg-surface/70 border border-white/5 rounded-bl-md"
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["What should I study now?", "Am I overloaded?", "Optimize schedule"].map(s => (
          <button key={s} className="text-xs px-3 py-1 rounded-full bg-surface/60 border border-white/5 hover:bg-white/5 transition">{s}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setInput(""); }} className="mt-3 flex items-center gap-2 p-2 rounded-2xl bg-surface/60 border border-white/10 focus-within:border-coral/40 transition">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" className="flex-1 bg-transparent px-2 text-sm focus:outline-none" />
        <button className="h-8 w-8 rounded-full bg-coral text-background flex items-center justify-center"><Send className="h-3.5 w-3.5" /></button>
      </form>
    </Card>
  );
}

function DeepWorkCard() {
  return (
    <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[oklch(0.12_0.01_270)] to-[oklch(0.18_0.02_270)] border border-white/5 shadow-elevated overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <CardHeader title="Deep work" sub="Distraction-free since 9:14 AM" />
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Sessions" value="14" />
          <Stat label="Avg span" value="42m" />
          <Stat label="Peak hour" value="10AM" />
        </div>
        <div className="mt-4 h-20">
          <ResponsiveContainer>
            <BarChart data={focusData}>
              <Bar dataKey="focus" fill="var(--coral)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl mt-0.5">{value}</div>
    </div>
  );
}

function HabitPanel() {
  return (
    <Card>
      <CardHeader title="Habits" sub="Reinforcement score 88/100" />
      <div className="space-y-3">
        {habits.map((h) => (
          <div key={h.name}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-coral" /> {h.name}
              </div>
              <div className="text-xs text-muted-foreground">{h.streak}d</div>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-coral to-electric transition-all" style={{ width: `${h.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CognitiveLoadCard() {
  const wave = Array.from({ length: 40 }, (_, i) => ({ i, v: 50 + Math.sin(i / 3) * 30 + Math.random() * 10 }));
  return (
    <Card>
      <CardHeader title="Cognitive load" sub="Burnout risk: low"
        action={<span className="text-xs px-2 py-0.5 rounded-full bg-violet/15 text-violet">Balanced</span>} />
      <div className="h-24 -mx-2">
        <ResponsiveContainer>
          <AreaChart data={wave}>
            <defs>
              <linearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="var(--violet)" strokeWidth={2} fill="url(#wave)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
        <div>Workload <div className="text-foreground text-sm mt-0.5">62%</div></div>
        <div>Pressure <div className="text-foreground text-sm mt-0.5">Med</div></div>
        <div>Complexity <div className="text-foreground text-sm mt-0.5">High</div></div>
      </div>
    </Card>
  );
}

function LearningPanel() {
  return (
    <Card>
      <CardHeader title="Learning" sub="Spaced repetition · retention 84%" />
      <div className="space-y-2">
        {[
          { t: "Neuroplasticity basics", d: "Review in 2h", p: 86 },
          { t: "Spanish · subjunctive", d: "Due now", p: 42 },
          { t: "System design", d: "Tomorrow", p: 70 },
        ].map((x) => (
          <div key={x.t} className="p-3 rounded-xl bg-surface/50 border border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span>{x.t}</span>
              <span className="text-xs text-muted-foreground">{x.d}</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full bg-electric" style={{ width: `${x.p}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
