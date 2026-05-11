import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SectionHeader } from "@/components/PageShell";
import { peakHours, timelineHours } from "@/components/planner/planner-utils";
import { getCognitiveTone, getBurnoutTone } from "@/components/planner/cognitive-visuals";
import type { TimelineBlock } from "@/components/planner/types";

type PlannerTimelineProps = {
  blocks: TimelineBlock[];
  focusData: Array<{ day: string; energy: number }>;
  dragOverHour: number | null;
};

type DraggableBlockProps = {
  block: TimelineBlock;
};

function DraggableTimelineBlock({ block }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block:${block.id}`,
    data: { type: "block", blockId: block.id },
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        touchAction: "manipulation",
        zIndex: 99,
      }
    : { touchAction: "manipulation" };

  const left = ((block.hour - 7) / 12) * 100;
  const width = (block.span / 12) * 100;

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={{ ...style, left: `${left}%`, width: `calc(${width}% - 6px)` }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute top-3 bottom-3 rounded-xl px-3 py-3 border backdrop-blur-md text-xs cursor-grab active:cursor-grabbing transition-all duration-200 ${
        block.color === "coral"
          ? "bg-coral/15 border-coral/30 text-coral"
          : block.color === "electric"
            ? "bg-electric/15 border-electric/30 text-electric"
            : "bg-violet/15 border-violet/30 text-violet"
      } ${isDragging ? "opacity-80 shadow-2xl" : ""}`}
      {...listeners}
      {...attributes}
    >
      <div className="font-medium text-foreground truncate">{block.title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-2 py-1 text-[10px] ${getCognitiveTone(block.cognitiveLoad)}`}
        >
          {block.cognitiveLoad}% load
        </span>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] ${getBurnoutTone(block.burnoutRisk)}`}
        >
          {block.burnoutRisk}
        </span>
      </div>
      <div className="opacity-80 mt-2 flex items-center gap-1 text-[11px]">
        <Zap className="h-3 w-3" /> {block.energyLoad}% cognitive load
      </div>
    </motion.div>
  );
}

function DroppableHourCell({ hour, isActive }: { hour: number; isActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `hour-${hour}`,
    data: { type: "hour", hour },
  });

  return (
    <div
      id={`timeline-hour-${hour}`}
      ref={setNodeRef}
      className={`border-r border-white/5 last:border-0 min-h-50 ${
        peakHours.includes(hour) ? "bg-coral/4" : ""
      } ${isOver || isActive ? "bg-cyan-500/10 ring-1 ring-cyan-500/30" : ""}`}
    />
  );
}

export function PlannerTimeline({ blocks, focusData, dragOverHour }: PlannerTimelineProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.hour - b.hour);

  return (
    <>
      <SectionHeader
        title="Adaptive timeline"
        sub="Drag tasks into the timeline. NeuroFlow aligns load with cognitive peaks."
        action={
          <span className="text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1">
            <Brain className="h-3 w-3" /> Peak 9-11 AM
          </span>
        }
      />

      <div className="relative overflow-x-auto">
        <div className="grid grid-cols-12 text-[10px] text-muted-foreground mb-2 gap-1 min-w-full">
          {timelineHours.map((hour) => (
            <div
              key={hour}
              className={`text-center ${peakHours.includes(hour) ? "text-coral" : ""}`}
            >
              {hour}:00
            </div>
          ))}
        </div>

        <div className="relative min-h-56 rounded-2xl bg-surface/40 border border-white/5 overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-12">
            {timelineHours.map((hour) => (
              <DroppableHourCell key={hour} hour={hour} isActive={dragOverHour === hour} />
            ))}
          </div>

          {sortedBlocks.map((block) => (
            <DraggableTimelineBlock key={block.id} block={block} />
          ))}
        </div>

        <div className="mt-4 h-24 -mx-2">
          <ResponsiveContainer>
            <AreaChart data={focusData}>
              <defs>
                <linearGradient id="planner-energy-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="var(--coral)"
                strokeWidth={2}
                fill="url(#planner-energy-g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
