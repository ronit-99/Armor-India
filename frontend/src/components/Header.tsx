"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, AlertTriangle } from "lucide-react";
import { apiGet } from "@/lib/api";

interface HealthData {
  ai_enabled: boolean;
  model: string;
  status: string;
}

export function Header() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    apiGet<HealthData>("/api/health")
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <header className="h-16 border-b border-shield-border bg-white/85 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Activity className="w-4 h-4 text-shield-accent animate-pulse" />
        <span>Live Intelligence Feed</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-500">Predictive Threat Neutralisation</span>
      </div>

      <div className="flex items-center gap-4">
        {health ? (
          <a
            href="/setup"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              health.ai_enabled
                ? "bg-shield-accent/10 text-shield-accent border-shield-accent/30"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {health.ai_enabled ? `AI Active · ${health.model}` : "Demo Mode — Click to Add API Key"}
          </a>
        ) : (
          <a href="/setup" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/30">
            Backend Offline — Setup
          </a>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          23 Active Alerts
        </div>
      </div>
    </header>
  );
}
