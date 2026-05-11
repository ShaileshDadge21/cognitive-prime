import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Activity,
  Heart,
  Target,
  BookOpen,
  Gauge,
  Waves,
  ArrowRight,
  Play,
  Check,
  Star,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { focusData } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroFlow AI — Train Your Mind. Optimize Your Life." },
      {
        name: "description",
        content:
          "Adaptive AI productivity system inspired by cognitive science. Focus regulation, fatigue awareness, intelligent prioritization.",
      },
      { property: "og:title", content: "NeuroFlow AI" },
      {
        property: "og:description",
        content:
          "An adaptive AI productivity system inspired by cognitive science and brain behavior.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "Adaptive Cognitive Planner",
    desc: "Reorders your day around energy peaks and recovery windows.",
  },
  {
    icon: Gauge,
    title: "Fatigue-Aware Focus Engine",
    desc: "Detects mental drift and adapts session intensity in real time.",
  },
  {
    icon: Heart,
    title: "Emotion-Adaptive Scheduling",
    desc: "Mood-aware planning that respects how you actually feel.",
  },
  {
    icon: Sparkles,
    title: "AI Decision Assistant",
    desc: "Conversational coach that prioritizes, defers and protects focus.",
  },
  {
    icon: Activity,
    title: "Neural Productivity Analytics",
    desc: "Patterns across focus, recovery and cognitive throughput.",
  },
  {
    icon: Target,
    title: "Habit Reinforcement",
    desc: "Adaptive streak system tuned to your behavioral signals.",
  },
  {
    icon: Waves,
    title: "Cognitive Load Balancing",
    desc: "Brainwave-style visualizations prevent burnout before it starts.",
  },
  {
    icon: BookOpen,
    title: "Deep Work Optimization",
    desc: "Spaced repetition and retention scoring for compounding learning.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-4 inset-x-4 z-50 flex justify-center">
        <nav className="glass-strong rounded-full px-3 py-2 flex items-center gap-2 max-w-3xl w-full shadow-soft">
          <div className="px-3">
            <Logo />
          </div>
          <div className="hidden md:flex items-center gap-1 ml-4 text-sm text-muted-foreground">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition"
            >
              Features
            </a>
            <a
              href="#how"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition"
            >
              How it works
            </a>
            <a
              href="#analytics"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition"
            >
              Analytics
            </a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="px-4 py-1.5 text-sm rounded-full hover:bg-white/5 transition"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              search={{ redirect: undefined }}
              className="px-4 py-1.5 text-sm rounded-full bg-foreground text-background font-medium hover:opacity-90 transition"
            >
              Start free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <NeuralBg />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse-glow" />
              Cognitive OS · v1.0 now in private beta
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1.02]">
              Train your mind.
              <br />
              <span className="text-gradient">Optimize your life.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              An adaptive AI productivity system inspired by cognitive science and brain behavior —
              your second prefrontal cortex.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                to="/signup"
                search={{ redirect: undefined }}
                className="group px-6 py-3 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:scale-[1.02] transition"
              >
                Get started{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
              <button className="px-6 py-3 rounded-full glass flex items-center gap-2 hover:bg-white/5 transition">
                <Play className="h-4 w-4" /> Watch demo
              </button>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-r from-coral/20 via-electric/20 to-violet/20 blur-3xl opacity-50" />
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Brain-inspired modules"
            title="Cognitive infrastructure for deep workers"
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative p-6 rounded-2xl glass hover:border-white/20 transition cursor-default overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-coral/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-coral/20 transition">
                    <f.icon className="h-5 w-5 text-coral" />
                  </div>
                  <h3 className="font-medium text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 h-12 opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={focusData}>
                        <Line
                          type="monotone"
                          dataKey="focus"
                          stroke="var(--coral)"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="How it works" title="Three steps. Continuous adaptation." />
          <div className="mt-16 grid md:grid-cols-3 gap-4 relative">
            {[
              {
                n: "01",
                t: "Analyze behavior",
                d: "Continuous signals: focus, fatigue, mood, time-of-day patterns.",
              },
              {
                n: "02",
                t: "Adapt workflow",
                d: "Schedule, breaks and priorities re-balance every few minutes.",
              },
              {
                n: "03",
                t: "Optimize productivity",
                d: "Reinforced habits, deeper focus, measurable cognitive gains.",
              },
            ].map((s) => (
              <div key={s.n} className="p-8 rounded-2xl glass relative overflow-hidden">
                <div className="text-xs text-coral font-mono">{s.n}</div>
                <h3 className="mt-3 text-xl font-medium">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-electric/10 blur-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics showcase */}
      <section id="analytics" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="Neural analytics" title="See your cognitive patterns" />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-6 rounded-2xl glass">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Focus hours · this week</div>
                  <div className="text-3xl font-display mt-1">
                    36.3<span className="text-sm text-muted-foreground"> hrs</span>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-coral/15 text-coral">+12%</div>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={focusData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="focus"
                      stroke="var(--coral)"
                      strokeWidth={2}
                      fill="url(#g1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-6 rounded-2xl glass flex flex-col">
              <div className="text-xs text-muted-foreground">Cognitive score</div>
              <div className="text-3xl font-display mt-1">86</div>
              <div className="flex-1 -mx-2">
                <ResponsiveContainer>
                  <RadialBarChart
                    innerRadius="50%"
                    outerRadius="100%"
                    data={[{ name: "score", value: 86, fill: "var(--coral)" }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background={{ fill: "var(--surface-2)" } as object}
                      dataKey="value"
                      cornerRadius={20}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground -mt-4">Peak window: 9–11 AM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Loved by deep workers"
            title="Built for builders, scientists, and creatives"
          />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            {[
              {
                n: "Lena Park",
                r: "ML Researcher, Stanford",
                q: "It's the first tool that respects how my brain actually works across a week.",
              },
              {
                n: "Marc Whitfield",
                r: "Founder, Atlas Labs",
                q: "Like having a chief of staff for my prefrontal cortex.",
              },
              {
                n: "Aïsha Diallo",
                r: "Author & Speaker",
                q: "Quietly intelligent. Removed every interruption I didn't know I had.",
              },
            ].map((t) => (
              <div key={t.n} className="p-6 rounded-2xl glass">
                <div className="flex gap-0.5 text-coral">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">"{t.q}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral to-electric" />
                  <div>
                    <div className="text-sm font-medium">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl p-16 md:p-24 text-center glass-strong">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/30 via-transparent to-electric/30 opacity-60" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              Your mind, upgraded.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join the waitlist for the cognitive operating system designed around how humans
              actually focus.
            </p>
            <Link
              to="/signup"
              search={{ redirect: undefined }}
              className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-foreground text-background font-medium hover:scale-[1.02] transition"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-coral" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-coral" /> 14-day trial
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo />
          <div>© 2026 NeuroFlow AI · Made for deep workers</div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-[0.2em] text-coral">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">{title}</h2>
    </div>
  );
}

function NeuralBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none"
      viewBox="0 0 800 600"
    >
      {Array.from({ length: 20 }).map((_, i) => {
        const x1 = (i * 47) % 800,
          y1 = (i * 83) % 600;
        const x2 = ((i + 3) * 71) % 800,
          y2 = ((i + 5) * 53) % 600;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" />;
      })}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 53) % 800}
          cy={(i * 67) % 600}
          r="2"
          fill="var(--coral)"
          opacity={0.6}
        />
      ))}
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div className="relative rounded-3xl glass-strong p-2 shadow-elevated">
      <div className="rounded-2xl bg-background/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted-foreground">Welcome back</div>
            <div className="font-display text-2xl mt-1">Cognitive overview</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full glass text-xs flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse-glow" /> Peak window
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <MiniStat label="Cognitive score" value="86" accent="coral" />
          <MiniStat label="Focus hours" value="6.4" accent="electric" />
          <MiniStat label="Recovery" value="92%" accent="violet" />
        </div>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 p-5 rounded-2xl bg-surface/60 border border-white/5 h-48">
            <div className="text-xs text-muted-foreground">Focus pattern · 7 days</div>
            <div className="h-36 -mx-2 mt-1">
              <ResponsiveContainer>
                <AreaChart data={focusData}>
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--electric)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--electric)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="focus"
                    stroke="var(--electric)"
                    strokeWidth={2}
                    fill="url(#hg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-coral/20 to-violet/20 border border-white/10 h-48 flex flex-col justify-between">
            <div className="text-xs text-muted-foreground">AI suggestion</div>
            <div className="text-sm leading-relaxed">
              Defer 2 low-priority tasks. Your fatigue trend is rising — protect 3:00 PM for shallow
              work only.
            </div>
            <button className="self-start text-xs px-3 py-1.5 rounded-full bg-foreground text-background">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "coral" | "electric" | "violet";
}) {
  const colors = { coral: "text-coral", electric: "text-electric", violet: "text-violet" };
  return (
    <div className="p-5 rounded-2xl bg-surface/60 border border-white/5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-3xl font-display mt-2 ${colors[accent]}`}>{value}</div>
    </div>
  );
}
