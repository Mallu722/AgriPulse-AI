"""
AgriPulse AI — Transparent Crop Ranking API Router.

Endpoints:
- POST /api/v1/ranking/recommend : Generates multi-criteria ranked crop recommendations
                                   with optional live weather context & farmer cost overrides.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.schemas.farmer_profile import FarmerProfile
from app.schemas.economics import CostOverrideInput
from app.schemas.ranking import TransparentRankingResponse
from app.agronomy.ranking_engine import TransparentRankingEngine
from app.core.weather_service import WeatherService

router = APIRouter(prefix="/ranking")
ranking_engine = TransparentRankingEngine()
weather_service = WeatherService()


class RankingRequest(BaseModel):
    """Payload for transparent crop recommendation ranking."""
    profile: FarmerProfile = Field(..., description="Farmer profile with land, water, season, and district")
    cost_overrides: Optional[CostOverrideInput] = Field(
        default=None,
        description="Optional farmer-specified cost overrides (labour, seeds, tractor, etc.)"
    )
    include_weather_context: bool = Field(
        default=True,
        description="Whether to incorporate near-term weather conditions into operational scoring"
    )


@router.post(
    "/recommend",
    response_model=TransparentRankingResponse,
    summary="Generate transparent multi-attribute crop recommendations",
    description=(
        "1. Strictly enforces agronomic feasibility gatekeeper (Season, Water, Zone, Soil pH). "
        "2. Disqualifies infeasible crops with detailed reasons. "
        "3. Computes multi-attribute transparent utility ranking (Agronomy 25%, Water Resilience 20%, "
        "Economic Returns 25%, Downside Risk Protection 15%, Crop Duration 15%). "
        "4. Integrates live short-term weather for near-term operational fit. "
        "5. Preserves unknown fields without hallucination and attaches explicit non-guaranteed disclaimers."
    )
)
async def recommend_ranked_crops(request: RankingRequest) -> TransparentRankingResponse:
    try:
        weather_resp = None
        if request.include_weather_context:
            try:
                weather_resp = await weather_service.get_weather(request.profile.district)
            except Exception:
                # Weather provider failure should never block agronomic crop ranking
                weather_resp = None

        ranked_response = ranking_engine.rank_crops(
            profile=request.profile,
            weather=weather_resp,
            cost_overrides=request.cost_overrides
        )
        return ranked_response
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to generate ranked recommendations: {str(e)}"
        )
