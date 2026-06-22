import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string; value: string | number; subtitle?: string; icon?: React.ReactNode; trend?: string;
  variant?: "default" | "danger" | "success";
  details?: { summary: string; points: string[]; href?: string };
}

export function StatCard({ title, value, subtitle, icon, trend, variant = "default", details }: StatCardProps) {
  const variants = { default: "border-shield-border", danger: "border-red-500/30 glow-danger", success: "border-shield-accent/30 glow-accent" };
  return (
    <div className={cn("glass-card p-5 flex flex-col", variants[variant])}>
      <div className="flex items-start justify-between"><div>
        <p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>{icon && <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-shield-accent">{icon}</div>}</div>
      {trend && <p className={cn("text-xs mt-3 font-medium", trend.startsWith("+") ? "text-red-500" : "text-shield-accent")}>{trend} this week</p>}
      {details && <a href={details.href ?? "/insights/threats"} target="_blank" rel="noopener noreferrer" className="mt-4 pt-3 border-t border-emerald-100 text-xs font-semibold text-shield-accent hover:text-emerald-700 transition-colors flex items-center gap-1.5 w-full">View details <ArrowUpRight className="w-3.5 h-3.5" /></a>}
    </div>
  );
}
