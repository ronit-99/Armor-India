import json
import re
from typing import Any

from openai import OpenAI

from app.config import settings


def get_client() -> OpenAI | None:
    if not settings.ai_enabled:
        return None
    return OpenAI(api_key=settings.effective_api_key)


def parse_json_response(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text)


async def chat_json(system: str, user: str, temperature: float = 0.2) -> dict[str, Any]:
    client = get_client()
    if not client:
        raise RuntimeError("OpenAI API key not configured")

    response = client.chat.completions.create(
        model=settings.openai_model,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return parse_json_response(content)


async def vision_json(system: str, user_text: str, image_b64: str, mime: str = "image/jpeg") -> dict[str, Any]:
    client = get_client()
    if not client:
        raise RuntimeError("OpenAI API key not configured")

    response = client.chat.completions.create(
        model=settings.openai_vision_model,
        temperature=0.1,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}},
                ],
            },
        ],
    )
    content = response.choices[0].message.content or "{}"
    return parse_json_response(content)
