import {
  LayoutDashboard,
  CalendarRange,
  Sparkles,
  Focus,
  BarChart3,
  Heart,
  BookOpen,
  Target,
  NotebookPen,
  Settings,
} from "lucide-react";

type AppNavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export const appNavItems: AppNavItem[] = [
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
