import { Activity, TrendingUp, AlertTriangle, Heart, Zap, Layers } from "lucide-react";
import type { ProductivityScore, FatigueMetrics, BurnoutRiskAssessment } from "@/lib/analytics";

export function ProductivityScoreCard({ score }: { score: ProductivityScore | null }) {
  if (!score) return null;

  const getColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-cyan-400";
    if (value >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-coral" />
          <h3 className="text-sm font-semibold text-foreground">Productivity Score</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-foreground">{score.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-coral to-electric rounded-full transition-all"
              style={{ width: `${score.score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Task Completion</p>
            <p className={`font-semibold ${getColor(score.taskCompletion)}`}>
              {score.taskCompletion}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Focus Quality</p>
            <p className={`font-semibold ${getColor(score.focusQuality)}`}>{score.focusQuality}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Deep Work</p>
            <p className="font-semibold text-cyan-400">{score.deepWorkHours}h</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Efficiency</p>
            <p className={`font-semibold ${getColor(score.efficiency)}`}>{score.efficiency}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FatigueMetricsCard({ metrics }: { metrics: FatigueMetrics | null }) {
  if (!metrics) return null;

  const getTrendIcon = () => {
    if (metrics.trend === "increasing") {
      return <TrendingUp className="h-4 w-4 text-red-400" />;
    }
    if (metrics.trend === "decreasing") {
      return <TrendingUp className="h-4 w-4 text-green-400 rotate-180" />;
    }
    return <Zap className="h-4 w-4 text-yellow-400" />;
  };

  const getTrendText = () => {
    if (metrics.trend === "increasing") return "Increasing";
    if (metrics.trend === "decreasing") return "Improving";
    return "Stable";
  };

  const getLevelColor = () => {
    if (metrics.currentLevel >= 80) return "text-red-400";
    if (metrics.currentLevel >= 60) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-coral" />
          <h3 className="text-sm font-semibold text-foreground">Fatigue Metrics</h3>
        </div>
        <div className="flex items-center gap-1 text-xs bg-white/5 rounded-lg px-2 py-1">
          {getTrendIcon()}
          <span className="text-muted-foreground">{getTrendText()}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{metrics.currentLevel}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                metrics.currentLevel >= 80
                  ? "bg-red-500"
                  : metrics.currentLevel >= 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${metrics.currentLevel}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Accumulation</p>
            <p className="font-semibold text-foreground">{metrics.accumulation} days</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Peak Time</p>
            <p className="font-semibold text-foreground">{metrics.peakTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BurnoutRiskCard({ assessment }: { assessment: BurnoutRiskAssessment | null }) {
  if (!assessment) return null;

  const getRiskColor = () => {
    if (assessment.risk === "critical") return "border-red-500/50 bg-red-500/10";
    if (assessment.risk === "high") return "border-yellow-500/50 bg-yellow-500/10";
    if (assessment.risk === "moderate") return "border-orange-500/50 bg-orange-500/10";
    return "border-green-500/50 bg-green-500/10";
  };

  const getRiskTextColor = () => {
    if (assessment.risk === "critical") return "text-red-400";
    if (assessment.risk === "high") return "text-yellow-400";
    if (assessment.risk === "moderate") return "text-orange-400";
    return "text-green-400";
  };

  const getRiskLabel = () => {
    return assessment.risk.charAt(0).toUpperCase() + assessment.risk.slice(1);
  };

  return (
    <div className={`rounded-2xl border ${getRiskColor()} backdrop-blur-sm p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${getRiskTextColor()}`} />
          <h3 className="text-sm font-semibold text-foreground">Burnout Risk</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl font-bold ${getRiskTextColor()}`}>{getRiskLabel()}</span>
            <span className="text-xs text-muted-foreground">({assessment.score}/100)</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                assessment.risk === "critical"
                  ? "bg-red-500"
                  : assessment.risk === "high"
                    ? "bg-yellow-500"
                    : assessment.risk === "moderate"
                      ? "bg-orange-500"
                      : "bg-green-500"
              }`}
              style={{ width: `${assessment.score}%` }}
            />
          </div>
        </div>

        {assessment.factors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Contributing Factors</p>
            <ul className="space-y-1">
              {assessment.factors.map((factor, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-coral mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {assessment.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Recommendations</p>
            <ul className="space-y-1">
              {assessment.recommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-electric mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function DeepWorkCapacityCard({ capacity }: { capacity: number }) {
  const getCapacityColor = () => {
    if (capacity >= 20) return "text-cyan-400";
    if (capacity >= 10) return "text-yellow-400";
    return "text-red-400";
  };

  const getCapacityStatus = () => {
    if (capacity >= 20) return "Excellent";
    if (capacity >= 10) return "Moderate";
    return "Limited";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-coral" />
          <h3 className="text-sm font-semibold text-foreground">Deep Work Capacity</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-bold ${getCapacityColor()}`}>{capacity}</span>
            <span className="text-xs text-muted-foreground">hours/week</span>
          </div>
          <p className={`text-xs font-semibold ${getCapacityColor()}`}>
            {getCapacityStatus()} capacity
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Based on:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>High-intensity task load</li>
            <li>Current fatigue levels</li>
            <li>Habit discipline score</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function HabitConsistencyCard({ consistency }: { consistency: number }) {
  const getConsistencyColor = () => {
    if (consistency >= 80) return "text-green-400";
    if (consistency >= 60) return "text-cyan-400";
    if (consistency >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getConsistencyStatus = () => {
    if (consistency >= 80) return "Excellent";
    if (consistency >= 60) return "Good";
    if (consistency >= 40) return "Fair";
    return "Needs improvement";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-coral" />
          <h3 className="text-sm font-semibold text-foreground">Habit Consistency</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-bold ${getConsistencyColor()}`}>{consistency}</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-coral to-violet rounded-full transition-all"
              style={{ width: `${consistency}%` }}
            />
          </div>
        </div>

        <p className={`text-xs font-semibold ${getConsistencyColor()}`}>
          {getConsistencyStatus()} habit adherence
        </p>
      </div>
    </div>
  );
}
