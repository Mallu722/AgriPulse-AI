"""
AgriPulse AI — Suitability Response Schemas.

Structures the output of the deterministic suitability engine:
- Feasibility status: SUITABLE, CONDITIONALLY_SUITABLE, INSUFFICIENT_INFORMATION, UNSUITABLE
- Hard constraint evaluations (Season, Water, District, Soil pH)
- Transparent reasons, missing inputs, and official agronomic source evidence
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SuitabilityStatus(str, Enum):
    SUITABLE = "SUITABLE"
    CONDITIONALLY_SUITABLE = "CONDITIONALLY_SUITABLE"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"
    UNSUITABLE = "UNSUITABLE"


class ConstraintCheckResult(BaseModel):
    constraint_name: str  # e.g., "sowing_season", "water_availability", "soil_type", "soil_ph"
    passed: Optional[bool] = Field(None, description="True=pass, False=hard constraint violation, None=unknown/missing data")
    is_hard_constraint: bool = Field(True, description="If True and passed=False, crop is disqualified as UNSUITABLE")
    farmer_value: Any = Field(None, description="Value supplied in farmer profile")
    required_value: Any = Field(None, description="Value/range required by agronomic rules")
    message: str = Field(..., description="Human-readable explanation of check result")


class CropSuitabilityAssessment(BaseModel):
    crop_code: str
    crop_name: str
    kannada_name: str
    category: str
    status: SuitabilityStatus
    suitability_score: float = Field(..., ge=0.0, le=100.0, description="Agronomic fit score (0-100)")
    
    # Traceability & Explainability
    hard_constraints_passed: bool
    reasons: List[str] = Field(default_factory=list, description="Agronomic reasons for recommendation status")
    missing_inputs: List[str] = Field(default_factory=list, description="Fields that were unknown or omitted from profile")
    advisory_notes: List[str] = Field(default_factory=list, description="Agronomic guidance or risk caveats")
    
    # Official Source & Governance
    source_citation: str
    package_of_practices_ref: str
    constraint_checks: List[ConstraintCheckResult] = Field(default_factory=list)


class SuitabilityEngineResponse(BaseModel):
    profile_summary: Dict[str, Any]
    total_evaluated_crops: int
    suitable_crops: List[CropSuitabilityAssessment]
    conditionally_suitable_crops: List[CropSuitabilityAssessment]
    insufficient_info_crops: List[CropSuitabilityAssessment]
    unsuitable_crops: List[CropSuitabilityAssessment]
    rule_engine_version: str = "v1.0.0-deterministic"
    audit_trail: str = "Agronomic feasibility evaluated strictly before economic ranking."
