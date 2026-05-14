/**
 * Focus Timer Component
 * Immersive deep work session timer with Framer Motion animations
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Square } from "lucide-react";

interface FocusTimerProps {
  elapsedSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  progress: number;
  pauseCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStop: () => void;
}

export function FocusTimer({
  elapsedSeconds,
  totalSeconds,
  isRunning,
  isPaused,
  remainingSeconds,
  progress,
  pauseCount,
  onStart,
  onPause,
  onResume,
  onReset,
  onStop,
}: FocusTimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const timeString = useMemo(
    () => `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    [minutes, seconds],
  );

  // Color based on time remaining and pause count
  const getTimerColor = () => {
    if (pauseCount > 2) return "from-red-500 to-red-600";
    if (remainingSeconds < 60) return "from-orange-500 to-orange-600";
    return "from-violet-500 to-violet-600";
  };

  const getProgressColor = () => {
    if (pauseCount > 2) return "rgb(239, 68, 68)";
    if (remainingSeconds < 60) return "rgb(249, 115, 22)";
    return "rgb(139, 92, 246)";
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Animated background glow */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTimerColor()} opacity-10 blur-3xl`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Outer ring - progress indicator */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getProgressColor()}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ rotate: -90 }}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`text-6xl md:text-7xl font-bold bg-gradient-to-br ${getTimerColor()} bg-clip-text text-transparent font-mono`}
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.6, repeat: isRunning ? Infinity : 0 }}
          >
            {timeString}
          </motion.div>

          {/* Pause counter indicator */}
          {pauseCount > 0 && (
            <motion.div
              className="mt-4 text-sm text-amber-400 font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {pauseCount} pause{pauseCount !== 1 ? "s" : ""}
            </motion.div>
          )}

          {/* Status indicator */}
          {isPaused && (
            <motion.div
              className="mt-2 flex items-center gap-2 text-muted-foreground"
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs uppercase tracking-wide">Paused</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-4">
        {!isRunning && !isPaused ? (
          <motion.button
            onClick={onStart}
            className="group relative px-8 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5 fill-current" />
            Start Focus
          </motion.button>
        ) : null}

        {isRunning && !isPaused ? (
          <>
            <motion.button
              onClick={onPause}
              className="px-6 py-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/50 font-semibold flex items-center gap-2 hover:bg-amber-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
            <motion.button
              onClick={onStop}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 font-semibold flex items-center gap-2 hover:bg-red-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5" />
              End
            </motion.button>
          </>
        ) : null}

        {isPaused ? (
          <>
            <motion.button
              onClick={onResume}
              className="px-6 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/50 font-semibold flex items-center gap-2 hover:bg-green-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 fill-current" />
              Resume
            </motion.button>
            <motion.button
              onClick={onStop}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 font-semibold flex items-center gap-2 hover:bg-red-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5" />
              End
            </motion.button>
          </>
        ) : null}

        {elapsedSeconds > 0 && !isRunning && (
          <motion.button
            onClick={onReset}
            className="px-6 py-3 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-500/50 font-semibold flex items-center gap-2 hover:bg-slate-500/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </motion.button>
        )}
      </div>

      {/* Session info */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-sm text-muted-foreground">Elapsed</div>
          <div className="text-xl font-semibold mt-1">
            {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
            {String(elapsedSeconds % 60).padStart(2, "0")}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-xl font-semibold mt-1">
            {String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:00
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="text-xl font-semibold mt-1">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
}
