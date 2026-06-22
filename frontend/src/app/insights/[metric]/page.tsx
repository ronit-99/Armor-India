import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const commonThreats = [
  { id: "THR-2401", threat: "Digital arrest impersonation", location: "Mumbai, Maharashtra", severity: "Critical", status: "Neutralised", updated: "2 min ago" },
  { id: "THR-2398", threat: "UPI collect-request campaign", location: "Gurugram, Haryana", severity: "High", status: "Investigating", updated: "8 min ago" },
  { id: "THR-2391", threat: "Mule account cluster", location: "Ahmedabad, Gujarat", severity: "Critical", status: "Accounts frozen", updated: "16 min ago" },
  { id: "THR-2386", threat: "OTP phishing infrastructure", location: "Jamtara, Jharkhand", severity: "High", status: "Blocked", updated: "31 min ago" },
  { id: "THR-2379", threat: "Investment fraud network", location: "Bengaluru, Karnataka", severity: "Medium", status: "Monitoring", updated: "52 min ago" },
  { id: "THR-2372", threat: "Loan-app extortion ring", location: "Hyderabad, Telangana", severity: "High", status: "Escalated", updated: "1 hr ago" },
];

const insights: Record<string, { title: string; value: string; summary: string; records: typeof commonThreats }> = {
  threats: { title: "Threats Neutralised", value: "1,247", summary: "All recently detected threats and the operational action taken against them.", records: commonThreats },
  alerts: { title: "Active Alerts", value: "23", summary: "Threat alerts currently awaiting investigation, escalation, or field action.", records: commonThreats.filter((r) => r.status !== "Neutralised") },
  citizens: { title: "Citizens Protected", value: "45,000", summary: "Threat campaigns where warnings or intervention protected potential victims.", records: commonThreats },
  "lead-time": { title: "Lead Time", value: "4.2 days", summary: "Campaigns detected before their projected peak, giving authorities time to intervene.", records: commonThreats },
  "mha-alerts": { title: "MHA Alerts Generated", value: "156", summary: "High-confidence intelligence packages prepared for authorised review.", records: commonThreats.slice(0, 5) },
  networks: { title: "Networks Mapped", value: "17", summary: "Connected criminal clusters mapped through shared accounts, devices, callers, and infrastructure.", records: commonThreats },
  "false-positives": { title: "False Positive Review", value: "2.1%", summary: "Alerts reviewed as non-fraud cases and retained for model-quality auditing.", records: commonThreats.slice(3) },
};

const severityClass: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Medium: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function InsightPage({ params }: { params: { metric: string } }) {
  const insight = insights[params.metric];
  if (!insight) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900"><ArrowLeft className="w-4 h-4" />Back to Command Center</Link>
      <div className="glass-card p-6 bg-gradient-to-r from-white to-emerald-50">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Armor India Intelligence</p><h1 className="text-3xl font-bold text-slate-900 mt-2">{insight.title}</h1><p className="text-slate-600 mt-2 max-w-2xl">{insight.summary}</p></div>
          <div className="text-right"><p className="text-4xl font-bold text-emerald-700">{insight.value}</p><p className="text-xs text-slate-500 mt-1">Current reporting window</p></div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between"><h2 className="font-semibold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" />Threat records</h2><span className="text-sm text-slate-500">{insight.records.length} records shown</span></div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-emerald-50 text-slate-600"><tr>{["ID", "Threat", "Location", "Severity", "Action status", "Updated"].map((h) => <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-emerald-100">{insight.records.map((record) => <tr key={record.id} className="hover:bg-emerald-50/60">
            <td className="px-5 py-4 font-mono text-xs text-slate-500">{record.id}</td><td className="px-5 py-4 font-medium text-slate-900">{record.threat}</td><td className="px-5 py-4 text-slate-600">{record.location}</td>
            <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${severityClass[record.severity]}`}>{record.severity}</span></td>
            <td className="px-5 py-4 text-emerald-700 font-medium"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />{record.status}</span></td><td className="px-5 py-4 text-slate-500">{record.updated}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
      <p className="text-xs text-slate-500">Demonstration intelligence data. Operational actions require authorised human review.</p>
    </div>
  );
}
