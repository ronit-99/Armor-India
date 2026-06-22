from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import scam, counterfeit, graph, geospatial, citizen, config

app = FastAPI(
    title=settings.app_name,
    description="AI-powered Digital Public Safety Intelligence Platform",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config.router)
app.include_router(scam.router)
app.include_router(counterfeit.router)
app.include_router(graph.router)
app.include_router(geospatial.router)
app.include_router(citizen.router)


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "ai_enabled": settings.ai_enabled,
        "model": settings.openai_model if settings.ai_enabled else "rule_based_fallback",
        "modules": [
            "Digital Arrest Scam Detection",
            "Counterfeit Currency Identification",
            "Fraud Network Graph Intelligence",
            "Geospatial Crime Pattern Intelligence",
            "Citizen Fraud Shield",
        ],
    }


@app.get("/api/dashboard/stats")
async def dashboard_stats():
    return {
        "success": True,
        "data": {
            "threats_neutralized": 1247,
            "active_alerts": 23,
            "fraud_score_avg": 72.4,
            "counterfeit_detected": 89,
            "citizens_protected": 45000,
            "networks_mapped": 17,
            "mha_alerts_generated": 156,
            "false_positive_rate": 2.1,
            "lead_time_days": 4.2,
        },
    }
