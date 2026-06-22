from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, Field

from app.services.scam_classifier import analyze_scam_session

router = APIRouter(prefix="/api/scam", tags=["Digital Arrest Scam Detection"])


class ScamAnalysisRequest(BaseModel):
    transcript: str = Field(..., min_length=10, description="Call transcript or script text")
    caller_number: str = ""
    victim_number: str = ""
    metadata: dict = Field(default_factory=dict)


@router.post("/analyze")
async def analyze_scam(req: ScamAnalysisRequest):
    result = await analyze_scam_session(
        req.transcript,
        req.caller_number,
        req.victim_number,
        req.metadata,
    )
    return {"success": True, "data": result}


@router.get("/demo-transcript")
async def demo_transcript():
    return {
        "transcript": (
            "Hello, this is Inspector Sharma from CBI Cyber Cell Delhi. "
            "Your Aadhaar-linked bank account has been flagged in a money laundering case. "
            "You are under digital arrest. Do not disconnect. Join this Google Meet link immediately "
            "for video verification. Transfer ₹85,000 to the RBI escrow account to clear your name. "
            "Do not tell your family — this is confidential. You have 2 hours."
        ),
        "caller_number": "+91-11-4821-XXXX",
        "metadata": {"caller_spoofed": True, "video_call_requested": True, "urgency_keywords": 4},
    }
