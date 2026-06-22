"use client";

import { useState } from "react";
import { Phone, AlertTriangle, FileWarning, Loader2, Play } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { FraudScoreGauge } from "@/components/FraudScoreGauge";
import { cn, riskBadge } from "@/lib/utils";

interface ScamResult {
  fraud_score: number;
  risk_level: string;
  is_scam: boolean;
  alert_triggered: boolean;
  scam_type: string;
  matched_patterns: string[];
  call_flow_sequence: string[];
  spoofing_detected: boolean;
  recommended_action: string;
  mha_alert: { generated: boolean; alert_id: string | null; category: string; priority: string };
  analysis_mode: string;
  reasoning?: string;
}

export default function ScamDetectionPage() {
  const [transcript, setTranscript] = useState("");
  const [callerNumber, setCallerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);

  const loadDemo = async () => {
    const demo = await apiGet<{
      transcript: string;
      caller_number: string;
      metadata: Record<string, unknown>;
    }>("/api/scam/demo-transcript");
    setTranscript(demo.transcript);
    setCallerNumber(demo.caller_number);
  };

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const res = await apiPost<{ data: ScamResult }>("/api/scam/analyze", {
        transcript,
        caller_number: callerNumber,
        metadata: { caller_spoofed: true, video_call_requested: true },
      });
      setResult(res.data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Phone className="w-7 h-7 text-red-400" />
          Digital Arrest Scam Detection
        </h1>
        <p className="text-gray-400 mt-1">
          AI classifier for call flow sequences, number spoofing, and script templates — flags active scam sessions before financial transfer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Call Transcript / Script</h2>
            <button
              onClick={loadDemo}
              className="flex items-center gap-1.5 text-xs text-shield-accent hover:text-shield-accent/80"
            >
              <Play className="w-3.5 h-3.5" /> Load Demo
            </button>
          </div>
          <input
            type="text"
            placeholder="Caller number (e.g. +91-11-XXXX-4821)"
            value={callerNumber}
            onChange={(e) => setCallerNumber(e.target.value)}
            className="w-full bg-shield-dark border border-shield-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-shield-accent/50"
          />
          <textarea
            rows={10}
            placeholder="Paste call transcript or scam script here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full bg-shield-dark border border-shield-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-shield-accent/50 resize-none"
          />
          <button
            onClick={analyze}
            disabled={loading || !transcript.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Analyze Scam Session
          </button>
        </div>

        <div className="glass-card p-6">
          {result ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <FraudScoreGauge score={result.fraud_score} size="sm" />
                <div className="text-right space-y-2">
                  <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-medium border", riskBadge(result.risk_level))}>
                    {result.risk_level.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-400">{result.scam_type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500">Mode: {result.analysis_mode}</p>
                </div>
              </div>

              {result.alert_triggered && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 glow-danger">
                  <div className="flex items-center gap-2 text-red-400 font-semibold">
                    <FileWarning className="w-5 h-5" />
                    MHA Alert Generated — {result.mha_alert.alert_id}
                  </div>
                  <p className="text-sm text-red-300/80 mt-1">{result.recommended_action}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Call Flow Sequence</h3>
                <div className="flex flex-wrap gap-2">
                  {result.call_flow_sequence.map((step, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300">
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Matched Patterns</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_patterns.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {result.spoofing_detected && (
                <p className="text-sm text-orange-400">⚠ Number spoofing signature detected</p>
              )}

              {result.reasoning && (
                <p className="text-sm text-gray-400 border-t border-shield-border pt-3">{result.reasoning}</p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Enter a transcript and click Analyze to detect scam patterns
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
