import { motion } from "framer-motion";
import { format, formatDistance } from "date-fns";
import { MOOD_CONFIG, ENERGY_LEVEL_MAP, STRESS_LEVEL_MAP, FOCUS_QUALITY_MAP } from "./types";
import type { JournalEntry } from "./types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface JournalTimelineProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
  loading?: boolean;
}

export function JournalTimeline({
  entries,
  onEdit,
  onDelete,
  loading = false,
}: JournalTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries yet</h3>
        <p className="text-gray-600">
          Start your cognitive journaling journey by creating your first entry.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => {
        const mood = MOOD_CONFIG[entry.mood];
        const createdDate = new Date(entry.createdAt);
        const timeAgo = formatDistance(createdDate, new Date(), {
          addSuffix: true,
        });
        const formattedDate = format(createdDate, "MMMM d, yyyy · h:mm a");

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card
              className={`p-6 border-l-4 transition-all hover:shadow-md ${mood.bgColor}`}
              style={{ borderLeftColor: mood.color.replace("text-", "rgb(") }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{mood.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-gray-600">{timeAgo}</p>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(entry)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this entry?")) {
                        onDelete(entry.id);
                      }
                    }}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-gray-700 mb-4 line-clamp-4 leading-relaxed">{entry.content}</p>

              {/* Cognitive Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Energy</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${ENERGY_LEVEL_MAP[entry.energyLevel]}%`,
                      }}
                      className="bg-green-500 h-2 rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Stress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${STRESS_LEVEL_MAP[entry.stressLevel]}%`,
                      }}
                      className="bg-red-500 h-2 rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Focus</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${FOCUS_QUALITY_MAP[entry.focusQuality]}%`,
                      }}
                      className="bg-blue-500 h-2 rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Tags and Categories */}
              <div className="flex flex-wrap gap-2">
                {entry.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs bg-gray-100">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Burnout Indicator */}
              {entry.burnoutIndicators && entry.burnoutIndicators.risk !== "low" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-2 rounded-lg text-sm flex items-center gap-2 ${
                    entry.burnoutIndicators.risk === "critical"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : entry.burnoutIndicators.risk === "high"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  <span>⚠️</span>
                  <span>
                    {entry.burnoutIndicators.risk.charAt(0).toUpperCase() +
                      entry.burnoutIndicators.risk.slice(1)}{" "}
                    burnout risk detected
                  </span>
                </motion.div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
