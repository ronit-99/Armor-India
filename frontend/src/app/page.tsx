"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { FraudScoreGauge } from "@/components/FraudScoreGauge";
import { cn } from "@/lib/utils";
import { dashboardModules, statDetails } from "@/data/dashboard";

interface DashboardStats {
  threats_neutralized: number;
  active_alerts: number;
  fraud_score_avg: number;
  counterfeit_detected: number;
  citizens_protected: number;
  networks_mapped: number;
  mha_alerts_generated: number;
  false_positive_rate: number;
  lead_time_days: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiGet<{ data: DashboardStats }>("/api/dashboard/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-shield-accent" />
            Command Center
          </h1>
          <p className="text-gray-400 mt-1">
            Shifting from reactive investigation to predictive threat neutralisation
          </p>
        </div>
        <FraudScoreGauge score={stats?.fraud_score_avg ?? 72} label="Avg Threat Score" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Threats Neutralised"
          value={stats?.threats_neutralized?.toLocaleString() ?? "—"}
          icon={<Shield className="w-5 h-5" />}
          trend="+12%"
          variant="success"
          details={statDetails.threats}
        />
        <StatCard
          title="Active Alerts"
          value={stats?.active_alerts ?? "—"}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
          details={statDetails.alerts}
        />
        <StatCard
          title="Citizens Protected"
          value={stats?.citizens_protected?.toLocaleString() ?? "—"}
          icon={<Users className="w-5 h-5" />}
          details={statDetails.citizens}
        />
        <StatCard
          title="Lead Time (days)"
          value={stats?.lead_time_days ?? "—"}
          subtitle="Before mass victimisation"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
          details={statDetails.leadTime}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="MHA Alerts Generated" value={stats?.mha_alerts_generated ?? "—"} details={statDetails.mha} />
        <StatCard title="Networks Mapped" value={stats?.networks_mapped ?? "—"} details={statDetails.networks} />
        <StatCard
          title="False Positive Rate"
          value={`${stats?.false_positive_rate ?? 2.1}%`}
          subtitle="Citizen-facing tools"
          details={statDetails.falsePositives}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Intelligence Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="glass-card p-6 hover:border-shield-accent/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-shield-accent/10 transition-colors">
                    <Icon className={cn("w-5 h-5", mod.color)} />
                  </div>
                  <h3 className="font-semibold text-white">{mod.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{mod.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
