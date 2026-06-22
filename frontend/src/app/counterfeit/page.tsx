"use client";

import { useState, useRef } from "react";
import { Banknote, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { FraudScoreGauge } from "@/components/FraudScoreGauge";
import { cn } from "@/lib/utils";

interface CounterfeitResult {
  is_counterfeit: boolean;
  authenticity_score: number;
  detected_denomination: number;
  confidence: number;
  security_checks: { feature: string; status: string; confidence: number }[];
  verdict: string;
  recommendation: string;
  analysis_mode: string;
  reasoning?: string;
}

const DENOMINATIONS = [10, 20, 50, 100, 200, 500];

export default function CounterfeitPage() {
  const [denomination, setDenomination] = useState<number>(500);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CounterfeitResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    analyze(file);
  };

  const analyze = async (file: File) => {
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("denomination", String(denomination));
    try {
      const res = await apiUpload<{ data: CounterfeitResult }>("/api/counterfeit/analyze", form);
      setResult(res.data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "pass" || status === "simulated_pass") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === "fail") return <XCircle className="w-4 h-4 text-red-400" />;
    return <span className="w-4 h-4 rounded-full bg-yellow-400/30 inline-block" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Banknote className="w-7 h-7 text-yellow-400" />
          Counterfeit Currency Identification
        </h1>
        <p className="text-gray-400 mt-1">
          Computer vision agent for microprint analysis, security thread verification, and UV feature simulation across all denominations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-white">Upload Currency Note</h2>

          <div className="flex gap-2 flex-wrap">
            {DENOMINATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDenomination(d)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  denomination === d
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                    : "bg-white/5 text-gray-400 border-shield-border hover:text-white"
                )}
              >
                ₹{d}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-shield-border rounded-2xl p-8 text-center cursor-pointer hover:border-yellow-500/40 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Note preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Click to upload note image</p>
                <p className="text-gray-600 text-xs mt-1">JPG, PNG — mobile camera supported</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {loading && (
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing security features...
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          {result ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <FraudScoreGauge
                  score={result.authenticity_score}
                  label="Authenticity Score"
                  size="sm"
                />
                <div className="text-right">
                  <p className={cn("text-lg font-bold", result.is_counterfeit ? "text-red-400" : "text-emerald-400")}>
                    {result.verdict}
                  </p>
                  <p className="text-sm text-gray-400">₹{result.detected_denomination} · {(result.confidence * 100).toFixed(0)}% conf</p>
                  <p className="text-xs text-gray-500 mt-1">{result.analysis_mode}</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 p-3 rounded-xl bg-white/5">{result.recommendation}</p>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Security Checks</h3>
                <div className="space-y-2">
                  {result.security_checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-shield-dark">
                      <div className="flex items-center gap-2">
                        {statusIcon(check.status)}
                        <span className="text-sm text-gray-300">{check.feature}</span>
                      </div>
                      <span className="text-xs text-gray-500">{(check.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.reasoning && (
                <p className="text-sm text-gray-400 border-t border-shield-border pt-3">{result.reasoning}</p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Upload a currency note image to begin analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
