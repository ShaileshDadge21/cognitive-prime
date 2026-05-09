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
import type { DragEvent } from "react";
import { SectionHeader } from "@/components/PageShell";
import { peakHours, timelineHours } from "@/components/planner/planner-utils";
import { getCognitiveTone, getBurnoutTone } from "@/components/planner/cognitive-visuals";
import type { TimelineBlock } from "@/components/planner/types";

type PlannerTimelineProps = {
  blocks: TimelineBlock[];
  onDropAtHour: (hour: number, payload: string) => void;
  onDragStartBlock: (blockId: string) => string;
  focusData: Array<{ day: string; energy: number }>;
};

export function PlannerTimeline({
  blocks,
  onDropAtHour,
  onDragStartBlock,
  focusData,
}: PlannerTimelineProps) {
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

      <div className="relative">
        <div className="grid grid-cols-6 md:grid-cols-12 text-[10px] text-muted-foreground mb-2 gap-1">
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
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12">
            {timelineHours.map((hour) => (
              <div
                key={hour}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const payload = event.dataTransfer.getData("text/plain");
                  if (payload) {
                    onDropAtHour(hour, payload);
                  }
                }}
                className={`border-r border-white/5 last:border-0 ${peakHours.includes(hour) ? "bg-coral/4" : ""}`}
              />
            ))}
          </div>

          {blocks.map((block) => {
            const left = ((block.hour - 7) / 12) * 100;
            const width = (block.span / 12) * 100;

            return (
              <motion.div
                key={block.id}
                layout
                draggable
                whileHover={{ y: -2 }}
                onDragStart={(event) => {
                  const dragEvent = event as unknown as DragEvent<HTMLDivElement>;
                  dragEvent.dataTransfer.setData("text/plain", onDragStartBlock(block.id));
                  dragEvent.dataTransfer.effectAllowed = "move";
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute top-3 bottom-3 rounded-xl px-3 py-3 border backdrop-blur-md text-xs cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  block.color === "coral"
                    ? "bg-coral/15 border-coral/30 text-coral"
                    : block.color === "electric"
                      ? "bg-electric/15 border-electric/30 text-electric"
                      : "bg-violet/15 border-violet/30 text-violet"
                }`}
                style={{ left: `${left}%`, width: `calc(${width}% - 6px)` }}
              >
                <div className="font-medium text-foreground truncate">{block.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] ${getCognitiveTone(block.cognitiveLoad)}`}>
                    {block.cognitiveLoad}% load
                  </span>
                  <span className={`rounded-full border px-2 py-1 text-[10px] ${getBurnoutTone(block.burnoutRisk)}`}>
                    {block.burnoutRisk}
                  </span>
                </div>
                <div className="opacity-80 mt-2 flex items-center gap-1 text-[11px]">
                  <Zap className="h-3 w-3" /> {block.energyLoad}% cognitive load
                </div>
              </motion.div>
            );
          })}
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
