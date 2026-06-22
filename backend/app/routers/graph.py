from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.fraud_graph import analyze_fraud_network, generate_evidence_package, build_graph

router = APIRouter(prefix="/api/graph", tags=["Fraud Network Intelligence"])


class GraphAnalysisRequest(BaseModel):
    context: str = ""


@router.get("/network")
async def get_fraud_network():
    result = await analyze_fraud_network()
    return {"success": True, "data": result}


@router.post("/analyze")
async def analyze_network(req: GraphAnalysisRequest):
    result = await analyze_fraud_network(req.context)
    return {"success": True, "data": result}


@router.get("/evidence-package")
async def get_evidence_package(cluster_id: str | None = Query(None)):
    g = build_graph()
    package = generate_evidence_package(g, cluster_id)
    return {"success": True, "data": package}
