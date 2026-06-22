from fastapi import APIRouter, Query

from app.services.geospatial import get_geospatial_intel, get_patrol_recommendations

router = APIRouter(prefix="/api/geo", tags=["Geospatial Crime Intelligence"])


@router.get("/hotspots")
async def get_hotspots():
    data = get_geospatial_intel()
    return {"success": True, "data": data}


@router.get("/patrol-recommendations")
async def patrol_recommendations(query: str = Query("", description="Optional query for AI recommendations")):
    data = await get_patrol_recommendations(query)
    return {"success": True, "data": data}
