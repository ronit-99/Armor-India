from fastapi import APIRouter
from openai import OpenAI
from pydantic import BaseModel, Field

from app.config import settings

router = APIRouter(prefix="/api/config", tags=["Configuration"])


class ApiKeyRequest(BaseModel):
    api_key: str = Field(..., min_length=10)


@router.get("/status")
async def config_status():
    runtime = getattr(settings, "_runtime_api_key", "")
    return {
        "success": True,
        "data": {
            "ai_enabled": settings.ai_enabled,
            "model": settings.openai_model,
            "has_env_key": bool(settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here"),
            "has_runtime_key": bool(runtime),
            "requirements": {
                "required": ["OpenAI API Key (for full AI features)"],
                "not_required": ["SQL database", "Other APIs", "Cloud hosting"],
                "optional": ["Custom OpenAI model names"],
            },
            "demo_mode": not settings.ai_enabled,
        },
    }


@router.post("/api-key")
async def set_api_key(req: ApiKeyRequest):
    key = req.api_key.strip()
    saved = settings.save_api_key_to_env(key)
    return {
        "success": True,
        "ai_enabled": settings.ai_enabled,
        "saved_to_env": saved,
        "message": "API key configured — AI features are now active" if settings.ai_enabled else "Invalid key",
    }


@router.post("/test")
async def test_api_key(req: ApiKeyRequest):
    key = req.api_key.strip()
    if not key or key == "your_openai_api_key_here":
        return {"success": False, "message": "Please provide a valid OpenAI API key"}

    try:
        client = OpenAI(api_key=key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Reply with exactly: OK"}],
            max_tokens=5,
        )
        reply = response.choices[0].message.content or ""
        settings.save_api_key_to_env(key)
        return {
            "success": True,
            "message": "API key works! AI features activated.",
            "test_reply": reply.strip(),
            "ai_enabled": settings.ai_enabled,
        }
    except Exception as e:
        return {"success": False, "message": f"API key test failed: {str(e)}"}
