import { Bell, Menu, Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { appNavItems } from "@/components/layout/nav-items";
import { Logo } from "@/components/Logo";
import type { ReactNode } from "react";

type AppTopbarProps = {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  path: string;
};

export function AppTopbar({
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  path,
}: AppTopbarProps) {
  return (
    <>
      <header className="h-16 border-b border-white/5 px-4 md:px-6 flex items-center gap-3 md:gap-4 bg-background/40 backdrop-blur-xl sticky top-0 z-30">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden h-9 w-9 rounded-xl bg-surface/60 border border-white/5 flex items-center justify-center hover:bg-white/5 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Ask NeuroFlow anything..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface/60 border border-white/5 text-sm focus:outline-none focus:border-coral/40 transition"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Pill
            icon={<span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse-glow" />}
            label="Focus mode"
          />
          <Pill label="Cognitive 86" highlight />
          <Pill label="3 AI tips" accent />
          <button className="relative h-9 w-9 rounded-xl bg-surface/60 border border-white/5 flex items-center justify-center hover:bg-white/5 transition">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-coral" />
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral via-violet to-electric" />
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-background/90 backdrop-blur-xl border-r border-white/10">
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
            <Logo to="/app" />
            <button
              onClick={onCloseMobileMenu}
              className="h-9 w-9 rounded-xl bg-surface/60 border border-white/5 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
            {appNavItems.map((item) => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobileMenu}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                    active
                      ? "bg-white/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-coral" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}

function Pill({
  icon,
  label,
  highlight,
  accent,
}: {
  icon?: ReactNode;
  label: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition ${
        highlight
          ? "border-coral/30 bg-coral/10 text-coral"
          : accent
            ? "border-electric/30 bg-electric/10 text-electric"
            : "border-white/10 bg-surface/60 text-muted-foreground"
      }`}
    >
      {icon} {label}
    </div>
  );
}
