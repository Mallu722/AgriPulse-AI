"""
AgriPulse AI — Crop Suitability & Farmer Profile API Endpoints.

Provides:
- POST /api/v1/suitability/evaluate : Evaluates a farmer profile and returns rule-backed candidate recommendations
- GET  /api/v1/suitability/crops    : Lists the official agronomic crop catalogue with scientific citations
- GET  /api/v1/suitability/options  : Returns valid form options for frontend dropdowns
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List

from app.schemas.farmer_profile import (
    FarmerProfile,
    LandUnit,
    SowingSeason,
    WaterAvailability,
    RiskPreference,
    SoilType
)
from app.schemas.suitability import SuitabilityEngineResponse, CropSuitabilityAssessment
from app.agronomy.suitability_engine import SuitabilityEngine
from app.agronomy.crop_catalogue import CROP_CATALOGUE, CropKnowledgeEntry

router = APIRouter(prefix="/suitability")
engine = SuitabilityEngine()


@router.post(
    "/evaluate",
    response_model=SuitabilityEngineResponse,
    summary="Evaluate crop suitability for a farmer profile",
    description=(
        "Applies deterministic agronomic rules from UAS Bengaluru & ICAR. "
        "Separates hard constraints (season, water, agro-climatic zone) from soft constraints (pH, soil type). "
        "Explicitly handles unknown values without synthetic inference."
    )
)
async def evaluate_suitability(profile: FarmerProfile) -> SuitabilityEngineResponse:
    try:
        response = engine.evaluate_all(profile)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error evaluating farmer profile: {str(e)}"
        )


@router.get(
    "/crops",
    response_model=List[CropKnowledgeEntry],
    summary="Get verified crop knowledge catalogue",
    description="Returns official crop agronomic thresholds with ICAR / UAS Bengaluru literature citations."
)
async def get_crop_catalogue() -> List[CropKnowledgeEntry]:
    return list(CROP_CATALOGUE.values())


@router.get(
    "/options",
    summary="Get dynamic form dropdown options for farmer profile",
    description="Returns allowable enums, units, seasons, and typical Karnataka districts for UI selection."
)
async def get_profile_options() -> Dict[str, Any]:
    return {
        "land_units": [u.value for u in LandUnit],
        "sowing_seasons": [
            {"value": SowingSeason.KHARIF.value, "label": "Kharif (Monsoon: June - Oct)"},
            {"value": SowingSeason.RABI.value, "label": "Rabi (Winter: Oct - March)"},
            {"value": SowingSeason.SUMMER.value, "label": "Summer (Zaid: March - June)"},
            {"value": SowingSeason.ALL_SEASON.value, "label": "All Season / Perennial"},
        ],
        "water_availability": [
            {"value": WaterAvailability.RAINFED.value, "label": "Rainfed (Dependent on seasonal rains)"},
            {"value": WaterAvailability.LIMITED.value, "label": "Limited (Canal / Seasonal Borewell / Protective)"},
            {"value": WaterAvailability.RELIABLE.value, "label": "Reliable (Perennial Borewell / Drip Irrigation)"},
        ],
        "risk_preferences": [
            {"value": RiskPreference.LOW.value, "label": "Low Risk (Staple food grains, stable demand)"},
            {"value": RiskPreference.MODERATE.value, "label": "Moderate Risk (Commercial pulses/cereals)"},
            {"value": RiskPreference.HIGH.value, "label": "High Risk (High-value horticulture, volatile prices)"},
        ],
        "soil_types": [
            {"value": SoilType.RED_SANDY_LOAM.value, "label": "Red Sandy Loam (Southern Karnataka)"},
            {"value": SoilType.BLACK_COTTON.value, "label": "Black Cotton Soil (Northern Karnataka)"},
            {"value": SoilType.LATERITE.value, "label": "Laterite Soil (Coastal / Malnad)"},
            {"value": SoilType.ALLUVIAL.value, "label": "Alluvial Soil (River Basins)"},
            {"value": SoilType.CLAY_LOAM.value, "label": "Clay Loam"},
            {"value": SoilType.SANDY.value, "label": "Sandy Soil"},
            {"value": SoilType.UNKNOWN.value, "label": "Unknown / Unverified (Do not guess)"},
        ],
        "karnataka_districts": [
            "Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", 
            "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", 
            "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", 
            "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", 
            "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", 
            "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", 
            "Udupi", "Uttara Kannada", "Vijayapura (Bijapur)", "Yadgir"
        ]
    }
