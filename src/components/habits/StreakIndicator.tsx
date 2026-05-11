import { motion } from "framer-motion";
import { Flame, Trophy, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakIndicatorProps {
  streak: number;
  level: "common" | "uncommon" | "rare" | "epic" | "legendary";
  isActive: boolean;
  className?: string;
}

const streakConfig = {
  common: {
    icon: Flame,
    color: "text-muted-foreground",
    bgColor: "bg-surface/60",
    borderColor: "border-white/10",
    label: "Common",
  },
  uncommon: {
    icon: Flame,
    color: "text-green-300",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    label: "Uncommon",
  },
  rare: {
    icon: Star,
    color: "text-electric",
    bgColor: "bg-electric/10",
    borderColor: "border-electric/20",
    label: "Rare",
  },
  epic: {
    icon: Zap,
    color: "text-violet",
    bgColor: "bg-violet/10",
    borderColor: "border-violet/20",
    label: "Epic",
  },
  legendary: {
    icon: Trophy,
    color: "text-yellow-300",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    label: "Legendary",
  },
};

export function StreakIndicator({ streak, level, isActive, className = "" }: StreakIndicatorProps) {
  const config = streakConfig[level];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <motion.div
        animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </motion.div>

      <span className={`font-bold text-lg ${config.color}`}>{streak}</span>

      <span className={`text-xs font-medium ${config.color} opacity-75`}>{config.label}</span>

      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm"
        >
          🔥
        </motion.div>
      )}
    </motion.div>
  );
}

interface StreakHeatmapProps {
  completionHistory: Array<{ date: string; completed: boolean }>;
  className?: string;
}

export function StreakHeatmap({ completionHistory, className = "" }: StreakHeatmapProps) {
  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().slice(0, 10);
  });

  const completionMap = new Map(completionHistory.map((c) => [c.date, c.completed]));

  return (
    <Card className={`rounded-2xl border-white/10 bg-background/40 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-foreground mb-3">Last 30 Days</h3>
      <div className="grid grid-cols-10 gap-1">
        {days.map((date) => {
          const completed = completionMap.get(date);

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.5 }}
              className={`w-3 h-3 rounded-sm ${completed ? "bg-green-400" : "bg-surface-2"}`}
              title={`${date}: ${completed ? "Completed" : "Missed"}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-surface-2 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-500/50 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  className = "",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-surface-2"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="text-green-400"
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
