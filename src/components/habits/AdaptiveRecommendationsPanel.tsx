import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Clock, Zap, Target, CheckCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  generateAdaptiveRecommendations,
  type AdaptiveRecommendation,
} from "@/lib/habit-scoring-engine";
import type { Habit } from "./types";
import { useState } from "react";

interface AdaptiveRecommendationsPanelProps {
  habit: Habit;
  onApplyRecommendation?: (recommendation: AdaptiveRecommendation) => void;
  className?: string;
}

export function AdaptiveRecommendationsPanel({
  habit,
  onApplyRecommendation,
  className = "",
}: AdaptiveRecommendationsPanelProps) {
  const recommendations = generateAdaptiveRecommendations(habit);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "frequency_increase":
      case "difficulty_increase":
        return <TrendingUp className="w-4 h-4" />;
      case "frequency_decrease":
      case "difficulty_decrease":
        return <TrendingUp className="w-4 h-4 rotate-180" />;
      case "schedule_optimization":
        return <Clock className="w-4 h-4" />;
      case "rest_recommended":
        return <X className="w-4 h-4" />;
      case "intensive_support":
        return <AlertTriangle className="w-4 h-4" />;
      case "maintain_current":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-300 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      default:
        return "bg-surface/60 text-muted-foreground border-white/10";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "text-green-300";
      case "stabilizing":
        return "text-electric";
      case "preventive":
        return "text-orange-300";
      default:
        return "text-muted-foreground";
    }
  };

  const toggleExpanded = (recId: string) => {
    const newExpanded = new Set(expandedRecs);
    if (newExpanded.has(recId)) {
      newExpanded.delete(recId);
    } else {
      newExpanded.add(recId);
    }
    setExpandedRecs(newExpanded);
  };

  if (recommendations.length === 0) {
    return (
      <Card className={`rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">All Good!</h3>
          <p className="text-muted-foreground">
            Your habit is performing well. No recommendations needed at this time.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`rounded-3xl border-white/10 bg-surface/80 p-6 shadow-soft ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-electric" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Adaptive Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions to optimize your habit performance
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const recId = `${recommendation.type}-${index}`;
          const isExpanded = expandedRecs.has(recId);

          return (
            <motion.div
              key={recId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <div
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-background/40 p-4 cursor-pointer transition-colors hover:bg-white/5"
                    onClick={() => toggleExpanded(recId)}
                  >
                    <div className="shrink-0 mt-1">
                      {getRecommendationIcon(recommendation.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-foreground">{recommendation.message}</h3>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {recommendation.rationale}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span
                          className={`font-medium ${getImpactColor(recommendation.expectedImpact)}`}
                        >
                          {recommendation.expectedImpact} impact
                        </span>
                        <span>/</span>
                        <span>Success metric: {recommendation.successMetric}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg
                          className="w-5 h-5 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-2xl border border-white/10 bg-background/40 p-4"
                  >
                    <h4 className="font-medium text-foreground mb-3">Implementation Steps:</h4>
                    <ol className="space-y-2">
                      {recommendation.implementationSteps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="shrink-0 w-5 h-5 bg-electric/10 text-electric rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>

                    {onApplyRecommendation && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <Button
                          onClick={() => onApplyRecommendation(recommendation)}
                          size="sm"
                          className="w-full"
                        >
                          Apply This Recommendation
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
