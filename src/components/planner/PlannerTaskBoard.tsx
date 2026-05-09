import { motion } from "framer-motion";
import { CalendarRange, Clock, Flame, GripVertical, Plus } from "lucide-react";
import { SectionHeader } from "@/components/PageShell";
import type { PlannerTask } from "@/components/planner/types";

type PlannerTaskBoardProps = {
  tasks: PlannerTask[];
  onToggleDone: (taskId: string) => void;
  onDragTaskStart: (taskId: string) => string;
};

export function PlannerTaskBoard({ tasks, onToggleDone, onDragTaskStart }: PlannerTaskBoardProps) {
  const buckets = {
    high: tasks.filter((task) => task.priority === "high"),
    med: tasks.filter((task) => task.priority === "med"),
    low: tasks.filter((task) => task.priority === "low"),
  };

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

            <div className="space-y-2">
              {buckets[bucket].map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", onDragTaskStart(task.id));
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  className="p-3 rounded-xl bg-background/40 border border-white/5 group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => onToggleDone(task.id)}
                      className="h-3.5 w-3.5 accent-coral"
                    />
                    <div
                      className={`text-sm flex-1 ${task.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {task.energy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {task.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarRange className="h-3 w-3" />{" "}
                      {task.scheduledHour !== undefined
                        ? `${task.scheduledHour}:00`
                        : "Unscheduled"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
