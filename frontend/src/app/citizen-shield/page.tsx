"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, Shield, Globe } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { cn, riskBadge } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  verdict?: string;
  fraud_score?: number;
}

interface Language {
  code: string;
  name: string;
}

const QUICK_PROMPTS = [
  "Someone called claiming to be CBI and asked me to transfer money via UPI",
  "I got a WhatsApp message with a link to verify my bank account",
  "A person on video call said my Aadhaar is linked to fraud and I need to pay ₹50,000",
  "Is this SMS about KYC update from my bank genuine?",
];

const DEFAULT_LANGUAGES: Language[] = [
  { code: "en", name: "English" }, { code: "hi", name: "हिन्दी" }, { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" }, { code: "mr", name: "मराठी" }, { code: "ta", name: "தமிழ்" },
  { code: "gu", name: "ગુજરાતી" }, { code: "kn", name: "ಕನ್ನಡ" }, { code: "ml", name: "മലയാളം" },
  { code: "pa", name: "ਪੰਜਾਬੀ" }, { code: "or", name: "ଓଡ଼ିଆ" }, { code: "as", name: "অসমীয়া" },
];

const LANGUAGE_WELCOME: Record<string, string> = {
  en: "Language changed to English. How can I help you?", hi: "भाषा हिन्दी में बदल गई है। मैं आपकी कैसे सहायता कर सकता हूँ?",
  bn: "ভাষা বাংলায় পরিবর্তন হয়েছে। আমি কীভাবে সাহায্য করতে পারি?", te: "భాష తెలుగుకు మార్చబడింది. నేను మీకు ఎలా సహాయం చేయగలను?",
  mr: "भाषा मराठीमध्ये बदलली आहे. मी तुम्हाला कशी मदत करू?", ta: "மொழி தமிழுக்கு மாற்றப்பட்டது. நான் உங்களுக்கு எப்படி உதவலாம்?",
  gu: "ભાષા ગુજરાતીમાં બદલાઈ છે. હું તમને કેવી રીતે મદદ કરી શકું?", kn: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
  ml: "ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി. എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?", pa: "ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਗਈ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  or: "ଭାଷା ଓଡ଼ିଆକୁ ପରିବର୍ତ୍ତନ ହୋଇଛି। ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?", as: "ভাষা অসমীয়ালৈ সলনি কৰা হৈছে। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
};

export default function CitizenShieldPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🛡️ Namaste! I'm Citizen Fraud Shield. Describe any suspicious call, message, or payment request — I'll assess the risk and guide you on next steps. Available in 12 regional languages.",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState("app");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<{ languages: Language[] }>("/api/citizen/languages").then((r) => setLanguages(r.languages)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiPost<{
        data: { message: string; verdict: string; fraud_score: number; report_guidance: string };
      }>("/api/citizen/chat", { message: text, language, channel });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.data.message + "\n\n" + res.data.report_guidance,
          verdict: res.data.verdict,
          fraud_score: res.data.fraud_score,
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that. Please try again or call 1930." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-emerald-400" />
            Citizen Fraud Shield
          </h1>
          <p className="text-gray-400 mt-1">
            Multi-channel conversational AI for real-time fraud risk assessment — WhatsApp, IVR, and mobile app with NCRB reporting
          </p>
        </div>
        <div className="flex gap-2">
          {["app", "whatsapp", "ivr"].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border capitalize",
                channel === ch
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-gray-400 border-shield-border"
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Globe className="w-4 h-4" /> Language
          </div>
          <select
            value={language}
            onChange={(e) => {
              const next = e.target.value;
              setLanguage(next);
              setMessages((current) => [...current, { role: "assistant", content: LANGUAGE_WELCOME[next] }]);
            }}
            className="w-full bg-shield-dark border border-shield-border rounded-xl px-3 py-2 text-sm text-white"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>

          <div className="pt-3 border-t border-shield-border">
            <p className="text-xs text-gray-500 mb-2">Quick scenarios</p>
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => send(p)}
                className="block w-full text-left text-xs text-gray-400 hover:text-emerald-400 p-2 rounded-lg hover:bg-white/5 mb-1"
              >
                {p.slice(0, 60)}...
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <Shield className="w-4 h-4" /> Helpline
            </div>
            <p className="text-lg font-bold text-white mt-1">1930</p>
            <p className="text-xs text-gray-400">cybercrime.gov.in</p>
          </div>
        </div>

        <div className="lg:col-span-3 glass-card flex flex-col" style={{ height: 560 }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-shield-accent/20 text-white"
                      : "bg-shield-dark text-gray-300 border border-shield-border"
                  )}
                >
                  {msg.verdict && (
                    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium border mb-2", riskBadge(msg.verdict))}>
                      {msg.verdict.toUpperCase()} {msg.fraud_score !== undefined && `· ${msg.fraud_score}%`}
                    </span>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-shield-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Describe the suspicious call, message, or payment..."
              className="flex-1 bg-shield-dark border border-shield-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
