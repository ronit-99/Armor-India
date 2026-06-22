from fastapi import APIRouter, File, Form, UploadFile

from app.services.counterfeit_cv import analyze_currency_note

router = APIRouter(prefix="/api/counterfeit", tags=["Counterfeit Currency Detection"])


@router.post("/analyze")
async def analyze_note(
    file: UploadFile = File(...),
    denomination: int | None = Form(None),
):
    content = await file.read()
    mime = file.content_type or "image/jpeg"
    result = await analyze_currency_note(content, denomination, mime)
    return {"success": True, "data": result}


@router.get("/denominations")
async def list_denominations():
    return {
        "denominations": [10, 20, 50, 100, 200, 500],
        "features_checked": [
            "Microprint analysis",
            "Security thread verification",
            "Serial number pattern validation",
            "UV feature simulation",
            "Watermark detection",
            "Latent image verification",
        ],
    }
