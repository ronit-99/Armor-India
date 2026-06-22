from typing import Any

import networkx as nx

from app.config import settings
from app.services.ai_service import chat_json

# Seeded demo fraud network — Delhi NCR digital arrest ring
SEED_NODES = [
    {"id": "v1", "type": "victim", "label": "Victim Cluster (Delhi)", "district": "New Delhi", "reports": 47},
    {"id": "v2", "type": "victim", "label": "Victim Cluster (Noida)", "district": "Gautam Buddha Nagar", "reports": 31},
    {"id": "v3", "type": "victim", "label": "Victim Cluster (Gurgaon)", "district": "Gurugram", "reports": 22},
    {"id": "s1", "type": "scammer", "label": "Spoof Call Center A", "district": "Jamtara", "infrastructure": "VoIP"},
    {"id": "s2", "type": "scammer", "label": "Script Handler B", "district": "Cyberabad", "infrastructure": "Telegram"},
    {"id": "m1", "type": "mule", "label": "Mule Account X", "district": "Mumbai", "accounts": 8},
    {"id": "m2", "type": "mule", "label": "Mule Account Y", "district": "Kolkata", "accounts": 5},
    {"id": "m3", "type": "mule", "label": "Mule Account Z", "district": "Bengaluru", "accounts": 12},
    {"id": "d1", "type": "device", "label": "Device Fingerprint #A3F2", "district": "Unknown", "fingerprints": 156},
    {"id": "d2", "type": "device", "label": "Device Fingerprint #B7K1", "district": "Unknown", "fingerprints": 89},
    {"id": "p1", "type": "phone", "label": "+91-11-XXXX-4821", "district": "Spoofed", "calls": 234},
    {"id": "p2", "type": "phone", "label": "+91-79-XXXX-9103", "district": "Ahmedabad", "calls": 167},
]

SEED_EDGES = [
    {"source": "p1", "target": "s1", "type": "call", "weight": 234, "label": "Outbound calls"},
    {"source": "p2", "target": "s1", "type": "call", "weight": 167, "label": "Outbound calls"},
    {"source": "s1", "target": "s2", "type": "coordination", "weight": 95, "label": "Script relay"},
    {"source": "s2", "target": "v1", "type": "scam", "weight": 47, "label": "Digital arrest"},
    {"source": "s2", "target": "v2", "type": "scam", "weight": 31, "label": "Digital arrest"},
    {"source": "s2", "target": "v3", "type": "scam", "weight": 22, "label": "Digital arrest"},
    {"source": "v1", "target": "m1", "type": "transaction", "weight": 38, "label": "UPI transfer"},
    {"source": "v2", "target": "m2", "type": "transaction", "weight": 24, "label": "UPI transfer"},
    {"source": "v3", "target": "m3", "type": "transaction", "weight": 18, "label": "UPI transfer"},
    {"source": "d1", "target": "s1", "type": "device_link", "weight": 156, "label": "Same device"},
    {"source": "d2", "target": "s2", "type": "device_link", "weight": 89, "label": "Same device"},
    {"source": "m1", "target": "m2", "type": "mule_chain", "weight": 12, "label": "Fund routing"},
    {"source": "m2", "target": "m3", "type": "mule_chain", "weight": 8, "label": "Fund routing"},
]


def build_graph() -> nx.Graph:
    g = nx.Graph()
    for node in SEED_NODES:
        g.add_node(node["id"], **node)
    for edge in SEED_EDGES:
        g.add_edge(edge["source"], edge["target"], **{k: v for k, v in edge.items() if k not in ("source", "target")})
    return g


def detect_clusters(g: nx.Graph) -> list[dict[str, Any]]:
    communities = list(nx.community.greedy_modularity_communities(g))
    clusters = []
    for i, community in enumerate(communities):
        nodes = list(community)
        node_types = [g.nodes[n].get("type", "unknown") for n in nodes]
        clusters.append({
            "cluster_id": f"C{i + 1}",
            "size": len(nodes),
            "node_ids": nodes,
            "composition": {
                "victims": sum(1 for t in node_types if t == "victim"),
                "scammers": sum(1 for t in node_types if t == "scammer"),
                "mules": sum(1 for t in node_types if t == "mule"),
                "devices": sum(1 for t in node_types if t in ("device", "phone")),
            },
            "risk_score": min(100, len(nodes) * 8 + sum(1 for t in node_types if t == "mule") * 15),
        })
    return sorted(clusters, key=lambda c: c["risk_score"], reverse=True)


def graph_to_response(g: nx.Graph) -> dict[str, Any]:
    clusters = detect_clusters(g)
    return {
        "nodes": [{"id": n, **g.nodes[n]} for n in g.nodes],
        "edges": [
            {"source": u, "target": v, **g.edges[u, v]}
            for u, v in g.edges
        ],
        "clusters": clusters,
        "stats": {
            "total_nodes": g.number_of_nodes(),
            "total_edges": g.number_of_edges(),
            "density": round(nx.density(g), 4),
            "avg_clustering": round(nx.average_clustering(g), 4),
        },
        "lead_time_days": 4.2,
        "campaign_id": "FRAUD-NET-2024-DA-017",
    }


def generate_evidence_package(g: nx.Graph, cluster_id: str | None = None) -> dict[str, Any]:
    clusters = detect_clusters(g)
    target = clusters[0] if not cluster_id else next((c for c in clusters if c["cluster_id"] == cluster_id), clusters[0])

    return {
        "package_id": f"EVD-{target['cluster_id']}-{hash(str(target['node_ids'])) % 10000:04d}",
        "generated_at": "2025-06-22T10:00:00Z",
        "cluster": target,
        "chain_of_custody": [
            {"step": 1, "action": "Graph ingestion from NCRB + telecom CDR metadata", "hash": "sha256:a3f2..."},
            {"step": 2, "action": "Entity resolution & device fingerprint correlation", "hash": "sha256:b7k1..."},
            {"step": 3, "action": "Community detection (Louvain modularity)", "hash": "sha256:c9m4..."},
            {"step": 4, "action": "Intelligence package sealed for court submission", "hash": "sha256:d1p8..."},
        ],
        "legal_admissibility": {
            "audit_trail": True,
            "immutable_hashes": True,
            "methodology_documented": True,
            "compliant_standards": ["IT Act 2000", "BSA 1872 (electronic records)", "NCRB cybercrime protocol"],
        },
        "recommended_actions": [
            "Freeze mule accounts M1, M2, M3 via I4C portal",
            "Issue telecom trace order for spoofed numbers",
            "Coordinate inter-state raid on Jamtara call center node",
        ],
        "estimated_prevented_loss_inr": target["size"] * 250000,
    }


async def analyze_fraud_network(additional_context: str = "") -> dict[str, Any]:
    g = build_graph()
    result = graph_to_response(g)

    if settings.ai_enabled and additional_context:
        try:
            system = """You are a fraud network intelligence analyst. Given graph stats and context,
return JSON with: intelligence_summary (string), threat_assessment (string),
recommended_actions (array), lead_time_estimate_days (float), confidence (0-1)."""
            user = f"Graph stats: {result['stats']}, Clusters: {len(result['clusters'])}. Context: {additional_context}"
            ai_insight = await chat_json(system, user)
            result["ai_insight"] = ai_insight
        except Exception:
            pass

    result["evidence_package"] = generate_evidence_package(g)
    return result
