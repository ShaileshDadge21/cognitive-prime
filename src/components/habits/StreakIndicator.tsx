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
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    label: "Common",
  },
  uncommon: {
    icon: Flame,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    label: "Uncommon",
  },
  rare: {
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    label: "Rare",
  },
  epic: {
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    label: "Epic",
  },
  legendary: {
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
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
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Last 30 Days</h3>
      <div className="grid grid-cols-10 gap-1">
        {days.map((date) => {
          const completed = completionMap.get(date);
          const intensity = completed ? 1 : 0;

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.5 }}
              className={`w-3 h-3 rounded-sm ${completed ? "bg-green-500" : "bg-gray-200"}`}
              title={`${date}: ${completed ? "Completed" : "Missed"}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-300 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
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
          className="text-gray-200"
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
          className="text-green-500"
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
