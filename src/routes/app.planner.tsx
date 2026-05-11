import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { createDebouncedWriter } from "@/lib/storage";
import {
  clearPlannerState,
  exportPlannerState,
  importPlannerState,
  loadPlannerState,
  savePlannerState,
  type PlannerStorageSchema,
  PLANNER_STORAGE_VERSION,
} from "@/lib/planner-storage";
import type { PlannerTask, TimelineBlock } from "@/components/planner/types";
import AddTaskModal, { type TaskData } from "@/components/tasks/AddTaskModal";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Adaptive Planner · NeuroFlow AI" }] }),
  component: PlannerPage,
});

type PlannerDragItem =
  | { type: "task"; taskId: string }
  | { type: "block"; blockId: string }
  | { type: "hour"; hour: number }
  | { type: "task-queue" };

function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>(() => toPlannerTasks(initialTasks));
  const [blocks, setBlocks] = useState<TimelineBlock[]>(() => [
    createBlockFromTask(toPlannerTasks(initialTasks)[0], 9),
    createBlockFromTask(toPlannerTasks(initialTasks)[1], 11),
    createBlockFromTask(toPlannerTasks(initialTasks)[4], 14),
    createBlockFromTask(toPlannerTasks(initialTasks)[3], 16),
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);
  const [syncPayload, setSyncPayload] = useState("");
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  const savePlannerStateDebounced = useRef(
    createDebouncedWriter<PlannerStorageSchema>(savePlannerState, 250),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleRestoreDefaults = useCallback(() => {
    clearPlannerState();
    setTasks(toPlannerTasks(initialTasks));
    setBlocks([
      createBlockFromTask(toPlannerTasks(initialTasks)[0], 9),
      createBlockFromTask(toPlannerTasks(initialTasks)[1], 11),
      createBlockFromTask(toPlannerTasks(initialTasks)[4], 14),
      createBlockFromTask(toPlannerTasks(initialTasks)[3], 16),
    ]);
  }, []);

  useEffect(() => {
    const persisted = loadPlannerState();

    if (persisted) {
      setTasks(hydratePlannerTasks(persisted.tasks));
      setBlocks(persisted.blocks);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setIsSyncPanelOpen((previous) => !previous);
        setSyncNotice(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    savePlannerStateDebounced.current({
      version: PLANNER_STORAGE_VERSION,
      persistedAt: new Date().toISOString(),
      tasks,
      blocks,
    });
  }, [blocks, isHydrated, tasks]);

  const scheduleTask = useCallback(
    (taskId: string, hour: number) => {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? hydratePlannerTask({ ...task, scheduledHour: hour }) : task,
        ),
      );

      setBlocks((previous) => {
        const existingBlock = previous.find((block) => block.taskId === taskId);
        if (existingBlock) {
          return previous.map((block) => (block.taskId === taskId ? { ...block, hour } : block));
        }

        const task = tasks.find((item) => item.id === taskId);
        return task
          ? [
              ...previous,
              createBlockFromTask(hydratePlannerTask({ ...task, scheduledHour: hour }), hour),
            ]
          : previous;
      });
    },
    [tasks],
  );

  const moveBlock = useCallback(
    (blockId: string, hour: number) => {
      const existingBlock = blocks.find((block) => block.id === blockId);
      if (!existingBlock) {
        return;
      }

      setBlocks((previous) =>
        previous.map((block) => (block.id === blockId ? { ...block, hour } : block)),
      );
      setTasks((previous) =>
        previous.map((task) =>
          task.id === existingBlock.taskId ? { ...task, scheduledHour: hour } : task,
        ),
      );
    },
    [blocks],
  );

  const unscheduleBlock = useCallback(
    (blockId: string) => {
      const existingBlock = blocks.find((block) => block.id === blockId);
      if (!existingBlock) {
        return;
      }

      setBlocks((previous) => previous.filter((block) => block.id !== blockId));
      setTasks((previous) =>
        previous.map((task) =>
          task.id === existingBlock.taskId ? { ...task, scheduledHour: undefined } : task,
        ),
      );
    },
    [blocks],
  );

  const handleExportPlannerState = useCallback(() => {
    const exported = exportPlannerState();
    if (!exported) {
      setSyncPayload("");
      setSyncNotice("No persisted planner state found to export.");
      return;
    }

    setSyncPayload(exported);
    setSyncNotice("Planner export payload generated.");
  }, []);

  const handleImportPlannerState = useCallback(() => {
    const imported = importPlannerState(syncPayload);
    if (!imported) {
      setSyncNotice("Import failed: invalid planner payload.");
      return;
    }

    setTasks(hydratePlannerTasks(imported.tasks));
    setBlocks(imported.blocks);
    setSyncNotice("Planner state imported successfully.");
  }, [syncPayload]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current as PlannerDragItem | undefined;
    if (!item) {
      return;
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overItem = event.over?.data.current as PlannerDragItem | undefined;

    if (overItem?.type === "hour") {
      setDragOverHour(overItem.hour);
    } else {
      setDragOverHour(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const activeItem = event.active.data.current as PlannerDragItem | undefined;
      const overItem = event.over?.data.current as PlannerDragItem | undefined;

      setDragOverHour(null);

      if (!activeItem || !overItem) {
        return;
      }

      if (activeItem.type === "task") {
        if (overItem.type === "hour") {
          scheduleTask(activeItem.taskId, overItem.hour);
          return;
        }

        if (overItem.type === "block") {
          const targetBlock = blocks.find((block) => block.id === overItem.blockId);
          if (targetBlock) {
            scheduleTask(activeItem.taskId, targetBlock.hour);
          }
        }
      }

      if (activeItem.type === "block") {
        if (overItem.type === "hour") {
          moveBlock(activeItem.blockId, overItem.hour);
          return;
        }

        if (overItem.type === "task-queue") {
          unscheduleBlock(activeItem.blockId);
        }
      }
    },
    [blocks, moveBlock, scheduleTask, unscheduleBlock],
  );

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <PageShell>
        <PageHeader
          eyebrow="Adaptive Planner"
          title="Your day, reshaped by your brain."
          subtitle="NeuroFlow rebalances tasks against your live cognitive curve, energy levels, and historical focus windows."
          actions={
            <>
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition"
              >
                Restore defaults
              </button>
              <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Re-optimize
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium hover:opacity-90 transition"
              >
                + Add Task
              </button>
            </>
          }
        />

        {isSyncPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0B1020]/95 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Planner sync</h2>
                  <p className="text-sm text-gray-400">
                    Hidden export/import payload panel for migration and cloud sync.
                  </p>
                </div>
                <button
                  onClick={() => setIsSyncPanelOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={handleExportPlannerState}
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-400 transition"
                >
                  Export state
                </button>
                <button
                  onClick={handleImportPlannerState}
                  className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400 transition"
                >
                  Import state
                </button>
              </div>

              <textarea
                value={syncPayload}
                onChange={(event) => setSyncPayload(event.target.value)}
                placeholder="Paste planner payload here for import, or export to populate this field."
                className="mt-4 min-h-60 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none focus:border-cyan-400"
              />

              {syncNotice ? (
                <div className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-gray-300">
                  {syncNotice}
                </div>
              ) : null}

              <p className="mt-4 text-xs text-gray-500">
                Toggle this panel with <span className="font-semibold">Ctrl+Shift+S</span> (or
                Command+Shift+S).
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <GlassCard className="col-span-12 lg:col-span-8">
            <PlannerTimeline blocks={blocks} focusData={focusData} dragOverHour={dragOverHour} />
          </GlassCard>

          <GlassCard className="col-span-12 lg:col-span-4">
            <PlannerInsightsPanel metrics={metrics} recommendations={recommendations} />
          </GlassCard>

          <GlassCard className="col-span-12">
            <PlannerTaskBoard tasks={tasks} onToggleDone={onToggleDone} />
          </GlassCard>
        </div>
        <AddTaskModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      </PageShell>
    </DndContext>
  );
}
