from typing import Any

from app.config import settings
from app.services.ai_service import chat_json

# Seeded geospatial data — NCR fraud hotspots
HOTSPOTS = [
    {"id": "h1", "lat": 28.6139, "lng": 77.2090, "type": "fraud_complaint", "district": "New Delhi", "count": 127, "severity": "critical", "category": "Digital Arrest"},
    {"id": "h2", "lat": 28.5355, "lng": 77.3910, "type": "fraud_complaint", "district": "Noida", "count": 89, "severity": "high", "category": "Digital Arrest"},
    {"id": "h3", "lat": 28.4595, "lng": 77.0266, "type": "fraud_complaint", "district": "Gurugram", "count": 64, "severity": "high", "category": "UPI Fraud"},
    {"id": "h4", "lat": 28.7041, "lng": 77.1025, "type": "counterfeit_seizure", "district": "North Delhi", "count": 23, "severity": "medium", "category": "Fake ₹500"},
    {"id": "h5", "lat": 28.6692, "lng": 77.4538, "type": "counterfeit_seizure", "district": "Ghaziabad", "count": 15, "severity": "medium", "category": "Fake ₹200"},
    {"id": "h6", "lat": 28.4089, "lng": 77.3178, "type": "cybercrime_hotspot", "district": "Faridabad", "count": 45, "severity": "high", "category": "Phishing"},
    {"id": "h7", "lat": 28.5562, "lng": 77.1000, "type": "fraud_complaint", "district": "South Delhi", "count": 78, "severity": "high", "category": "Investment Scam"},
    {"id": "h8", "lat": 28.6289, "lng": 77.2065, "type": "counterfeit_seizure", "district": "Central Delhi", "count": 31, "severity": "high", "category": "Fake ₹500"},
]

PATROL_ZONES = [
    {"zone_id": "PZ-01", "name": "Connaught Place Circuit", "priority": 1, "units": 4, "lat": 28.6315, "lng": 77.2167},
    {"zone_id": "PZ-02", "name": "Noida Sector 18 Patrol", "priority": 2, "units": 3, "lat": 28.5700, "lng": 77.3200},
    {"zone_id": "PZ-03", "name": "Gurugram Cyber Cell Route", "priority": 2, "units": 3, "lat": 28.4595, "lng": 77.0266},
    {"zone_id": "PZ-04", "name": "Ghaziabad Border Watch", "priority": 3, "units": 2, "lat": 28.6692, "lng": 77.4538},
]

DISTRICT_SUMMARY = [
    {"district": "New Delhi", "complaints": 205, "counterfeit": 54, "trend": "+18%"},
    {"district": "Gautam Buddha Nagar", "complaints": 134, "counterfeit": 12, "trend": "+24%"},
    {"district": "Gurugram", "complaints": 98, "counterfeit": 8, "trend": "+12%"},
    {"district": "Ghaziabad", "complaints": 67, "counterfeit": 22, "trend": "+9%"},
]


def get_geospatial_intel() -> dict[str, Any]:
    total_complaints = sum(h["count"] for h in HOTSPOTS if h["type"] == "fraud_complaint")
    total_seizures = sum(h["count"] for h in HOTSPOTS if h["type"] == "counterfeit_seizure")

    return {
        "hotspots": HOTSPOTS,
        "patrol_zones": PATROL_ZONES,
        "district_summary": DISTRICT_SUMMARY,
        "stats": {
            "total_complaints": total_complaints,
            "total_counterfeit_seizures": total_seizures,
            "active_hotspots": len(HOTSPOTS),
            "patrol_units_deployed": sum(p["units"] for p in PATROL_ZONES),
            "coverage_km2": 1482,
        },
        "command_center_status": "ACTIVE",
        "last_updated": "2025-06-22T09:45:00Z",
    }


async def get_patrol_recommendations(query: str = "") -> dict[str, Any]:
    base = get_geospatial_intel()

    recommendations = [
        {
            "priority": 1,
            "action": "Deploy 2 additional cyber patrol units to Connaught Place — 127 complaints this week",
            "district": "New Delhi",
            "resource_type": "Cyber Patrol",
        },
        {
            "priority": 2,
            "action": "Coordinate with RBI for counterfeit checkpoint at Ghaziabad bus terminal",
            "district": "Ghaziabad",
            "resource_type": "Currency Verification",
        },
        {
            "priority": 3,
            "action": "Share Noida fraud pattern intel with UP Cyber Cell via I4C portal",
            "district": "Gautam Buddha Nagar",
            "resource_type": "Intelligence Sharing",
        },
    ]
    base["patrol_recommendations"] = recommendations

    if settings.ai_enabled and query:
        try:
            system = """You are a geospatial crime intelligence advisor for Indian law enforcement.
Return JSON with patrol_recommendations (array of {priority, action, district, resource_type}),
threat_summary (string), deployment_strategy (string)."""
            user = f"District data: {base['district_summary']}. Hotspots: {len(base['hotspots'])}. Query: {query}"
            ai = await chat_json(system, user)
            if ai.get("patrol_recommendations"):
                base["patrol_recommendations"] = ai["patrol_recommendations"]
            base["ai_analysis"] = ai
        except Exception:
            pass

    return base
