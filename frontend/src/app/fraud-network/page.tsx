"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Network, FileText, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface GraphNode {
  id: string;
  type: string;
  label: string;
  district?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: { cluster_id: string; size: number; risk_score: number; composition: Record<string, number> }[];
  stats: Record<string, number>;
  lead_time_days: number;
  campaign_id: string;
  evidence_package: { package_id: string; estimated_prevented_loss_inr: number };
}

const NODE_COLORS: Record<string, string> = {
  victim: "#ef4444",
  scammer: "#f97316",
  mule: "#eab308",
  device: "#8b5cf6",
  phone: "#3b82f6",
};

export default function FraudNetworkPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [evidence, setEvidence] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    apiGet<{ data: GraphData }>("/api/graph/network").then((r) => setData(r.data));
    apiGet<{ data: Record<string, unknown> }>("/api/graph/evidence-package").then((r) => setEvidence(r.data));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading fraud network...
      </div>
    );
  }

  const graphData = {
    nodes: data.nodes.map((n) => ({ ...n, color: NODE_COLORS[n.type] || "#6b7280" })),
    links: data.edges.map((e) => ({ ...e, source: e.source, target: e.target })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Network className="w-7 h-7 text-blue-400" />
          Fraud Network Graph Intelligence
        </h1>
        <p className="text-gray-400 mt-1">
          Graph AI mapping scammer infrastructure, mule networks, and victim clusters — court-admissible evidence packages
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{data.stats.total_nodes}</p>
          <p className="text-xs text-gray-400">Entities</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{data.stats.total_edges}</p>
          <p className="text-xs text-gray-400">Connections</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{data.lead_time_days}d</p>
          <p className="text-xs text-gray-400">Lead Time</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{data.clusters.length}</p>
          <p className="text-xs text-gray-400">Clusters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden" style={{ height: 500 }}>
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="label"
            nodeColor="color"
            nodeRelSize={6}
            linkLabel="label"
            linkWidth={(link: Record<string, unknown>) => Math.sqrt(Number(link.weight) || 1) / 3}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            backgroundColor="#111827"
            cooldownTicks={100}
            nodeCanvasObject={(node: Record<string, unknown>, ctx: CanvasRenderingContext2D) => {
              const x = Number(node.x) || 0;
              const y = Number(node.y) || 0;
              const r = 5;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.fillStyle = String(node.color || "#6b7280");
              ctx.fill();
              ctx.font = "3px Sans-Serif";
              ctx.fillStyle = "#9ca3af";
              ctx.textAlign = "center";
              ctx.fillText(String(node.type || ""), x, y + 10);
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3">Detected Clusters</h3>
            <div className="space-y-3">
              {data.clusters.map((c) => (
                <div key={c.cluster_id} className="p-3 rounded-xl bg-shield-dark border border-shield-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{c.cluster_id}</span>
                    <span className="text-xs text-red-400">Risk {c.risk_score}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.size} nodes · {c.composition.victims} victims · {c.composition.mules} mules
                  </p>
                </div>
              ))}
            </div>
          </div>

          {evidence && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-shield-accent mb-3">
                <FileText className="w-5 h-5" />
                <h3 className="font-semibold text-white">Evidence Package</h3>
              </div>
              <p className="text-sm text-gray-300">ID: {(evidence as { package_id: string }).package_id}</p>
              <p className="text-sm text-gray-400 mt-2">Campaign: {data.campaign_id}</p>
              <p className="text-sm text-emerald-400 mt-2">
                Est. prevented loss: ₹{((evidence as { estimated_prevented_loss_inr: number }).estimated_prevented_loss_inr / 100000).toFixed(1)}L
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Audit Trail", "Immutable Hashes", "IT Act Compliant"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-shield-accent/10 text-shield-accent text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
