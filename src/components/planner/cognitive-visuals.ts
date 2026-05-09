import type { BurnoutRisk } from "@/components/planner/types";

export function getCognitiveTier(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function getCognitiveTone(score: number): string {
  const tier = getCognitiveTier(score);

  if (tier === "high") {
    return "text-destructive bg-destructive/10 border border-destructive/20";
  }

  if (tier === "medium") {
    return "text-amber-300 bg-amber-400/10 border border-amber-400/20";
  }

  return "text-emerald-300 bg-emerald-500/10 border border-emerald/20";
}

export function getBurnoutTone(risk: BurnoutRisk): string {
  if (risk === "high") {
    return "text-destructive bg-destructive/10 border border-destructive/20 animate-pulse";
  }

  if (risk === "medium") {
    return "text-amber-300 bg-amber-400/10 border border-amber-400/20";
  }

  return "text-emerald-300 bg-emerald-500/10 border border-emerald/20";
}

export function getFocusTone(score: number): string {
  if (score >= 70) {
    return "text-cyan-200 bg-cyan-500/10 border border-cyan-400";
  }

  if (score >= 40) {
    return "text-electric bg-electric/10 border border-electric/20";
  }

  return "text-muted-foreground bg-surface/60 border border-white/10";
}

export function getBadgeTone(score: number): string {
  return getCognitiveTone(score);
}
