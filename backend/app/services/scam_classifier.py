import re
from typing import Any

from app.config import settings
from app.services.ai_service import chat_json

ARREST_SCAM_PATTERNS = [
    r"cbi|ed|narcotics|customs|income\s*tax|police\s*station",
    r"digital\s*arrest|virtual\s*arrest|video\s*call\s*arrest",
    r"account\s*frozen|bank\s*account\s*blocked|aadhaar\s*linked",
    r"transfer|pay\s*immediately|clear\s*your\s*name|via\s*upi|upi\s*transfer",
    r"skype|google\s*meet|zoom|video\s*verification",
    r"don'?t\s*tell\s*anyone|keep\s*this\s*confidential",
    r"immediately|urgent|within\s*\d+\s*(hour|minute)",
    r"₹|rs\.?\s*\d|rupees?\s*\d|\d{4,}\s*(rupees|rs)",
]

SPOOF_SIGNATURES = [
    r"\+91[-\s]?11[-\s]?\d{4}",
    r"spoofed|caller\s*id|display\s*number",
    r"unknown\s*international",
]


def rule_based_scam_analysis(text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    text_lower = text.lower()
    matched_patterns: list[str] = []
    score = 0.0

    for pattern in ARREST_SCAM_PATTERNS:
        if re.search(pattern, text_lower, re.I):
            matched_patterns.append(pattern)
            score += 12

    for pattern in SPOOF_SIGNATURES:
        if re.search(pattern, text_lower, re.I):
            matched_patterns.append(f"spoof:{pattern}")
            score += 15

    metadata = metadata or {}
    if metadata.get("caller_spoofed"):
        score += 25
        matched_patterns.append("caller_id_spoofing_detected")
    if metadata.get("video_call_requested"):
        score += 18
        matched_patterns.append("video_call_pressure")
    if metadata.get("urgency_keywords", 0) > 2:
        score += 10

    score = min(100, score)
    risk = "critical" if score >= 80 else "high" if score >= 60 else "medium" if score >= 35 else "low"

    call_flow = []
    if re.search(r"introduc", text_lower):
        call_flow.append("Authority impersonation intro")
    if re.search(r"video|skype|meet", text_lower):
        call_flow.append("Video verification demand")
    if re.search(r"transfer|pay|upi", text_lower):
        call_flow.append("Financial extraction attempt")
    if re.search(r"confidential|don'?t tell", text_lower):
        call_flow.append("Isolation tactic")

    return {
        "fraud_score": round(score, 1),
        "risk_level": risk,
        "is_scam": score >= 60,
        "alert_triggered": score >= 80,
        "scam_type": "digital_arrest" if score >= 50 else "suspicious",
        "matched_patterns": matched_patterns[:8],
        "call_flow_sequence": call_flow or ["Initial contact"],
        "spoofing_detected": any("spoof" in p for p in matched_patterns),
        "recommended_action": (
            "DISCONNECT IMMEDIATELY — MHA alert auto-generated"
            if score >= 80
            else "Do not share OTP/UPI — verify via 1930 helpline"
            if score >= 60
            else "Monitor — low risk indicators"
        ),
        "mha_alert": {
            "generated": score >= 80,
            "alert_id": f"MHA-DA-{hash(text) % 100000:05d}" if score >= 80 else None,
            "category": "Digital Arrest Scam",
            "priority": "P1" if score >= 80 else "P2",
        },
        "analysis_mode": "rule_based",
    }


async def analyze_scam_session(
    transcript: str,
    caller_number: str = "",
    victim_number: str = "",
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    metadata = metadata or {}

    if settings.ai_enabled:
        try:
            system = """You are an expert digital arrest scam classifier for Indian law enforcement.
Analyze call transcripts for: authority impersonation (CBI/ED/Police), digital arrest threats,
video call coercion, account freeze claims, money transfer demands, isolation tactics, number spoofing.
Return JSON with keys:
fraud_score (0-100), risk_level (low|medium|high|critical), is_scam (bool),
alert_triggered (bool, true if score>=80), scam_type, matched_patterns (array),
call_flow_sequence (array), spoofing_detected (bool), recommended_action (string),
mha_alert (object with generated, alert_id, category, priority), confidence (0-1),
reasoning (brief string). Be conservative on citizen alerts — only high confidence for critical."""
            user = f"""Caller: {caller_number}
Victim: {victim_number}
Metadata: {metadata}
Transcript:
{transcript}"""
            result = await chat_json(system, user)
            result["analysis_mode"] = "ai"
            result["fraud_score"] = float(result.get("fraud_score", 0))
            result["alert_triggered"] = result["fraud_score"] >= 80
            if result.get("alert_triggered") and not result.get("mha_alert"):
                result["mha_alert"] = {
                    "generated": True,
                    "alert_id": f"MHA-DA-{abs(hash(transcript)) % 100000:05d}",
                    "category": "Digital Arrest Scam",
                    "priority": "P1",
                }
            return result
        except Exception:
            pass

    return rule_based_scam_analysis(transcript, metadata)
