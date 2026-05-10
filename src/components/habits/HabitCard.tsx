import { motion } from "framer-motion";
import { CheckCircle, Circle, Plus, X } from "lucide-react";
import { HABIT_CATEGORIES, type Habit } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabitStreak, useHabitCompletion } from "./use-habits";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, date: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onComplete, onEdit, onDelete }: HabitCardProps) {
  const { streak, isOnStreak, streakLevel } = useHabitStreak(habit);
  const { isCompletedToday, canCompleteToday } = useHabitCompletion(habit);
  const category = HABIT_CATEGORIES[habit.category];

  const today = new Date().toISOString().slice(0, 10);

  const handleComplete = () => {
    if (canCompleteToday) {
      onComplete(habit.id, today, true);
    }
  };

  const streakColors: Record<"common" | "uncommon" | "rare" | "epic" | "legendary", string> = {
    common: "text-gray-500",
    uncommon: "text-green-500",
    rare: "text-blue-500",
    epic: "text-purple-500",
    legendary: "text-yellow-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-6 transition-all hover:shadow-lg ${
          isCompletedToday ? "bg-green-50 border-green-200" : "bg-white"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                disabled={!canCompleteToday}
                className={`p-2 rounded-full transition-colors ${
                  isCompletedToday
                    ? "bg-green-500 text-white"
                    : canCompleteToday
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isCompletedToday ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </motion.button>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{habit.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={category.color}>
                    {category.label}
                  </Badge>
                  <span className="text-sm text-gray-500 capitalize">{habit.frequency}</span>
                </div>
              </div>
            </div>

            {habit.notes && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{habit.notes}</p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(habit)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit habit"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (confirm("Are you sure you want to delete this habit?")) {
                  onDelete(habit.id);
                }
              }}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete habit"
            >
              <X className="w-4 h-4 text-red-600" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Streak:</span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-lg font-bold ${streakColors[streakLevel as keyof typeof streakColors]}`}
                >
                  {streak}
                </span>
                {isOnStreak && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-sm"
                  >
                    🔥
                  </motion.span>
                )}
              </div>
            </div>

            {/* Consistency Score */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Consistency:</span>
              <span className="text-sm font-medium text-gray-900">{habit.consistencyScore}%</span>
            </div>
          </div>

          {/* Tags */}
          {habit.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {habit.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {habit.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{habit.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Burnout Warning */}
        {(habit.burnoutImpact === "high" || habit.burnoutImpact === "critical") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-2 rounded-lg text-sm flex items-center gap-2 ${
              habit.burnoutImpact === "critical"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-orange-100 text-orange-700 border border-orange-200"
            }`}
          >
            <span>⚠️</span>
            <span>
              {habit.burnoutImpact.charAt(0).toUpperCase() + habit.burnoutImpact.slice(1)} burnout
              impact - monitor closely
            </span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
