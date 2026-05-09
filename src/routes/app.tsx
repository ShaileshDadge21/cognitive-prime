import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarRange, Sparkles, Focus, BarChart3,
  Heart, BookOpen, Target, NotebookPen, Settings, Search, Bell,
  ChevronLeft, Brain
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard · NeuroFlow AI" }, { name: "description", content: "Your cognitive operating system." }] }),
  component: AppLayout,
});

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/planner", label: "Adaptive Planner", icon: CalendarRange },
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/focus", label: "Deep Work", icon: Focus },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/mood", label: "Mood Tracking", icon: Heart },
  { to: "/app/learning", label: "Learning Hub", icon: BookOpen },
  { to: "/app/habits", label: "Habits", icon: Target },
  { to: "/app/journal", label: "Journal", icon: NotebookPen },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-[72px]" : "w-[252px]"} shrink-0 transition-all duration-300 border-r border-white/5 bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen flex flex-col`}>
        <div className="h-16 px-4 flex items-center justify-between">
          {!collapsed ? <Logo to="/app" /> : <div className="mx-auto"><Brain className="h-5 w-5 text-coral" /></div>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-white/5 transition">
            <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition relative ${
                  active ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}>
                {active && <motion.div layoutId="active-pill" className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-coral glow-coral" />}
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-coral" : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="m-3 p-4 rounded-2xl bg-gradient-to-br from-coral/15 to-electric/15 border border-white/10">
            <div className="text-xs text-muted-foreground">Cognitive Pro</div>
            <div className="text-sm font-medium mt-0.5">Unlock deep insights</div>
            <button className="mt-3 w-full py-2 rounded-lg bg-foreground text-background text-xs font-medium">Upgrade</button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="h-16 border-b border-white/5 px-6 flex items-center gap-4 bg-background/40 backdrop-blur-xl sticky top-0 z-30">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Ask NeuroFlow anything…" className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface/60 border border-white/5 text-sm focus:outline-none focus:border-coral/40 transition" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Pill icon={<span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse-glow" />} label="Focus mode" />
        <Pill label="Cognitive 86" highlight />
        <Pill label="3 AI tips" accent />
        <button className="relative h-9 w-9 rounded-xl bg-surface/60 border border-white/5 flex items-center justify-center hover:bg-white/5 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-coral" />
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral via-violet to-electric" />
      </div>
    </header>
  );
}

function Pill({ icon, label, highlight, accent }: { icon?: React.ReactNode; label: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition ${
      highlight ? "border-coral/30 bg-coral/10 text-coral"
      : accent ? "border-electric/30 bg-electric/10 text-electric"
      : "border-white/10 bg-surface/60 text-muted-foreground"
    }`}>
      {icon} {label}
    </div>
  );
}
