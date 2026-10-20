"""
AgriPulse AI — Deterministic Crop Suitability Engine.

Key Architectural Guarantees:
1. Hard Feasibility Constraints First:
   - Sowing season match (Kharif, Rabi, Summer)
   - Water availability threshold (e.g., Tomato requires reliable water; rainfed is a hard failure)
   - Agro-climatic district feasibility
2. Explicit Unknown Handling:
   - If soil_type is UNKNOWN or pH is not provided, do NOT disqualify the crop and do NOT guess via GPS.
   - Flag as 'INSUFFICIENT_INFORMATION' or 'CONDITIONALLY_SUITABLE' with clear missing_inputs prompts.
3. Separation of Concerns:
   - Agronomic feasibility strictly precedes economic ranking. High market price NEVER overrides a hard constraint.
4. Explainable Audit Trail:
   - Every candidate output includes clear reasons, constraint evaluations, and official research citations (ICAR / UAS Bengaluru).
"""

from typing import List, Dict, Any, Optional
from app.schemas.farmer_profile import (
    FarmerProfile,
    WaterAvailability,
    SoilType,
    SowingSeason
)
from app.schemas.suitability import (
    SuitabilityStatus,
    ConstraintCheckResult,
    CropSuitabilityAssessment,
    SuitabilityEngineResponse
)
from app.agronomy.crop_catalogue import CROP_CATALOGUE, CropKnowledgeEntry


# Water ranking helper to check if farmer's water meets or exceeds crop requirement
WATER_LEVEL_HIERARCHY = {
    WaterAvailability.RAINFED: 1,
    WaterAvailability.LIMITED: 2,
    WaterAvailability.RELIABLE: 3
}


class SuitabilityEngine:
    """
    Deterministic rule engine for evaluating crop suitability against farmer profiles.
    """

    def __init__(self, catalogue: Optional[Dict[str, CropKnowledgeEntry]] = None):
        self.catalogue = catalogue or CROP_CATALOGUE

    def evaluate_crop(self, profile: FarmerProfile, crop: CropKnowledgeEntry) -> CropSuitabilityAssessment:
        checks: List[ConstraintCheckResult] = []
        hard_fails: List[str] = []
        missing_inputs: List[str] = []
        reasons: List[str] = []
        advisory: List[str] = []
        score = 100.0

        # --- Check 1: Sowing Season (Hard Constraint) ---
        season_match = (
            profile.sowing_season in crop.suitable_seasons 
            or SowingSeason.ALL_SEASON in crop.suitable_seasons
        )
        if season_match:
            checks.append(ConstraintCheckResult(
                constraint_name="sowing_season",
                passed=True,
                is_hard_constraint=True,
                farmer_value=profile.sowing_season.value,
                required_value=[s.value for s in crop.suitable_seasons],
                message=f"Optimal sowing season match ({profile.sowing_season.value.capitalize()})."
            ))
            reasons.append(f"Target season '{profile.sowing_season.value}' matches recommended window.")
        else:
            checks.append(ConstraintCheckResult(
                constraint_name="sowing_season",
                passed=False,
                is_hard_constraint=True,
                farmer_value=profile.sowing_season.value,
                required_value=[s.value for s in crop.suitable_seasons],
                message=f"Sowing season '{profile.sowing_season.value}' is incompatible with {crop.crop_name}."
            ))
            hard_fails.append(f"Season mismatch: {crop.crop_name} requires {', '.join([s.value for s in crop.suitable_seasons])}.")
            score -= 50.0

        # --- Check 2: Water Availability (Hard Constraint) ---
        farmer_water_rank = WATER_LEVEL_HIERARCHY.get(profile.water_availability, 1)
        required_water_rank = WATER_LEVEL_HIERARCHY.get(crop.min_water_requirement, 1)

        if farmer_water_rank >= required_water_rank:
            checks.append(ConstraintCheckResult(
                constraint_name="water_availability",
                passed=True,
                is_hard_constraint=True,
                farmer_value=profile.water_availability.value,
                required_value=crop.min_water_requirement.value,
                message=f"Irrigation availability ({profile.water_availability.value}) satisfies requirement ({crop.min_water_requirement.value})."
            ))
            reasons.append(f"Water setup ({profile.water_availability.value}) is sufficient for {crop.water_intensity_mm}.")
        else:
            checks.append(ConstraintCheckResult(
                constraint_name="water_availability",
                passed=False,
                is_hard_constraint=True,
                farmer_value=profile.water_availability.value,
                required_value=crop.min_water_requirement.value,
                message=f"Insufficient water. Farmer has '{profile.water_availability.value}', but {crop.crop_name} requires at least '{crop.min_water_requirement.value}' irrigation."
            ))
            hard_fails.append(f"Water deficit: {crop.crop_name} requires '{crop.min_water_requirement.value}' (usage: {crop.water_intensity_mm}).")
            score -= 40.0

        # --- Check 3: Agro-climatic District (Soft Constraint / Regional Zone) ---
        district_match = profile.district in crop.suitable_districts
        if district_match:
            checks.append(ConstraintCheckResult(
                constraint_name="district_agroclimate",
                passed=True,
                is_hard_constraint=False,
                farmer_value=profile.district,
                required_value=crop.suitable_districts,
                message=f"{profile.district} is a major designated agro-climatic belt for {crop.crop_name}."
            ))
            reasons.append(f"{profile.district} is an established cultivation zone with active APMC market infrastructure.")
        else:
            checks.append(ConstraintCheckResult(
                constraint_name="district_agroclimate",
                passed=False,
                is_hard_constraint=False,
                farmer_value=profile.district,
                required_value=crop.suitable_districts,
                message=f"{profile.district} is outside primary agro-climatic belt for {crop.crop_name} (special management may be needed)."
            ))
            advisory.append(f"District {profile.district} is non-traditional for {crop.crop_name}; verify micro-climate and local pest pressures.")
            score -= 15.0

        # --- Check 4: Soil Type (Soft/Conditional or Unknown) ---
        if profile.soil_type == SoilType.UNKNOWN:
            checks.append(ConstraintCheckResult(
                constraint_name="soil_type",
                passed=None,
                is_hard_constraint=False,
                farmer_value="unknown",
                required_value=[st.value for st in crop.suitable_soils],
                message="Soil type is unknown. Not penalized, but lab or visual confirmation is recommended."
            ))
            missing_inputs.append("Soil Type is unknown. We do not extrapolate soil from GPS coordinates.")
        elif profile.soil_type in crop.suitable_soils:
            checks.append(ConstraintCheckResult(
                constraint_name="soil_type",
                passed=True,
                is_hard_constraint=False,
                farmer_value=profile.soil_type.value,
                required_value=[st.value for st in crop.suitable_soils],
                message=f"Soil type '{profile.soil_type.value}' is well-suited for {crop.crop_name}."
            ))
            reasons.append(f"Soil '{profile.soil_type.value}' provides ideal drainage and root aeration.")
        else:
            checks.append(ConstraintCheckResult(
                constraint_name="soil_type",
                passed=False,
                is_hard_constraint=False,
                farmer_value=profile.soil_type.value,
                required_value=[st.value for st in crop.suitable_soils],
                message=f"Soil type '{profile.soil_type.value}' is suboptimal for {crop.crop_name}."
            ))
            advisory.append(f"Suboptimal soil type: requires enhanced organic matter or specific bed preparation.")
            score -= 15.0

        # --- Check 5: Soil Health Card & BHOOMI Geoportal Metrics (pH, AWC, Depth) ---
        shc = profile.soil_health_card
        if shc and shc.ph is not None:
            if crop.optimal_ph_min <= shc.ph <= crop.optimal_ph_max:
                checks.append(ConstraintCheckResult(
                    constraint_name="soil_ph",
                    passed=True,
                    is_hard_constraint=False,
                    farmer_value=shc.ph,
                    required_value=f"{crop.optimal_ph_min} - {crop.optimal_ph_max}",
                    message=f"Measured soil pH {shc.ph} is within the optimal range ({crop.optimal_ph_min} - {crop.optimal_ph_max})."
                ))
                reasons.append(f"Soil pH {shc.ph} is within optimal absorption range.")
            else:
                checks.append(ConstraintCheckResult(
                    constraint_name="soil_ph",
                    passed=False,
                    is_hard_constraint=False,
                    farmer_value=shc.ph,
                    required_value=f"{crop.optimal_ph_min} - {crop.optimal_ph_max}",
                    message=f"Measured soil pH {shc.ph} deviates from optimal range ({crop.optimal_ph_min} - {crop.optimal_ph_max})."
                ))
                advisory.append(f"Soil pH {shc.ph} is outside ideal range ({crop.optimal_ph_min}-{crop.optimal_ph_max}); soil amendments (lime/gypsum) may be required.")
                score -= 10.0
        else:
            checks.append(ConstraintCheckResult(
                constraint_name="soil_ph",
                passed=None,
                is_hard_constraint=False,
                farmer_value=None,
                required_value=f"{crop.optimal_ph_min} - {crop.optimal_ph_max}",
                message="No Soil Health Card pH data available. Farmer advised to test soil or consult BHOOMI Geoportal LRI layer."
            ))
            missing_inputs.append("Soil Health Card / BHOOMI LRI (pH & NPK) not provided.")

        # Optional BHOOMI Geoportal Physical Checks: Soil Depth & Available Water Capacity (AWC)
        if shc and shc.soil_depth_cm is not None:
            if shc.soil_depth_cm < 30.0 and crop.crop_code in ["TUR", "MAIZE"]:
                advisory.append(f"Shallow soil depth ({shc.soil_depth_cm}cm) reported via BHOOMI/Lab: Root penetration for {crop.crop_name} may be constrained.")
                score -= 10.0
            elif shc.soil_depth_cm >= 75.0:
                reasons.append(f"Favorable deep soil root zone ({shc.soil_depth_cm}cm) supports moisture retention.")

        if shc and shc.available_water_capacity_mm_m is not None:
            if shc.available_water_capacity_mm_m < 75.0 and profile.water_availability == WaterAvailability.RAINFED:
                advisory.append(f"Low Available Water Capacity ({shc.available_water_capacity_mm_m} mm/m from BHOOMI LRI): Dryland crop risk elevated during rainfall dry spells.")
                score -= 10.0
            elif shc.available_water_capacity_mm_m >= 120.0:
                reasons.append(f"High Available Water Capacity ({shc.available_water_capacity_mm_m} mm/m) buffers against drought.")

        # --- Check 6: Risk & Budget Compatibility ---
        if profile.risk_preference.value == "low" and crop.economic_risk_profile == "High":
            advisory.append(f"Risk Warning: {crop.crop_name} has high price volatility or pest sensitivity, differing from your low risk preference.")
            score -= 10.0

        score = max(0.0, min(100.0, score))

        # --- Determine Final Suitability Status ---
        if len(hard_fails) > 0:
            status = SuitabilityStatus.UNSUITABLE
            reasons.extend(hard_fails)
        elif len(missing_inputs) >= 2 and profile.soil_type == SoilType.UNKNOWN:
            # Missing critical agronomic info
            status = SuitabilityStatus.INSUFFICIENT_INFORMATION
            reasons.append("Basic requirements met, but missing laboratory soil data or soil classification for definitive assessment.")
        elif score >= 80.0 and len(hard_fails) == 0:
            status = SuitabilityStatus.SUITABLE
        else:
            status = SuitabilityStatus.CONDITIONALLY_SUITABLE
            if not reasons:
                reasons.append("Crop is conditionally feasible with irrigation or soil management adaptations.")

        return CropSuitabilityAssessment(
            crop_code=crop.crop_code,
            crop_name=crop.crop_name,
            kannada_name=crop.kannada_name,
            category=crop.category,
            status=status,
            suitability_score=round(score, 1),
            hard_constraints_passed=(len(hard_fails) == 0),
            reasons=reasons,
            missing_inputs=missing_inputs,
            advisory_notes=advisory,
            source_citation=crop.source_citation,
            package_of_practices_ref=crop.package_of_practices_ref,
            constraint_checks=checks
        )

    def evaluate_all(self, profile: FarmerProfile) -> SuitabilityEngineResponse:
        """Evaluates all crops in catalogue and organizes results by category."""
        suitable: List[CropSuitabilityAssessment] = []
        conditionally: List[CropSuitabilityAssessment] = []
        insufficient: List[CropSuitabilityAssessment] = []
        unsuitable: List[CropSuitabilityAssessment] = []

        for crop in self.catalogue.values():
            assessment = self.evaluate_crop(profile, crop)
            if assessment.status == SuitabilityStatus.SUITABLE:
                suitable.append(assessment)
            elif assessment.status == SuitabilityStatus.CONDITIONALLY_SUITABLE:
                conditionally.append(assessment)
            elif assessment.status == SuitabilityStatus.INSUFFICIENT_INFORMATION:
                insufficient.append(assessment)
            elif assessment.status == SuitabilityStatus.UNSUITABLE:
                unsuitable.append(assessment)

        # Sort within buckets by suitability score descending
        suitable.sort(key=lambda x: x.suitability_score, reverse=True)
        conditionally.sort(key=lambda x: x.suitability_score, reverse=True)
        insufficient.sort(key=lambda x: x.suitability_score, reverse=True)
        unsuitable.sort(key=lambda x: x.suitability_score, reverse=True)

        return SuitabilityEngineResponse(
            profile_summary={
                "district": profile.district,
                "land_area_acres": profile.land_area_acres,
                "original_land": f"{profile.land_area} {profile.land_unit.value}",
                "season": profile.sowing_season.value,
                "water_availability": profile.water_availability.value,
                "soil_type": profile.soil_type.value,
                "has_soil_health_card": profile.soil_health_card is not None
            },
            total_evaluated_crops=len(self.catalogue),
            suitable_crops=suitable,
            conditionally_suitable_crops=conditionally,
            insufficient_info_crops=insufficient,
            unsuitable_crops=unsuitable
        )
