"""
AgriPulse AI — Economics & Profit Scenarios API Router.

Endpoints:
- POST /api/v1/economics/scenarios : Evaluates conservative, base, and optimistic profit scenarios
- GET  /api/v1/economics/baseline/{crop_code} : Fetches official government cost breakdown for a crop
- GET  /api/v1/economics/crops : Lists all crops with available official economic baselines
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List

from app.schemas.economics import (
    EconomicsScenarioRequest,
    EconomicsScenarioResponse,
    CostCategoryBreakdown
)
from app.economics.profit_engine import EconomicsEngine
from app.economics.cost_baselines import OFFICIAL_CROP_ECONOMICS

router = APIRouter(prefix="/economics")
engine = EconomicsEngine()


@router.post(
    "/scenarios",
    response_model=EconomicsScenarioResponse,
    summary="Calculate transparent crop profit scenarios",
    description=(
        "Calculates Conservative (P25), Base (Median), and Optimistic (P75) financial projections. "
        "Strictly verifies unit mathematical consistency. "
        "Incorporates chronological forecast backtesting against naive baselines and permits user cost overrides."
    )
    )
async def calculate_crop_scenarios(request: EconomicsScenarioRequest) -> EconomicsScenarioResponse:
    try:
        response = engine.calculate_scenarios(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to calculate economics scenarios: {str(e)}")


@router.get(
    "/baseline/{crop_code}",
    summary="Get official government cost baseline for a crop",
    description="Returns official DESAgri / UAS Bengaluru per-acre cost breakdowns and report year."
)
async def get_crop_baseline(crop_code: str) -> Dict[str, Any]:
    code = crop_code.strip().upper()
    if code not in OFFICIAL_CROP_ECONOMICS:
        raise HTTPException(
            status_code=404,
            detail=f"Crop code '{crop_code}' not found. Available: {list(OFFICIAL_CROP_ECONOMICS.keys())}"
        )
    ref = OFFICIAL_CROP_ECONOMICS[code]
    return {
        "crop_code": ref.crop_code,
        "crop_name": ref.crop_name,
        "report_year": ref.report_year,
        "source_citation": ref.source_citation,
        "cost_breakdown_inr_per_acre": ref.costs.model_dump(),
        "total_production_cost_per_acre": ref.costs.total_production_cost_per_acre,
        "historical_quantiles": {
            "yield_p25_qtl_acre": ref.yield_p25,
            "yield_median_qtl_acre": ref.yield_median,
            "yield_p75_qtl_acre": ref.yield_p75
        }
    }


@router.get(
    "/crops",
    summary="List crops with available economic baselines",
    description="Returns list of crops supported by the economics engine."
)
async def list_economic_crops() -> List[Dict[str, Any]]:
    return [
        {
            "crop_code": ref.crop_code,
            "crop_name": ref.crop_name,
            "report_year": ref.report_year,
            "source_citation": ref.source_citation,
            "typical_production_cost_per_acre": ref.costs.total_production_cost_per_acre
        }
        for ref in OFFICIAL_CROP_ECONOMICS.values()
    ]


@router.get(
    "/district-benchmarks",
    summary="Get 31-district Karnataka labour and tractor rental benchmarks",
    description="Returns prevailing market labour wages (general/skilled/gender) and tractor custom hire from verified official CSV."
)
async def get_district_benchmarks() -> Dict[str, Any]:
    from pathlib import Path
    import pandas as pd
    import json
    
    csv_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "karnataka_district_labour_benchmarks.csv"
    json_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "karnataka_district_cost_benchmarks.json"
    
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        districts_map = {}
        for _, row in df.iterrows():
            d_name = str(row["District"]).strip()
            # Standardize alternative spellings (e.g., Bagalkote -> Bagalkot)
            normalized_name = d_name.replace("Bagalkote", "Bagalkot").replace("Chikkaballapura", "Chikkaballapur")
            districts_map[normalized_name] = {
                "district": normalized_name,
                "labour_general_male": float(row["General agri labour male ₹/day"]),
                "labour_general_female": float(row["General agri labour female ₹/day"]),
                "labour_plough_tilling": float(row["Plough/tilling male ₹/day"]),
                "labour_sowing_male": float(row["Sowing male ₹/day"]),
                "labour_harvesting_male": float(row["Harvesting male ₹/day"]),
                "labour_harvesting_female": float(row["Harvesting female ₹/day"]),
                "labour_plant_protection": float(row["Plant protection male ₹/day"]),
                # Blended average daily wage for operational planning (~22-25 days/acre)
                "labour_general": round((float(row["General agri labour male ₹/day"]) + float(row["General agri labour female ₹/day"])) / 2.0, 1),
                "labour_skilled": round(float(row["Plough/tilling male ₹/day"]), 1),
                "tomato_labour_ref_per_acre": float(row["Tomato labour ref ₹/acre"]),
                "tomato_machine_labour_ref_per_acre": float(row["Tomato machine labour ref ₹/acre"]),
                "tractor_chc": 650.0,
                "tractor_rotavator": 1150.0,
                "data_source_status": str(row["Default data status"])
            }
        return {
            "state": "Karnataka",
            "source": "State Labour Commissioner & DESAgri Official Wage Survey CSV",
            "total_districts": len(districts_map),
            "districts": districts_map
        }
    elif json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Benchmark data file not found"}
