import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { PageShell, PageHeader, GlassCard } from "@/components/PageShell";
import { tasks as initialTasks, focusData } from "@/lib/mock-data";
import { PlannerInsightsPanel } from "@/components/planner/PlannerInsightsPanel";
import { PlannerTaskBoard } from "@/components/planner/PlannerTaskBoard";
import { PlannerTimeline } from "@/components/planner/PlannerTimeline";
import {
  buildRecommendations,
  computeMetrics,
  createBlockFromTask,
  hydratePlannerTask,
  hydratePlannerTasks,
  toPlannerTasks,
} from "@/components/planner/planner-utils";
import type { PlannerTask, TimelineBlock } from "@/components/planner/types";
import AddTaskModal, { type TaskData } from "@/components/tasks/AddTaskModal";


export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Adaptive Planner · NeuroFlow AI" }] }),
  component: PlannerPage,
});

const STORAGE_KEY = "neuroflow.planner.state.v1";

function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>(() => toPlannerTasks(initialTasks));
  const [blocks, setBlocks] = useState<TimelineBlock[]>(() => [
    createBlockFromTask(toPlannerTasks(initialTasks)[0], 9),
    createBlockFromTask(toPlannerTasks(initialTasks)[1], 11),
    createBlockFromTask(toPlannerTasks(initialTasks)[4], 14),
    createBlockFromTask(toPlannerTasks(initialTasks)[3], 16),
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { tasks: PlannerTask[]; blocks: TimelineBlock[] };
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.blocks)) {
        setTasks(hydratePlannerTasks(parsed.tasks));
        setBlocks(parsed.blocks);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, blocks }));
  }, [tasks, blocks]);

  const avgFatigueSignal = useMemo(
    () => Math.round(focusData.reduce((sum, day) => sum + day.fatigue, 0) / focusData.length),
    [],
  );

  const metrics = useMemo(
    () => computeMetrics(tasks, blocks, avgFatigueSignal),
    [tasks, blocks, avgFatigueSignal],
  );
  const recommendations = useMemo(() => buildRecommendations(metrics, tasks), [metrics, tasks]);

  const onToggleDone = useCallback((taskId: string) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? hydratePlannerTask({ ...task, done: !task.done }) : task,
      ),
    );
  }, []);

  const handleSaveTask = (task: TaskData) => {
    const energyMap = {
      High: "high",
      Medium: "med",
      Low: "low",
    } as const;
    const priorityMap = {
      High: "high",
      Medium: "med",
      Low: "low",
    } as const;

    const plannerTask = toPlannerTasks([
      {
        id: crypto.randomUUID(),
        title: task.title,
        energy: energyMap[task.energy],
        priority: priorityMap[task.priority],
        duration: `${task.duration}m`,
        done: false,
      },
    ])[0];

    setTasks((previous) => [...previous, plannerTask]);
    setIsModalOpen(false);
  };

  const handleDropAtHour = useCallback(
    (hour: number, payload: string) => {
      if (payload.startsWith("task:")) {
        const taskId = payload.replace("task:", "");
        setTasks((previous) => {
          const task = previous.find((item) => item.id === taskId);
          const updatedTasks = previous.map((task) =>
            task.id === taskId ? hydratePlannerTask({ ...task, scheduledHour: hour }) : task,
          );

          setBlocks((previousBlocks) => {
            const exists = previousBlocks.some((block) => block.taskId === taskId);
            if (exists) {
              return previousBlocks.map((block) =>
                block.taskId === taskId ? { ...block, hour } : block,
              );
            }
            return task ? [...previousBlocks, createBlockFromTask(hydratePlannerTask({ ...task, scheduledHour: hour }), hour)] : previousBlocks;
          });

          return updatedTasks;
        });
      }

      if (payload.startsWith("block:")) {
        const blockId = payload.replace("block:", "");
        const currentBlock = blocks.find((block) => block.id === blockId);
        setBlocks((previous) =>
          previous.map((block) => (block.id === blockId ? { ...block, hour } : block)),
        );
        if (currentBlock) {
          setTasks((previous) =>
            previous.map((task) =>
              task.id === currentBlock.taskId ? { ...task, scheduledHour: hour } : task,
            ),
          );
        }
      }
    },
    [tasks, blocks],
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Adaptive Planner"
        title="Your day, reshaped by your brain."
        subtitle="NeuroFlow rebalances tasks against your live cognitive curve, energy levels, and historical focus windows."
        actions={
          <>
            <button
              onClick={() => {
                setTasks(toPlannerTasks(initialTasks));
                setBlocks([
                  createBlockFromTask(toPlannerTasks(initialTasks)[0], 9),
                  createBlockFromTask(toPlannerTasks(initialTasks)[1], 11),
                  createBlockFromTask(toPlannerTasks(initialTasks)[4], 14),
                  createBlockFromTask(toPlannerTasks(initialTasks)[3], 16),
                ]);
              }}
              className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition"
            >
              Reset
            </button>
            <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Re-optimize
            </button>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium hover:opacity-90 transition">
              + Add Task
              </button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-8">
          <PlannerTimeline
            blocks={blocks}
            focusData={focusData}
            onDragStartBlock={(blockId) => `block:${blockId}`}
            onDropAtHour={(hour, payload) => handleDropAtHour(hour, payload)}
          />
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4">
          <PlannerInsightsPanel metrics={metrics} recommendations={recommendations} />
        </GlassCard>

        <GlassCard className="col-span-12">
          <PlannerTaskBoard
            tasks={tasks}
            onToggleDone={onToggleDone}
            onDragTaskStart={(taskId) => `task:${taskId}`}
          />
        </GlassCard>
      </div>
      <AddTaskModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />
    </PageShell>
  );
}
