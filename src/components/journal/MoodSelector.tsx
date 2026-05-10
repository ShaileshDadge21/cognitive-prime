import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOOD_CONFIG, type MoodType } from "./types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MoodSelectorProps {
  value: MoodType;
  onChange: (mood: MoodType) => void;
  size?: "sm" | "md" | "lg";
}

export function MoodSelector({ value, onChange, size = "md" }: MoodSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentMood = MOOD_CONFIG[value];

  const sizeMap = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const gridCols = {
    sm: "grid-cols-4",
    md: "grid-cols-4",
    lg: "grid-cols-4",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors ${currentMood.bgColor}`}
        >
          <span className={sizeMap[size]}>{currentMood.emoji}</span>
          <span className="text-sm font-medium text-gray-700">{currentMood.label}</span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">How are you feeling?</h3>
            <p className="text-sm text-gray-600 mb-4">{currentMood.description}</p>
          </div>

          <div className={`grid ${gridCols[size]} gap-3`}>
            <AnimatePresence>
              {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => {
                const config = MOOD_CONFIG[mood];
                const isSelected = value === mood;

                return (
                  <motion.div
                    key={mood}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <button
                      onClick={() => {
                        onChange(mood);
                        setOpen(false);
                      }}
                      className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? `${config.bgColor} ring-2 ring-offset-2 ring-blue-500`
                          : `${config.bgColor} hover:ring-1 hover:ring-offset-1 hover:ring-gray-300`
                      }`}
                      title={config.label}
                    >
                      <span className="text-3xl mb-1">{config.emoji}</span>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {config.label}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Inline mood selector for quick selection
 */
interface InlineMoodSelectorProps {
  value: MoodType;
  onChange: (mood: MoodType) => void;
}

export function InlineMoodSelector({ value, onChange }: InlineMoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => {
        const config = MOOD_CONFIG[mood];
        const isSelected = value === mood;

        return (
          <motion.button
            key={mood}
            onClick={() => onChange(mood)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              isSelected
                ? `${config.bgColor} ring-2 ring-blue-500 ring-offset-2`
                : `${config.bgColor} ${config.hoverColor}`
            }`}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className="text-xs font-medium text-gray-700">{config.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
