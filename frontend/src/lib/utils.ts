import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fraudScoreColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 35) return "text-yellow-400";
  return "text-emerald-400";
}

export function fraudScoreBg(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 35) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function riskBadge(level: string): string {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    suspicious: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    safe: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return map[level] || map.low;
}
