import { motion } from "framer-motion";
import { CalendarRange, Clock, Flame, GripVertical, Plus } from "lucide-react";
import { useMemo } from "react";
import type { DragEvent } from "react";
import { SectionHeader } from "@/components/PageShell";
import type { PlannerTask } from "@/components/planner/types";
import { getBurnoutTone, getCognitiveTone, getFocusTone } from "@/components/planner/cognitive-visuals";

type PlannerTaskBoardProps = {
  tasks: PlannerTask[];
  onToggleDone: (taskId: string) => void;
  onDragTaskStart: (taskId: string) => string;
};

export function PlannerTaskBoard({ tasks, onToggleDone, onDragTaskStart }: PlannerTaskBoardProps) {
  const buckets = useMemo(
    () => ({
      high: tasks.filter((task) => task.priority === "high"),
      med: tasks.filter((task) => task.priority === "med"),
      low: tasks.filter((task) => task.priority === "low"),
    }),
    [tasks],
  );

  return (
    <>
      <SectionHeader
        title="Adaptive task queue"
        sub="Drag tasks into timeline slots to auto-schedule around cognitive peaks"
        action={
          <button className="text-xs px-3 py-1.5 rounded-full glass flex items-center gap-1">
            <Plus className="h-3 w-3" /> New task
          </button>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        {(["high", "med", "low"] as const).map((bucket) => (
          <div key={bucket} className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    bucket === "high" ? "bg-coral" : bucket === "med" ? "bg-electric" : "bg-violet"
                  }`}
                />
                <span className="capitalize">{bucket} priority</span>
              </div>
              <span className="text-xs text-muted-foreground">{buckets[bucket].length}</span>
            </div>

            <div className="space-y-3">
              {buckets[bucket].map((task) => {
                const cognitiveLoad = task.cognitiveLoad ?? 0;
                const fatigueScore = task.fatigueScore ?? 0;
                const focusScore = task.focusScore ?? 0;
                const burnoutRisk = task.burnoutRisk ?? "low";
                const riskClass = getBurnoutTone(burnoutRisk);
                const loadClass = getCognitiveTone(cognitiveLoad);
                const focusClass = getFocusTone(focusScore);

                return (
                  <motion.div
                    layout
                    key={task.id}
                    draggable
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    onDragStart={(event) => {
                      const dragEvent = event as unknown as DragEvent<HTMLDivElement>;
                      dragEvent.dataTransfer.setData("text/plain", onDragTaskStart(task.id));
                      dragEvent.dataTransfer.effectAllowed = "move";
                    }}
                    className={`group overflow-hidden rounded-3xl border p-3 bg-background/40 transition duration-200 ${
                      burnoutRisk === "high" ? "border-destructive/30 shadow-[0_0_0_1px_rgba(248,113,113,0.1)]" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => onToggleDone(task.id)}
                        className="h-3.5 w-3.5 accent-coral"
                      />
                      <div className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${loadClass}`}>
                          <Flame className="h-3 w-3" /> {cognitiveLoad}% load
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${focusClass}`}>
                          <Clock className="h-3 w-3" /> {focusScore}% focus
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${riskClass}`}>
                          {burnoutRisk.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" /> {task.energy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {task.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarRange className="h-3 w-3" /> {task.scheduledHour !== undefined ? `${task.scheduledHour}:00` : "Unscheduled"}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-surface/50 px-3 py-2 text-[11px] text-muted-foreground">
                        Optimal window: <span className="font-medium text-foreground">{task.recommendedTimeWindow ?? "Any available slot"}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
