from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.citizen_shield import citizen_fraud_shield_chat, LANGUAGES

router = APIRouter(prefix="/api/citizen", tags=["Citizen Fraud Shield"])


class CitizenChatRequest(BaseModel):
    message: str = Field(..., min_length=3)
    language: str = "en"
    channel: str = "app"


@router.post("/chat")
async def citizen_chat(req: CitizenChatRequest):
    result = await citizen_fraud_shield_chat(req.message, req.language, req.channel)
    return {"success": True, "data": result}


@router.get("/languages")
async def get_languages():
    return {"languages": [{"code": k, "name": v} for k, v in LANGUAGES.items()]}
