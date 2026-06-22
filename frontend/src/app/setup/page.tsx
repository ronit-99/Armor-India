"use client";

import { useEffect, useState } from "react";
import { Key, CheckCircle, XCircle, Loader2, Shield, AlertCircle } from "lucide-react";
import { apiGet, apiPost, API_BASE } from "@/lib/api";

interface ConfigStatus {
  ai_enabled: boolean;
  model: string;
  demo_mode: boolean;
  requirements: {
    required: string[];
    not_required: string[];
    optional: string[];
  };
}

export default function SetupPage() {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<boolean | null>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  const loadStatus = () => {
    apiGet<{ data: ConfigStatus }>("/api/config/status")
      .then((r) => {
        setStatus(r.data);
        setBackendOk(true);
      })
      .catch(() => setBackendOk(false));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const testAndSave = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    setMessage("");
    setSuccess(null);
    try {
      const res = await apiPost<{ success: boolean; message: string; ai_enabled?: boolean }>(
        "/api/config/test",
        { api_key: apiKey.trim() }
      );
      setSuccess(res.success);
      setMessage(res.message);
      if (res.success) loadStatus();
    } catch {
      setSuccess(false);
      setMessage(`Cannot reach backend at ${API_BASE}. Run .\\restart.ps1 first.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="w-7 h-7 text-shield-accent" />
          Setup & Configuration
        </h1>
        <p className="text-gray-400 mt-1">One thing needed for full AI — paste your OpenAI API key below</p>
      </div>

      {backendOk === false && (
        <div className="glass-card p-5 border-red-500/30 glow-danger">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <XCircle className="w-5 h-5" />
            Backend not running
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Open PowerShell in the project folder and run:
          </p>
          <code className="block mt-2 p-3 rounded-lg bg-shield-dark text-emerald-400 text-sm">
            .\restart.ps1
          </code>
          <p className="text-xs text-gray-500 mt-2">Backend URL expected: {API_BASE}</p>
        </div>
      )}

      {backendOk && status?.demo_mode && (
        <div className="glass-card p-5 border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold">
            <AlertCircle className="w-5 h-5" />
            Running in Demo Mode
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Basic features work with rule-based detection. Add your OpenAI key below to unlock full AI analysis.
          </p>
        </div>
      )}

      {status?.ai_enabled && (
        <div className="glass-card p-5 border-shield-accent/30 glow-accent">
          <div className="flex items-center gap-2 text-shield-accent font-semibold">
            <CheckCircle className="w-5 h-5" />
            AI Active — {status.model}
          </div>
          <p className="text-sm text-gray-300 mt-2">All modules are using AI-powered analysis.</p>
        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-white">OpenAI API Key</h2>
        <p className="text-sm text-gray-400">
          Get one at{" "}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-shield-accent hover:underline">
            platform.openai.com/api-keys
          </a>
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-proj-..."
          className="w-full bg-shield-dark border border-shield-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-shield-accent/50"
        />
        <button
          onClick={testAndSave}
          disabled={loading || !apiKey.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Test & Activate AI
        </button>
        {message && (
          <p className={`text-sm ${success ? "text-emerald-400" : "text-red-400"}`}>{message}</p>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">What you need vs don&apos;t need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-emerald-400 font-medium mb-2">Required (for full AI)</p>
            <ul className="space-y-1 text-gray-300">
              <li>• OpenAI API key only</li>
              <li>• Python 3.11+ (use <code className="text-gray-400">py</code> on Windows)</li>
              <li>• Node.js 18+</li>
            </ul>
          </div>
          <div>
            <p className="text-gray-400 font-medium mb-2">NOT required</p>
            <ul className="space-y-1 text-gray-500">
              <li>• SQL / database</li>
              <li>• Other API keys</li>
              <li>• Cloud deployment</li>
              <li>• Docker</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
