"""
AgriPulse AI — Transparent Crop Ranking Schemas.

Combines hard agronomic feasibility with multi-dimensional multi-attribute utility ranking:
1. Agronomic Feasibility Gatekeeper (Season, Water, Zone, Soil pH)
2. Transparent Economic & Operational Scoring:
   - Season & Climate Fit
   - Water Resilience & Irrigation Efficiency
   - Budget & Capital Efficiency
   - Crop Duration & Land Rotation Turnover
   - Expected Net-Return Scenarios (Conservative P25 & Base Median)
   - Downside Risk & Price Volatility Penalty
3. Explicit Non-Guaranteed Disclaimer & Unknown Field Preservation
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.suitability import CropSuitabilityAssessment, SuitabilityStatus


class CropRankScoreBreakdown(BaseModel):
    """Component-by-component scoring transparency (Max Total = 100)."""
    agronomic_fit_score: float = Field(..., description="Season, zone, and soil physical suitability (weight ~25%)")
    water_resilience_score: float = Field(..., description="Water requirement alignment with farmer source (weight ~20%)")
    economic_return_score: float = Field(..., description="Expected base-case profit & BCR efficiency (weight ~25%)")
    downside_risk_score: float = Field(..., description="Resistance to price crashes and capital loss (weight ~15%)")
    duration_turnover_score: float = Field(..., description="Crop duration fit with farming calendar (weight ~15%)")
    
    total_composite_score: float = Field(..., ge=0.0, le=100.0, description="Weighted composite transparent rank score")


class RankedCropItem(BaseModel):
    """An individual ranked crop with comprehensive transparency and explanation."""
    rank: int = Field(..., ge=1, description="Transparent ordinal ranking (1 = most aligned)")
    crop_code: str
    crop_name: str
    kannada_name: str
    category: str
    suitability_status: SuitabilityStatus
    hard_constraints_passed: bool
    
    # Transparent Composite Score
    composite_score: float = Field(..., ge=0.0, le=100.0)
    score_breakdown: CropRankScoreBreakdown
    
    # Financial Projections (Transparent Ranges)
    estimated_cost_per_acre_inr: float
    expected_base_net_return_inr: float
    expected_conservative_net_return_inr: float
    benefit_cost_ratio: float
    
    # Weather & Operational Context
    weather_operational_fit: str = Field(..., description="Contextual fit with upcoming 7-day weather conditions")
    
    # Explainability & Agronomic Auditing
    key_advantages: List[str] = Field(default_factory=list, description="Why this crop ranked high")
    key_risks_and_caveats: List[str] = Field(default_factory=list, description="Downside risks, pest vulnerabilities or capital requirements")
    missing_data_fields: List[str] = Field(default_factory=list, description="Preserved unverified inputs (e.g. soil test missing)")
    package_of_practices_ref: str
    source_citation: str


class TransparentRankingResponse(BaseModel):
    """Complete ranked recommendations response with explicit non-guaranteed disclaimers."""
    ranking_strategy: str = Field(
        default="Deterministic Agronomic Gatekeeper followed by Multi-Criteria Economic & Risk Utility Ranking",
        description="Explicit description of mathematical scoring methodology"
    )
    farmer_profile_summary: Dict[str, Any]
    weather_context_summary: Optional[Dict[str, Any]] = None
    market_freshness_summary: Optional[Dict[str, Any]] = None
    
    total_crops_evaluated: int
    ranked_recommendations: List[RankedCropItem] = Field(
        default_factory=list,
        description="Crops that passed hard feasibility checks, ordered by transparent score"
    )
    disqualified_crops: List[CropSuitabilityAssessment] = Field(
        default_factory=list,
        description="Crops that violated hard constraints (e.g. rainfed water deficit or out of season)"
    )
    
    non_guaranteed_disclaimer: str = Field(
        default=(
            "AgriPulse AI crop recommendations and profit projections are calculated estimates based on official historical "
            "government benchmarks, current weather conditions, and farmer-provided assumptions. Yields, prices, and profits "
            "are subject to weather anomalies, market volatility, and operational practices and are NEVER guaranteed."
        ),
        description="Strict legal and ethical agronomic disclaimer"
    )
