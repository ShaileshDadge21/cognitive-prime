import { Brain, Flame, Sparkles, TriangleAlert } from "lucide-react";
import { SectionHeader } from "@/components/PageShell";
import type { PlannerMetrics } from "@/components/planner/types";
import type { ReactNode } from "react";

type PlannerInsightsPanelProps = {
  metrics: PlannerMetrics;
  recommendations: ReadonlyArray<{
    id: string;
    title: string;
    text: string;
    severity: "good" | "warning";
  }>;
};

export function PlannerInsightsPanel({ metrics, recommendations }: PlannerInsightsPanelProps) {
  const fatigueTone =
    metrics.fatigueRisk > 65
      ? "text-destructive"
      : metrics.fatigueRisk > 45
        ? "text-coral"
        : "text-electric";

  return (
    <>
      <SectionHeader title="Cognitive state" sub="Dynamic readiness and fatigue-aware signals" />

      <div className="space-y-3">
        <MetricBar
          label="Cognitive score"
          value={metrics.cognitiveScore}
          accent="coral"
          icon={<Brain className="h-3.5 w-3.5" />}
        />
        <MetricBar label="Avg. cognitive load" value={metrics.averageCognitiveLoad} accent="electric" />
        <MetricBar label="Fatigue risk" value={metrics.fatigueRisk} accent="violet" />
        <MetricBar label="Burnout exposure" value={metrics.burnoutExposure} accent="coral" />
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-surface/50 border border-white/10">
        <div className="text-xs text-muted-foreground">Fatigue & burnout exposure</div>
        <div className={`mt-1 text-sm font-medium ${fatigueTone}`}>
          Burnout {metrics.burnoutExposure}% · Fatigue {metrics.fatigueRisk}%
        </div>
        <div className="mt-3 grid gap-2">
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-electric via-coral to-destructive"
              style={{ width: `${metrics.burnoutExposure}%` }}
            />
          </div>
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-400 via-violet to-destructive"
              style={{ width: `${metrics.fatigueRisk}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {recommendations.map((card) => (
          <div
            key={card.id}
            className="p-4 rounded-2xl bg-linear-to-br from-coral/10 to-electric/10 border border-white/10"
          >
            <div className="flex items-center gap-2 text-sm">
              {card.severity === "warning" ? (
                <TriangleAlert className="h-4 w-4 text-coral" />
              ) : (
                <Sparkles className="h-4 w-4 text-electric" />
              )}
              <span className="font-medium">{card.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function MetricBar({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: "coral" | "electric" | "violet";
  icon?: ReactNode;
}) {
  const gradient =
    accent === "coral"
      ? "from-coral to-orange-400"
      : accent === "electric"
        ? "from-electric to-cyan-400"
        : "from-violet to-purple-400";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          {icon ?? <Flame className="h-3.5 w-3.5" />} {label}
        </span>
        <span>{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`h-full rounded-full bg-linear-to-r ${gradient}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
