import { Banknote, Map, MessageCircle, Network, Phone } from "lucide-react";

export const dashboardModules = [
  { href: "/scam-detection", title: "Digital Arrest Scam Detection", desc: "Real-time AI classifier for call flow sequences, spoofing signatures, and script templates", icon: Phone, color: "text-red-500" },
  { href: "/counterfeit", title: "Counterfeit Currency ID", desc: "Computer vision for microprint, security thread, and UV feature verification", icon: Banknote, color: "text-yellow-500" },
  { href: "/fraud-network", title: "Fraud Network Graph", desc: "Map scammer infrastructure, mule networks, and victim clusters across jurisdictions", icon: Network, color: "text-blue-500" },
  { href: "/geospatial", title: "Geospatial Crime Intel", desc: "Hotspot mapping, patrol prioritisation, and inter-district intelligence sharing", icon: Map, color: "text-purple-500" },
  { href: "/citizen-shield", title: "Citizen Fraud Shield", desc: "Multi-channel AI advisor in 12 languages with NCRB reporting guidance", icon: MessageCircle, color: "text-emerald-600" },
];

export const statDetails = {
  threats: { href: "/insights/threats", summary: "Threat incidents disrupted before they could cause further financial or operational harm.", points: ["Includes blocked infrastructure and frozen mule accounts", "Week-on-week movement shows the operational trend", "Every neutralisation remains available for audit"] },
  alerts: { href: "/insights/alerts", summary: "High-priority intelligence alerts awaiting analyst review or field action.", points: ["Ranked by severity, confidence, and potential impact", "One alert may contain several connected entities", "Counts update as investigations change status"] },
  citizens: { href: "/insights/citizens", summary: "Citizens reached through early warnings, transaction blocks, or incident-response assistance.", points: ["Counts direct protective interventions", "Personal citizen information is not exposed", "Urgent financial fraud should be reported to 1930"] },
  leadTime: { href: "/insights/lead-time", summary: "Average warning time gained before a campaign is projected to reach mass victimisation.", points: ["More lead time gives teams greater room to intervene", "Measured from pattern emergence to projected peak", "Changes as new intelligence becomes available"] },
  mha: { href: "/insights/mha-alerts", summary: "Actionable intelligence summaries prepared for authorised Ministry of Home Affairs workflows.", points: ["Created from high-confidence threat patterns", "Requires authorised review before circulation", "Preserves evidence and decision history"] },
  networks: { href: "/insights/networks", summary: "Connected fraud clusters identified across callers, accounts, devices, and transaction trails.", points: ["Highlights shared infrastructure and coordinators", "Supports cross-jurisdiction investigation", "Relationships carry evidence-based confidence scores"] },
  falsePositives: { href: "/insights/false-positives", summary: "The share of alerts later determined not to represent genuine fraud.", points: ["Lower values indicate more precise detection", "Analyst feedback recalibrates the system", "Citizen-facing actions use conservative thresholds"] },
};
