import { motion } from "framer-motion";
import { CheckCircle, Circle, Edit, Trash2, Flame, Clock, Target, Zap } from "lucide-react";
import { HABIT_CATEGORIES, type Habit } from "./types";
import { getCognitiveTone, getBurnoutTone } from "@/components/planner/cognitive-visuals";
import { useHabitStreak, useHabitCompletion } from "./use-habits";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, date: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onComplete, onEdit, onDelete }: HabitCardProps) {
  const { streak, isOnStreak } = useHabitStreak(habit);
  const { isCompletedToday, canCompleteToday } = useHabitCompletion(habit);
  const category = HABIT_CATEGORIES[habit.category];

  const today = new Date().toISOString().slice(0, 10);

  const handleComplete = () => {
    if (canCompleteToday) {
      onComplete(habit.id, today, true);
    }
  };

  const burnoutTone = getBurnoutTone(
    habit.burnoutImpact === "critical" ? "high" : habit.burnoutImpact === "high" ? "medium" : "low",
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group overflow-hidden rounded-3xl border p-4 bg-background/40 transition duration-200 ${
        habit.burnoutImpact === "critical"
          ? "border-destructive/30 shadow-[0_0_0_1px_rgba(248,113,113,0.1)]"
          : "border-white/5"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          disabled={!canCompleteToday}
          className={`p-2 rounded-full transition-colors ${
            isCompletedToday
              ? "bg-coral text-white"
              : canCompleteToday
                ? "bg-surface/60 hover:bg-surface/80 text-muted-foreground"
                : "bg-surface/40 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          {isCompletedToday ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </motion.button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-lg font-semibold line-clamp-1 ${
                isCompletedToday ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {habit.title}
            </h3>
            <span className="text-sm text-muted-foreground">{category.emoji}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${getCognitiveTone(habit.consistencyScore)}`}
            >
              <Target className="h-3 w-3" /> {habit.consistencyScore}% consistency
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${burnoutTone}`}
            >
              {habit.burnoutImpact.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(habit)}
            className="p-2 rounded-lg bg-surface/50 hover:bg-surface/70 transition-colors"
            title="Edit habit"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm("Are you sure you want to delete this habit?")) {
                onDelete(habit.id);
              }
            }}
            className="p-2 rounded-lg bg-surface/50 hover:bg-destructive/20 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      <div className="grid gap-2 text-[11px] mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Flame className="h-3 w-3" /> Streak: {streak}
            {isOnStreak && <span className="animate-pulse">🔥</span>}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {habit.frequency}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3" /> {habit.cognitiveDifficulty}
          </span>
        </div>

        {habit.notes && (
          <div className="rounded-2xl border border-white/10 bg-surface/50 px-3 py-2 text-[11px] text-muted-foreground">
            {habit.notes}
          </div>
        )}
      </div>

      {habit.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {habit.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] bg-surface/60 border border-white/10 text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {habit.tags.length > 3 && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] bg-surface/60 border border-white/10 text-muted-foreground">
              +{habit.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
