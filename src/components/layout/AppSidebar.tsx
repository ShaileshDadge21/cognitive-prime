import { Link } from "@tanstack/react-router";
import { Brain, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { appNavItems } from "@/components/layout/nav-items";

type AppSidebarProps = {
  collapsed: boolean;
  path: string;
  onToggleCollapse: () => void;
};

export function AppSidebar({ collapsed, path, onToggleCollapse }: AppSidebarProps) {
  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-[252px]"} shrink-0 transition-all duration-300 border-r border-white/5 bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen flex-col hidden md:flex`}
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {!collapsed ? (
          <Logo to="/app" />
        ) : (
          <Link to="/app" className="mx-auto p-1.5 rounded-lg hover:bg-white/5 transition">
            <Brain className="h-5 w-5 text-coral" />
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/5 transition"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {appNavItems.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition relative ${
                active
                  ? "bg-white/5 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-coral glow-coral"
                />
              )}
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
          <button className="mt-3 w-full py-2 rounded-lg bg-foreground text-background text-xs font-medium">
            Upgrade
          </button>
        </div>
      )}
    </aside>
  );
}
